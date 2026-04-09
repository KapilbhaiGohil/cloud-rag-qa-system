from google import genai
from google.genai import types
from core.config import Settings

settings = Settings()
client = genai.Client(api_key=settings.gemini_api_key)
MODEL = settings.gemini_model

DEFAULT_SYSTEM_PROMPT = """
You are a helpful, respectful, and honest AI assistant. Provide clear, concise, and accurate answers.
"""

def build_prompt(user_input: str, chat_history: str = "", doc_context: str = "") -> str:
    prompt = ""
    
    if doc_context:
        prompt += f"### Additional Context:\n{doc_context}\n\n"
        
    if chat_history:
        prompt += f"### Conversation History:\n{chat_history}\n\n"
        
    prompt += f"User: {user_input}\nAssistant:"
    
    return prompt

def generate_reply(
    user_message: str, 
    chat_history: str = "", 
    doc_context: str = "", 
    system_prompt: str = DEFAULT_SYSTEM_PROMPT
) -> str:
    try:
        prompt = build_prompt(user_message, chat_history, doc_context)
        
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7, # (0.0 for strict facts, up to 2.0 for highly creative)
        )
        
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=config
        )
        return response.text.strip()
        
    except Exception as e:
        print("Gemini Error:", e)
        return "Sorry, something went wrong."