from pydantic import BaseModel
from datetime import datetime

class CreateDocumentRequest(BaseModel):
    chat_id: str
    name: str
    url: str 


class DocumentInDB(BaseModel):
    id: str
    chat_id: str
    name: str
    url: str
    created_at: datetime
    
class RenameDocumentRequest(BaseModel):
    name: str