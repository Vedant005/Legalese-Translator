import fitz
import os
import re
from langchain_voyageai import VoyageAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_groq import ChatGroq
from langchain.retrievers import MultiQueryRetriever
from langchain_core.documents import Document
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever

# ─── Legal Section Patterns ───────────────────────────────────────────────────
# Matches headings like "Section 4.", "Article III", "CLAUSE 2 -", "4.1 Fees"
SECTION_PATTERN = re.compile(
    r'(?=(?:section|article|clause|part|exhibit|schedule|appendix)\s+[\dIVXivx]+|^\d+\.\d*\s+[A-Z])',
    re.IGNORECASE | re.MULTILINE
)

class DocumentProcessor:
    def __init__(self):
        self.voyage_key = os.getenv("VOYAGE_API_KEY")
        self.pinecone_key = os.getenv("PINECONE_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")

        if not self.voyage_key:
            raise ValueError("VOYAGE_API_KEY is not set. Check your .env file.")
        if not self.groq_key:
            raise ValueError("GROQ_API_KEY is not set. Check your .env file.")

        # voyage-law-2: purpose-built for legal text, 1024-dim vectors
        self.embeddings = VoyageAIEmbeddings(
            model="voyage-law-2",
            voyage_api_key=self.voyage_key,
            batch_size=8          # voyage-law-2 recommended batch size
        )

    # ─── PDF Extraction ───────────────────────────────────────────────────────

    def extract_text_from_memory(self, file_bytes: bytes) -> str:
        """Extracts text from a PDF byte stream in RAM."""
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for page in doc:
            pages.append(page.get_text())
        doc.close()
        # Join pages with a clear page boundary marker so the splitter can use it
        return "\n\n[PAGE_BREAK]\n\n".join(pages)

    # ─── Section-Aware Chunking ───────────────────────────────────────────────

    def _split_into_sections(self, text: str) -> list[str]:
        """
        Stage 1: Split on legal section headings (Section X, Article Y, etc.)
        Each split becomes a 'parent' section.
        """
        splits = SECTION_PATTERN.split(text)
        # Remove empty/whitespace-only splits
        return [s.strip() for s in splits if s and len(s.strip()) > 50]

    def _create_child_chunks(self, section: str, max_chars: int = 600) -> list[str]:
        """
        Stage 2: Split each parent section into smaller child chunks
        for precise retrieval. Respects sentence boundaries.
        """
        # Split on sentence endings: period/semicolon followed by whitespace
        sentences = re.split(r'(?<=[.;])\s+', section)

        chunks = []
        current = ""
        for sentence in sentences:
            if len(current) + len(sentence) <= max_chars:
                current += " " + sentence
            else:
                if current.strip():
                    chunks.append(current.strip())
                current = sentence
        if current.strip():
            chunks.append(current.strip())

        return chunks

    def create_chunks(self, text: str) -> list[dict]:
        """
        Parent-Child chunking strategy:
        - Parent = full legal section (for context)
        - Child  = sentence-level sub-chunk (for retrieval precision)

        Returns a list of dicts: { "text": ..., "parent": ..., "section_index": ... }
        """
        sections = self._split_into_sections(text)
        all_chunks = []

        for i, section in enumerate(sections):
            children = self._create_child_chunks(section)
            for child in children:
                all_chunks.append({
                    "text": child,
                    "parent": section,   # Full section stored as metadata
                    "section_index": i
                })

        # Fallback: if no legal headings found, use sentence-based splitting
        if not all_chunks:
            print("[WARN] No legal section headings detected. Falling back to sentence chunking.")
            children = self._create_child_chunks(text, max_chars=500)
            all_chunks = [{"text": c, "parent": c, "section_index": 0} for c in children]

        return all_chunks

    # ─── Pinecone Storage ─────────────────────────────────────────────────────

    async def save_to_pinecone(self, chunks: list[dict], index_name: str, namespace: str):
        """
        Embeds child chunk text, but stores the parent section as metadata.
        At retrieval time we return the parent for richer LLM context.
        """
        texts = [c["text"] for c in chunks]
        metadatas = [
            {
                "parent": c["parent"],
                "section_index": c["section_index"]
            }
            for c in chunks
        ]

        vectorstore = PineconeVectorStore.from_texts(
            texts=texts,
            metadatas=metadatas,
            index_name=index_name,
            embedding=self.embeddings,
            namespace=namespace,
            pinecone_api_key=self.pinecone_key
        )
        return vectorstore

    # ─── Hybrid Retrieval + Groq LLM Analysis ─────────────────────────────────

    async def analyze_contract(self, namespace: str):
        """
        Retrieval strategy:
          1. Dense retrieval  — voyage-law-2 vectors via Pinecone (semantic)
          2. Sparse retrieval — BM25 over fetched docs (keyword/exact-match)
          3. Ensemble         — merges both with weighted scoring (60/40)
          4. MultiQuery       — LLM generates query variants to reduce blind spots
          5. Parent expansion — swap child chunks for their full parent sections
        """

        # ── Step 1: Dense retriever (Pinecone) ───────────────────────────────
        vectorstore = PineconeVectorStore(
            index_name=os.getenv("PINECONE_INDEX_NAME"),
            embedding=self.embeddings,
            namespace=namespace,
            pinecone_api_key=self.pinecone_key
        )
        dense_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

        # ── Step 2: Prime BM25 with a broad dense fetch ───────────────────────
        # We seed BM25 with a broad pull of 20 docs so it has a keyword corpus
        seed_query = "fees penalties termination arbitration data liability"
        seed_docs = vectorstore.similarity_search(seed_query, k=20)
        bm25_retriever = BM25Retriever.from_documents(seed_docs)
        bm25_retriever.k = 10

        # ── Step 3: Ensemble — hybrid dense + sparse ──────────────────────────
        ensemble_retriever = EnsembleRetriever(
            retrievers=[dense_retriever, bm25_retriever],
            weights=[0.6, 0.4]      # Lean on semantic, supplement with keyword
        )

        # ── Step 4: MultiQuery — LLM rewrites query into variants ─────────────
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            api_key=self.groq_key,
            temperature=0
        )

        multi_query_retriever = MultiQueryRetriever.from_llm(
            retriever=ensemble_retriever,
            llm=llm
        )

        # Core legal risk query
        primary_query = (
            "Identify all clauses related to: data ownership and sharing, "
            "hidden or recurring fees, mandatory arbitration, cancellation "
            "penalties, auto-renewal, liability limitations, and indemnification."
        )
        retrieved_docs = await multi_query_retriever.ainvoke(primary_query)

        # ── Step 5: Parent expansion ──────────────────────────────────────────
        # Replace each child chunk with its full parent section for richer context
        # Deduplicate by section_index so we don't repeat the same section twice
        seen_sections = set()
        expanded_contexts = []

        for doc in retrieved_docs:
            section_idx = doc.metadata.get("section_index", -1)
            if section_idx not in seen_sections:
                seen_sections.add(section_idx)
                # Use parent (full section) if available, else fall back to child
                parent_text = doc.metadata.get("parent", doc.page_content)
                expanded_contexts.append(parent_text)

        context_text = "\n\n---\n\n".join(expanded_contexts)

        # ── Step 6: Groq LLaMA analysis ───────────────────────────────────────
        prompt = f"""
        You are a helpful 'Legalese Translator'. Below are relevant sections from a legal contract.

        TASK:
        1. Find any 'Red Flags' (clauses that could hurt or surprise the user).
        2. Explain each flag simply — like the user is 5 years old.
        3. Be protective, clear, and avoid legal jargon.

        CONTRACT SECTIONS:
        {context_text}

        FORMAT YOUR RESPONSE AS STRICT JSON (no markdown, no extra text):
        {{
            "risk_score": <integer 1-10>,
            "summary": "<one sentence plain-English summary of the contract's overall risk>",
            "flags": [
                {{
                    "clause_title": "<short name of the clause>",
                    "simple_explanation": "<plain English explanation>",
                    "severity": "High | Med | Low",
                    "quote": "<exact short quote from the contract that triggered this flag>"
                }}
            ]s
        }}
        """

        response = await llm.ainvoke(prompt)
        return response.content