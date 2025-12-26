import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.auth.dependencies import get_current_active_user
from app.config.settings import settings
from app.models import User

router = APIRouter(prefix="/images", tags=["images"])


@router.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
):
    """
    Upload an image file
    Returns the path that can be stored in transaction
    """
    # Ensure upload directory exists
    settings.upload_dir.mkdir(parents=True, exist_ok=True)

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
async def get_image(
    filename: str,
    current_user: User = Depends(get_current_active_user),
):
    """
    Serve an uploaded image
    """
    file_path = settings.upload_dir / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(file_path)
