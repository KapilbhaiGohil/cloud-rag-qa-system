# api/document.py (Updated)
from fastapi import APIRouter, status, Depends, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from bson import ObjectId
from models.document import RenameDocumentRequest
from services.chunking_service import chunk_text
from services.embedding_service import store_chunks_in_qdrant
from core.config import settings
from core.deps import get_current_user
from core.minio import minio_client, BUCKET_NAME
from services.document_service import (
    create_document,
    get_documents,
    rename_document,
    delete_document,
    update_document_status,
)
from services.parser_service import extract_text_from_file
from services.utility import success_response, error_response
import uuid

router = APIRouter(prefix="/documents", tags=["documents"])

def process_document_background(file_bytes: bytes, filename: str, content_type: str, doc_id: str, chat_id: str):
    print(f"Starting background processing for: {filename}")
    
    try:
        # 1. Extract Text
        extracted_text = extract_text_from_file(file_bytes, filename, content_type)
        
        if not extracted_text:
            print(f"Warning: No text extracted from {filename}")
            update_document_status(doc_id, "failed")
            return

        # 2. Chunking
        chunks = chunk_text(extracted_text, max_chunk_size=1000, overlap=200)
        
        # 3. Embedding & Qdrant Storage
        store_chunks_in_qdrant(chunks, doc_id, chat_id)
        
        # 4. Success! Mark as ready
        update_document_status(doc_id, "ready")
        print(f"Finished background processing for: {filename}")
        
    except Exception as e:
        print(f"CRITICAL ERROR processing {filename}: {e}")
        update_document_status(doc_id, "failed")

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", # DOCX
    "application/vnd.ms-powerpoint",  # PPT
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",  # PPTX
    "image/jpeg",
    "image/png",
    "image/webp"
]
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    chat_id: str = Form(...),
    file: UploadFile = File(...),
    username: str = Depends(get_current_user)
):
    try:
        ObjectId(chat_id)
    except:
        return JSONResponse(
            status_code=400,
            content=error_response("Invalid chat id")
        )

    if file.content_type not in ALLOWED_MIME_TYPES:
        return JSONResponse(
            status_code=400,
            content=error_response(f"Invalid file type. Only PDFs, Word docs, TXT, and images are allowed.")
        )

    file_bytes = await file.read()
    
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        return JSONResponse(
            status_code=400,
            content=error_response(f"File is too large. Maximum allowed size is {MAX_FILE_SIZE_MB}MB.")
        )
    
    await file.seek(0)

    object_name = f"{username}/{chat_id}/{uuid.uuid4()}_{file.filename}"
    minio_client.put_object(
        BUCKET_NAME,
        object_name,
        file.file,
        length=-1,
        part_size=10*1024*1024,
        content_type=file.content_type
    )

    file_url = f"http://{settings.minio_endpoint}/{BUCKET_NAME}/{object_name}"

    doc = create_document(chat_id, file.filename, file_url, username)

    background_tasks.add_task(
        process_document_background,
        file_bytes,
        file.filename,
        file.content_type,
        doc["_id"],
        chat_id
    )

    return success_response("Document uploaded and processing started", doc)

@router.get("/{chat_id}")
def get_docs(chat_id: str, username: str = Depends(get_current_user)):
    try:
        ObjectId(chat_id)
    except:
        return JSONResponse(
            status_code=400,
            content=error_response("Invalid chat id")
        )

    docs = get_documents(chat_id)

    return success_response(
        "Documents fetched",
        {"documents": docs}
    )
    
@router.put("/{doc_id}")
def rename_doc(doc_id: str, req: RenameDocumentRequest,username: str = Depends(get_current_user)):
    try:
        ObjectId(doc_id)
    except:
        return JSONResponse(
            status_code=400,
            content=error_response("Invalid document id")
        )

    updated = rename_document(doc_id, req.name)

    if not updated:
        return JSONResponse(
            status_code=404,
            content=error_response("Document not found")
        )

    return success_response("Document renamed")

@router.delete("/{doc_id}")
def delete_doc(doc_id: str, username: str = Depends(get_current_user)):
    deleted = delete_document(doc_id, username)

    if not deleted:
        return JSONResponse(
            status_code=404,
            content=error_response("Document not found")
        )

    return success_response("Document deleted")