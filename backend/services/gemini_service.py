from google import genai
from core.config import Settings

settings = Settings()
client = genai.Client(api_key=settings.gemini_api_key)
MODEL = settings.gemini_model

SYSTEM_PROMPT = """
You are an AI assistant tasked with answering questions strictly based on the provided documents.

Instructions:
- You must ONLY use the information provided in the "Document Context" section to answer the user's question.
- If the answer cannot be found in the Document Context, you must reply with: "I'm sorry, but I don't have enough information in the provided documents to answer that."
- DO NOT use your internal knowledge, guess, or hallucinate information.
- Give clear, concise, and accurate answers.
- Use simple language (easy to understand).
- If the user asks technical questions that are covered in the context, explain step-by-step.
- Be polite and professional.
"""

def build_prompt(user_input: str, chat_history: str = "", doc_context: str = "") -> str:
    prompt = f"{SYSTEM_PROMPT}\n\n"
    
    if doc_context:
        prompt += f"### Document Context:\n{doc_context}\n\n"
        
    prompt += f"### Conversation History:\n{chat_history}\n\n"
    prompt += f"User: {user_input}\nAssistant:"
    
    return prompt

def generate_reply(user_message: str, chat_history: str = "", doc_context: str = "") -> str:
    try:
        prompt = build_prompt(user_message, chat_history, doc_context)
        
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print("Gemini Error:", e)
        return "Sorry, something went wrong."