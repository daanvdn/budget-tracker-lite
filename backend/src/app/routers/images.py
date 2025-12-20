from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
import os

from ..config import settings

router = APIRouter(prefix="/images", tags=["images"])

# Ensure upload directory exists
settings.upload_dir.mkdir(parents=True, exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    Upload an image file
    Returns the path that can be stored in transaction
    """
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate file size
    contents = await file.read()
    if len(contents) > settings.max_upload_size:
        raise HTTPException(status_code=400, detail="File too large")
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = settings.upload_dir / filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    return {"filename": filename, "path": f"/api/images/{filename}"}


@router.get("/{filename}")
async def get_image(filename: str):
    """
    Serve an uploaded image
    """
    file_path = settings.upload_dir / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    
    return FileResponse(file_path)
