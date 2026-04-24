from fastapi import APIRouter, File, UploadFile, HTTPException
import json
import os
import uuid
from services.processor import DocumentProcessor

router = APIRouter()
processor = DocumentProcessor()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...)
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    try:
        pdf_bytes = await file.read()
        raw_text = processor.extract_text_from_memory(pdf_bytes)
        chunks = processor.create_chunks(raw_text)

       
        unique_hex = uuid.uuid4().hex
        
        # Create a unique namespace combining Hex + Filename
        # We strip spaces and dots to keep the namespace clean
        clean_filename = file.filename.replace(" ", "_")
        unique_namespace = f"{unique_hex}_{clean_filename}"

        await processor.save_to_pinecone(
            chunks=chunks, 
            index_name=os.getenv("PINECONE_INDEX_NAME"),
            namespace=unique_namespace
        )

        return {
            "filename": file.filename,
            "namespace": unique_namespace,  
            "status": "Processed & Indexed",
            "storage": "Pinecone Cloud"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/analyze/{namespace}")
async def get_analysis(namespace: str):
    """
    Namespace is now the unique string: {unique_hex}_{filename}
    """
    try:
        raw_analysis = await processor.analyze_contract(namespace)
        
        # JSON cleaning
        json_data = raw_analysis.replace("```json", "").replace("```", "").strip()
        analysis_results = json.loads(json_data)
        
        return {
            "namespace": namespace,
            "analysis": analysis_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")