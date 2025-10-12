from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pathlib import Path
import shutil
from uuid import uuid4
import os
from app.embedding import get_image_embedding
from app.faiss_db import FaissImageDB

router = APIRouter()

UPLOAD_DIR = Path("app/static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

DB_INDEX_PATH = "faiss.index"
DB_METADATA_PATH = "metadata.pkl"

db = FaissImageDB(dim=2048)
try:
    db.load(DB_INDEX_PATH, DB_METADATA_PATH)
    print(f"Loaded FAISS index and metadata. Index size: {db.index.ntotal}, Metadata length: {len(db.metadata)}")
except FileNotFoundError:
    print("FAISS index or metadata file not found. Starting fresh.")

@router.post("/user/complaint")
async def upload_user_complaint(
    file: UploadFile = File(...),
    location: str = Form(...),
    date: str = Form(None)
):
    try:
        suffix = Path(file.filename).suffix
        unique_name = f"{uuid4()}{suffix}"
        file_path = UPLOAD_DIR / unique_name

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"Saved uploaded file: {file_path}")

        embedding = get_image_embedding(str(file_path))
        print(f"Generated embedding for {unique_name}")

        # User complaint (lost report) checks against found items
        matches = db.query(embedding, search_type="found_report", k=5, query_location=location)
        high_conf, med_conf = db.get_best_matches(matches)
        if high_conf:
            return {
                "status": "high_confidence",
                "message": "Match found! Please report to Lost & Found department.",
                "matches": high_conf,
                "filename": unique_name,
                "path": str(file_path),
            }
        elif med_conf:
            return {
                "status": "medium_confidence",
                "message": "Potential match found! Please check with Lost & Found department.",
                "matches": med_conf,
                "filename": unique_name,
                "path": str(file_path),
            }
        else:
            # No match found, add as lost_report
            metadata = {
                "file_path": str(file_path),
                "location": location,
                "date": date,
                "type": "lost_report",
            }
            db.add_embedding(embedding, metadata)
            db.save(DB_INDEX_PATH, DB_METADATA_PATH)
            print(f"Added new embedding and saved DB for {unique_name}")
            return {
                "status": "no_match",
                "message": "No match found; your complaint has been filed.",
                "matches": [],
                "filename": unique_name,
                "path": str(file_path),
            }
    except Exception as e:
        print(f"Error in /user/complaint: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {e}")

@router.post("/admin/found")
async def upload_admin_found(
    file: UploadFile = File(...),
    location: str = Form(...),
    date: str = Form(None)
):
    try:
        suffix = Path(file.filename).suffix
        unique_name = f"{uuid4()}{suffix}"
        file_path = UPLOAD_DIR / unique_name

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"Saved uploaded file: {file_path}")

        embedding = get_image_embedding(str(file_path))
        print(f"Generated embedding for {unique_name}")

        # Admin found (found report) checks against lost items
        matches = db.query(embedding, search_type="lost_report", k=5, query_location=location)
        high_conf, med_conf = db.get_best_matches(matches)
        if high_conf:
            return {
                "status": "high_confidence",
                "matches": high_conf,
                "filename": unique_name,
                "path": str(file_path),
            }
        elif med_conf:
            return {
                "status": "medium_confidence",
                "matches": med_conf,
                "filename": unique_name,
                "path": str(file_path),
            }
        else:
            # No match found, add as found_report
            metadata = {
                "file_path": str(file_path),
                "location": location,
                "date": date,
                "type": "found_report",
            }
            db.add_embedding(embedding, metadata)
            db.save(DB_INDEX_PATH, DB_METADATA_PATH)
            print(f"Added new embedding and saved DB for {unique_name}")
            return {
                "status": "no_match",
                "message": "No match found; found item has been added to the database.",
                "matches": [],
                "filename": unique_name,
                "path": str(file_path),
            }
    except Exception as e:
        print(f"Error in /admin/found: {e}")
        raise HTTPException(status_code=500, detail=f"Error: {e}")
