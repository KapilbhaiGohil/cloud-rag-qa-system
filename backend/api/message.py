from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse, StreamingResponse
from bson import ObjectId

from core.deps import get_current_user
from models.message import AbortRequest, CreateMessageRequest
from services.message_service import create_message_with_reply_stream, get_messages
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
    return StreamingResponse(
        create_message_with_reply_stream(username, req.chat_id, req.content),
        media_type="text/plain"
    )

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
    
@router.patch("/{message_id}/abort")
def abort_message_api(message_id: str, req: AbortRequest, username: str = Depends(get_current_user)):
    from services.message_service import update_aborted_message
    update_aborted_message(message_id, req.content)
    return success_response("Message status updated to aborted", {})