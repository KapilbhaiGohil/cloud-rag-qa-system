import uuid
from qdrant_client.models import PointStruct
from db.client import qdrant_client, COLLECTION_NAME
from services.gemini_service import client
from qdrant_client.models import Filter, FieldCondition, MatchValue

EMBEDDING_MODEL = "gemini-embedding-001"

def get_embedding(text: str) -> list[float]:
    try:
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=text
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Embedding error: {e}")
        return []

def store_chunks_in_qdrant(chunks: list[str], doc_id: str, chat_id: str):
    if not chunks:
        print("No chunks to process.")
        return
        
    points = []
    
    for i, chunk in enumerate(chunks):
        vector = get_embedding(chunk)
        
        if not vector:
            print(f"Failed to embed chunk {i} for doc {doc_id}")
            continue
            
        point_id = str(uuid.uuid4())
        
        payload = {
            "chat_id": str(chat_id),
            "doc_id": str(doc_id),
            "text": chunk,
            "chunk_index": i
        }
        
        points.append(PointStruct(id=point_id, vector=vector, payload=payload))
        
    if points:
        try:
            qdrant_client.upsert(
                collection_name=COLLECTION_NAME,
                points=points
            )
            print(f"Successfully stored {len(points)} vectors in Qdrant for doc {doc_id}")
        except Exception as e:
            print(f"Qdrant storage error: {e}")
            
def retrieve_relevant_chunks(query: str, chat_id: str, limit: int = 3) -> str:
    query_vector = get_embedding(query)
    
    if not query_vector:
        return ""

    try:
        search_result = qdrant_client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=Filter(
                must=[
                    FieldCondition(
                        key="chat_id",
                        match=MatchValue(value=str(chat_id)),
                    )
                ]
            ),
            limit=limit
        )

        contexts = [
            point.payload.get("text", "")
            for point in search_result.points
        ]

        return "\n\n---\n\n".join(contexts)

    except Exception as e:
        print(f"Qdrant search error: {e}")
        return ""