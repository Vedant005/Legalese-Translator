from fastapi import APIRouter, File, UploadFile, HTTPException, Query
import json
import os
from services.processor import DocumentProcessor

router = APIRouter()
processor = DocumentProcessor()

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...), 
    user_id: str = Query(...)  # Accept user_id from frontend localStorage
):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
        
    try:
        pdf_bytes = await file.read()
        raw_text = processor.extract_text_from_memory(pdf_bytes)
        chunks = processor.create_chunks(raw_text)

        # Create a unique namespace combining User + Filename
        # We strip spaces and dots to keep the namespace clean
        clean_filename = file.filename.replace(" ", "_")
        unique_namespace = f"{user_id}_{clean_filename}"

        await processor.save_to_pinecone(
            chunks=chunks, 
            index_name=os.getenv("PINECONE_INDEX_NAME"),
            namespace=unique_namespace
        )

        return {
            "filename": file.filename,
            "namespace": unique_namespace,  # Send this back to frontend for the URL
            "status": "Processed & Indexed",
            "storage": "Pinecone Cloud"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

@router.get("/analyze/{namespace}")
async def get_analysis(namespace: str):
    """
    Namespace is now the unique string: {user_id}_{filename}
    """
    try:
        raw_analysis = await processor.analyze_contract(namespace)
        
        # Robust JSON cleaning
        json_data = raw_analysis.replace("```json", "").replace("```", "").strip()
        analysis_results = json.loads(json_data)
        
        return {
            "namespace": namespace,
            "analysis": analysis_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")