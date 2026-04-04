from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import uuid
import os
import shutil

router = APIRouter()

UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Max file size: 5MB
MAX_FILE_SIZE = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


@router.post("/uploads/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file and return a URL"""
    # Validate file extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type {ext} not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file content with size check
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB")

    # Generate unique filename
    file_id = str(uuid.uuid4())
    filename = f"{file_id}{ext}"
    file_path = UPLOAD_DIR / filename

    # Write file
    with open(file_path, "wb") as f:
        f.write(content)

    # Return the URL path that will be served by FastAPI static files
    return {
        "filename": filename,
        "url": f"/api/files/{filename}",
        "size": len(content),
        "content_type": file.content_type,
    }


@router.post("/uploads/images")
async def upload_multiple_images(files: list[UploadFile] = File(...)):
    """Upload multiple images"""
    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 images per upload")

    results = []
    for file in files:
        ext = Path(file.filename or "").suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            continue

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            continue

        file_id = str(uuid.uuid4())
        filename = f"{file_id}{ext}"
        file_path = UPLOAD_DIR / filename

        with open(file_path, "wb") as f:
            f.write(content)

        results.append({
            "filename": filename,
            "url": f"/api/files/{filename}",
            "size": len(content),
            "content_type": file.content_type,
        })

    return {"uploaded": results, "count": len(results)}
