import fitz  
import os
import asyncio
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEndpointEmbeddings
from langchain_pinecone import PineconeVectorStore
from groq import AsyncGroq

groq_client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))

class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=150, 
            separators=["\n\n", "\n", ".", " "]
        )

        self.pinecone_key = os.getenv("PINECONE_API_KEY")
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.hf_token = os.getenv("HF_TOKEN")

        if not self.groq_key:
            raise ValueError("GROQ_API_KEY is not set in the environment.")
        if not self.hf_token:
            raise ValueError("HF_TOKEN is not set in the environment.")

        self.embeddings = HuggingFaceEndpointEmbeddings(
            model="BAAI/bge-large-en-v1.5",
            huggingfacehub_api_token=self.hf_token,
            task="feature-extraction"
        )

    def extract_text_from_memory(self, file_bytes: bytes) -> str:
        """Extracts text from a PDF stream in RAM."""
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text

    def create_chunks(self, text: str):
        return self.text_splitter.split_text(text)
    
    async def save_to_pinecone(self, chunks: list, index_name: str, namespace: str):
        """Uploads text chunks to Pinecone cloud."""
        vectorstore = PineconeVectorStore.from_texts(
            texts=chunks,
            index_name=index_name,
            embedding=self.embeddings,
            namespace=namespace,
            pinecone_api_key=self.pinecone_key  
        )
        return vectorstore
    
    @staticmethod
    async def _call_groq_with_retry(
        system_instruction: str,
        content: str,
        model: str = "llama-3.3-70b-versatile",
        retries: int = 3,
    ) -> tuple[str, str]:
        last_error = None
        for attempt in range(retries):
            try:
                response = await groq_client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": f"<transcript>\n{content}\n</transcript>"},
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"} 
                )
                return  response.choices[0].message.content
            except Exception as e:
                last_error = e
                if attempt < retries - 1:
                    await asyncio.sleep(2 ** attempt)
        return f'{{"error": "{str(last_error)}"}}'
    
    async def analyze_contract(self, filename: str):
        
        vectorstore = PineconeVectorStore(
            index_name=os.getenv("PINECONE_INDEX_NAME"),
            embedding=self.embeddings,
            namespace=filename,
            pinecone_api_key=self.pinecone_key 
        )

        query = "Identify clauses regarding data ownership, hidden fees, arbitration, and cancellation penalties."
        relevant_docs = vectorstore.similarity_search(query, k=5)
        context_text = "\n\n".join([doc.page_content for doc in relevant_docs])


        system_prompt = """
        You are a helpful 'Legalese Translator'. You will be provided snippets from a legal contract.
        
        TASK:
        1. Find any 'Red Flags' (scary stuff that hurts the user).
        2. Explain each flag like the user is 5 years old. 
        3. Use a tone that is protective but simple.
        
        FORMAT YOUR RESPONSE AS STRICT JSON:
        {
            "risk_score": 8,
            "flags": [
                { "clause_title": "...", "simple_explanation": "...", "severity": "High/Med" }
            ]
        }
        """

        results = await asyncio.gather(
            DocumentProcessor._call_groq_with_retry(
                system_instruction=system_prompt,
                content=context_text,
                model="llama-3.3-70b-versatile",
            )
        )

        # asyncio.gather returns a list! We must return the first item.
        return results[0]