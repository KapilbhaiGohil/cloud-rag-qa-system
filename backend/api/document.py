from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from bson import ObjectId
from core.config import settings
from core.deps import get_current_user
from models.document import RenameDocumentRequest
from services.document_service import (
    create_document,
    get_documents,
    rename_document,
    delete_document,
)
from fastapi import UploadFile, File, Form
from core.minio import minio_client, BUCKET_NAME
import uuid
from services.utility import success_response, error_response

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload")
def upload_document(
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

    return success_response("Document uploaded", doc)

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