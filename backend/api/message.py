from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from bson import ObjectId

from core.deps import get_current_user
from models.message import CreateMessageRequest
from services.message_service import create_message_with_reply, get_messages
from services.utility import success_response, error_response

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("")
def create_message_api(
    req: CreateMessageRequest,
    username: str = Depends(get_current_user)
):
    try:
        ObjectId(req.chat_id)
    except:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response(
                "Invalid chat id",
                {"chat_id": "Invalid ObjectId format"}
            )
        )

    data = create_message_with_reply(
        username,
        req.chat_id,
        req.content
    )

    return success_response("Message created", data)

@router.get("/{chat_id}")
def get_messages_api(
    chat_id: str,
    username: str = Depends(get_current_user)
):
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

    messages = get_messages(chat_id)

    return success_response(
        "Messages fetched successfully",
        {"messages": messages}
    )