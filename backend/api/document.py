from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from bson import ObjectId

from core.deps import get_current_user
from models.document import CreateDocumentRequest, RenameDocumentRequest
from services.document_service import (
    create_document,
    get_documents,
    rename_document,
    delete_document,
)
from services.utility import success_response, error_response

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("")
def create_doc(req: CreateDocumentRequest, username: str = Depends(get_current_user)):
    try:
        ObjectId(req.chat_id)
    except:
        return JSONResponse(
            status_code=400,
            content=error_response("Invalid chat id")
        )

    doc = create_document(req.chat_id, req.name, req.url)

    return success_response("Document created", doc)

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
    deleted = delete_document(doc_id)

    if not deleted:
        return JSONResponse(
            status_code=404,
            content=error_response("Document not found")
        )

    return success_response("Document deleted")