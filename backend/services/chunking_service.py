import re

def chunk_text(text: str, max_chunk_size: int = 1000, overlap: int = 200) -> list[str]:
    if not text:
        return []

    text = re.sub(r'\s+', ' ', text).strip()
    
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) > max_chunk_size and current_chunk:
            chunks.append(current_chunk.strip())
            
            overlap_text = current_chunk[-overlap:]
            space_index = overlap_text.find(" ")
            
            if space_index != -1:
                current_chunk = overlap_text[space_index:].strip() + " " + sentence
            else:
                current_chunk = overlap_text.strip() + " " + sentence
        else:
            if current_chunk:
                current_chunk += " " + sentence
            else:
                current_chunk = sentence
                
    if current_chunk:
        chunks.append(current_chunk.strip())
        
    return chunks