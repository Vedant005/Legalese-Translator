import fitz  
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI

class DocumentProcessor:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=150, 
            separators=["\n\n", "\n", ".", " "]
        )

        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.pinecone_key = os.getenv("PINECONE_API_KEY")

        if not self.google_api_key:
            raise ValueError("GOOGLE_API_KEY is not set in the environment. Check your .env file.")

        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-001",
            output_dimensionality=768,
            google_api_key=self.google_api_key
        )

    def extract_text_from_memory(self, file_bytes: bytes) -> str:
        """Extracts text from a PDF stream in RAM."""
        # Open the PDF directly from the byte stream
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

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=self.google_api_key,
            temperature=0
        )

        prompt = f"""
        You are a helpful 'Legalese Translator'. Below is a snippet from a legal contract.
        
        TASK:
        1. Find any 'Red Flags' (scary stuff that hurts the user).
        2. Explain each flag like the user is 5 years old. 
        3. Use a tone that is protective but simple.
        
        CONTRACT SNIPPETS:
        {context_text}
        
        FORMAT YOUR RESPONSE AS JSON:
        {{
            "risk_score": (1-10),
            "flags": [
                {{ "clause_title": "...", "simple_explanation": "...", "severity": "High/Med" }}
            ]
        }}
        """
        
        response = await llm.ainvoke(prompt)
        return response.content