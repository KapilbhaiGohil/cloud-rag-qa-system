from fastapi import APIRouter, status, Depends
from fastapi.responses import JSONResponse
from bson import ObjectId
from services.utility import error_response, success_response
from core.deps import get_current_user
from models.chat import CreateChatRequest
from services.chat_service import (
    create_chat as create_chat_service,
    get_chats as get_chats_service,
    rename_chat as rename_chat_service,
    delete_chat as delete_chat_service,
)

router = APIRouter(prefix="/chats", tags=["chats"])

@router.post("")
def create_chat(req: CreateChatRequest, username: str = Depends(get_current_user)):
    data = create_chat_service(username, req.name)

    return success_response(
        "Chat created successfully",
        data
    )


@router.get("")
def get_chats(username: str = Depends(get_current_user)):
    chats = get_chats_service(username)

    return success_response(
        "Chats fetched successfully",
        {"chats": chats}
    )


@router.put("/{chat_id}")
def rename_chat(chat_id: str, req: CreateChatRequest, username: str = Depends(get_current_user)):
    try:
        ObjectId(chat_id)
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response(
                "Invalid chat id",
                {"chat_id": "Invalid ObjectId format"}
            )
        )

    updated = rename_chat_service(username, chat_id, req.name)

    if not updated:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=error_response(
                "Chat not found",
                {"chat_id": "No chat exists with this id"}
            )
        )

    return success_response("Chat renamed successfully")


@router.delete("/{chat_id}")
def delete_chat(chat_id: str, username: str = Depends(get_current_user)):
    try:
        ObjectId(chat_id)
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response(
                "Invalid chat id",
                {"chat_id": "Invalid ObjectId format"}
            )
        )

    deleted = delete_chat_service(username, chat_id)

    if not deleted:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=error_response(
                "Chat not found",
                {"chat_id": "No chat exists with this id"}
            )
        )

    return success_response("Chat deleted successfully")