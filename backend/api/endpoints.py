from fastapi import APIRouter, File, UploadFile, HTTPException
import shutil
import json
import os
from services.processor import DocumentProcessor

router = APIRouter()

processor = DocumentProcessor()
@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    try:
        pdf_bytes = await file.read()

        raw_text = processor.extract_text_from_memory(pdf_bytes)
        chunks = processor.create_chunks(raw_text)

        await processor.save_to_pinecone(
            chunks=chunks, 
            index_name=os.getenv("PINECONE_INDEX_NAME"),
            namespace=file.filename
        )

        return {
        "filename": file.filename,
        "total_chunks": len(chunks),
        "preview": chunks[0][:100] + "...",
        "status": "Processed in memory & Indexed",
        "storage": "Pinecone Cloud"
        }
    except Exception as e:

        raise HTTPException(status_code=500, detail=f"In-memory processing failed: {str(e)}")

    

@router.get("/analyze/{filename}")
async def get_analysis(filename: str):
    try:
        raw_analysis = await processor.analyze_contract(filename)
        
        json_data = raw_analysis.replace("```json", "").replace("```", "").strip()
        analysis_results = json.loads(json_data)
        
        return {
            "filename": filename,
            "analysis": analysis_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")