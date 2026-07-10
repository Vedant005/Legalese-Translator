# ⚖️ Legalese

**Legalese** is an AI-powered legal document analysis tool that transforms complex legal language into simple, easy-to-understand English. It helps non-lawyers quickly identify hidden risks, unfair clauses, and important obligations in contracts, privacy policies, and terms of service.

Instead of reading pages of confusing legal jargon, users simply upload a PDF document, and the application automatically highlights potential red flags with plain-English explanations and an overall risk score.

---

# Features

-  Upload legal documents in PDF format
-  Automatic text extraction
-  Intelligent document chunking
-  Semantic search using vector embeddings
-  AI-powered legal risk analysis
-  Identification of risky clauses
-  Plain-English explanations ("Explain Like I'm 5")
-  Overall contract risk score
-  Cloud-based vector storage using Pinecone
-  Retry mechanism for AI reliability
-  Modern responsive frontend built with Next.js

---

# System Architecture

```text
                   User
                     │
                     ▼
          Next.js Frontend (Upload UI)
                     │
                     ▼
              FastAPI Backend
                     │
          Upload PDF Document
                     │
                     ▼
           Text Extraction (PyMuPDF)
                     │
                     ▼
        Recursive Text Chunking
                     │
                     ▼
    HuggingFace Embedding Generation
                     │
                     ▼
         Pinecone Vector Database
                     │
                     ▼
         Semantic Similarity Search
                     │
                     ▼
      Retrieve Relevant Legal Clauses
                     │
                     ▼
          Groq Llama 3.3 70B Model
                     │
                     ▼
     AI Legal Risk Analysis (JSON)
                     │
                     ▼
         Risk Score + Red Flags
                     │
                     ▼
          Interactive Web Interface
```

---

# Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Zustand
- Tailwind CSS
- Lucide React Icons

## Backend

- FastAPI
- Python
- AsyncIO
- Pydantic

## AI & Machine Learning

- Groq API
- Llama 3.3 70B Versatile
- HuggingFace Embeddings
- BAAI/bge-large-en-v1.5

## Vector Database

- Pinecone

## PDF Processing

- PyMuPDF (fitz)

---

# How It Works

## 1. Upload a Legal Document

The user uploads a PDF document through the web interface.

Supported documents include:

- Contracts
- Privacy Policies
- Terms of Service
- Employment Agreements
- Rental Agreements
- Subscription Agreements

---

## 2. PDF Text Extraction

The backend extracts text directly from the uploaded PDF using **PyMuPDF**.

This process happens entirely in memory without saving the file locally.

---

## 3. Intelligent Text Chunking

Large documents are divided into overlapping chunks using LangChain's Recursive Character Text Splitter.

Configuration:

```text
Chunk Size: 1000 characters
Chunk Overlap: 150 characters
```

Overlapping chunks preserve context across clause boundaries.

---

## 4. Embedding Generation

Each chunk is converted into a dense vector representation using the HuggingFace embedding model:

```text
BAAI/bge-large-en-v1.5
```

These embeddings capture the semantic meaning of each legal clause rather than relying on keyword matching.

---

## 5. Pinecone Vector Storage

Generated embeddings are uploaded to a Pinecone index.

Each uploaded document is stored inside its own unique namespace:

```text
UUID + Original Filename
```

Example:

```text
91f8cb87fd644ef6b0b9f_contract.pdf
```

Using namespaces keeps multiple uploaded documents isolated from one another.

---

## 6. Semantic Retrieval (RAG)

Instead of sending the entire document to the LLM, the application performs a semantic search.

The retrieval query focuses on identifying clauses related to:

- Data ownership
- Hidden fees
- Arbitration
- Cancellation penalties

The most relevant chunks are retrieved from Pinecone and used as context for the AI model.

This Retrieval-Augmented Generation (RAG) approach improves accuracy while reducing token usage and inference costs.

---

## 7. AI Legal Analysis

Relevant document snippets are sent to Groq's **Llama 3.3 70B** model.

The AI is instructed to:

- Identify legal red flags
- Explain clauses in plain English
- Assign severity levels
- Generate an overall risk score

The response is returned as structured JSON.

Example:

```json
{
  "risk_score": 8,
  "flags": [
    {
      "clause_title": "Automatic Renewal",
      "simple_explanation": "The contract may renew automatically unless you cancel before a certain date.",
      "severity": "High"
    }
  ]
}
```

---

#  AI Prompting Strategy

The system prompt guides the model to behave as a legal translator rather than a legal advisor.

The model is instructed to:

- Detect harmful clauses
- Avoid legal jargon
- Explain risks in simple language
- Return strictly formatted JSON

This makes the output easy to parse and display in the frontend.

---

# API Endpoints

## POST `/upload`

Uploads and indexes a PDF document.

### Request

```http
POST /upload
Content-Type: multipart/form-data
```

### Response

```json
{
  "filename": "contract.pdf",
  "namespace": "unique_namespace",
  "status": "Processed & Indexed",
  "storage": "Pinecone Cloud"
}
```

---

## GET `/analyze/{namespace}`

Performs semantic retrieval and AI analysis.

### Example

```http
GET /analyze/91f8cb87fd644ef6_contract.pdf
```

### Response

```json
{
  "namespace": "...",
  "analysis": {
    "risk_score": 8,
    "flags": [
      {
        "clause_title": "...",
        "simple_explanation": "...",
        "severity": "High"
      }
    ]
  }
}
```

---

# Retrieval-Augmented Generation (RAG)

Legalese uses a RAG pipeline to improve both speed and accuracy.

Workflow:

```text
Legal Document
      │
      ▼
Chunking
      │
      ▼
Embeddings
      │
      ▼
Pinecone
      │
      ▼
Semantic Search
      │
      ▼
Relevant Clauses
      │
      ▼
Groq LLM
      │
      ▼
Risk Analysis
```

Benefits:

- Better accuracy
- Lower inference cost
- Reduced hallucinations
- Faster responses
- Scalable to large documents

---

# Retry Mechanism

AI requests automatically retry on temporary failures.

Configuration:

- Maximum Retries: 3
- Exponential Backoff

This improves reliability during transient API issues.

---

# Frontend Features

- Drag-and-drop document upload
- File picker support
- Loading indicators
- Persistent analysis state using Zustand
- Risk score visualization
- Highlighted high-risk clauses
- Responsive design
- Smooth scrolling to results
- Hydration-safe rendering for Next.js

---

# Error Handling

The application gracefully handles:

- Invalid file types
- Missing PDFs
- Upload failures
- Pinecone indexing errors
- Embedding failures
- AI API failures
- JSON parsing issues
- Empty search results

---

# Security

- CORS configuration
- Unique namespaces for every uploaded document
- Environment-based API keys
- In-memory PDF processing (no temporary file storage)

---

# Future Improvements

- Support for DOCX and TXT uploads
- OCR support for scanned PDFs
- Clause highlighting within the original document
- Interactive document viewer
- Multi-language legal document support
- Chat with your contract
- Downloadable PDF analysis reports
- Authentication and user accounts
- Document history
- Risk comparison across multiple contracts
- Support for additional LLM providers

---

# Installation

## Clone the repository

```bash
git clone https://github.com/Vedant005/legalese.git
```

## Install backend dependencies

```bash
pip install -r requirements.txt
```

## Install frontend dependencies

```bash
pnpm install
```

## Configure environment variables

```env
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=...
HF_TOKEN=...
GROQ_API_KEY=...
ALLOWED_ORIGINS=http://localhost:3000
```

## Start the backend

```bash
uvicorn main:app --reload
```

## Start the frontend

```bash
pnpm run dev
```

---

# Example Workflow

1. Upload a legal document.
2. Extract text from the PDF.
3. Split the document into overlapping chunks.
4. Generate embeddings for each chunk.
5. Store embeddings in Pinecone.
6. Perform semantic retrieval for relevant clauses.
7. Analyze retrieved context using Groq Llama.
8. Generate:
   - Risk score
   - Risky clauses
   - Plain-English explanations
9. Display results in an intuitive dashboard.

---

# Highlights

- AI-powered legal document simplification
- Retrieval-Augmented Generation (RAG)
- Semantic search with Pinecone
- FastAPI backend
- Next.js frontend
- Groq Llama integration
- HuggingFace embeddings
- Interactive risk assessment dashboard
- Production-ready architecture
- Scalable cloud-native vector storage

---
