from google import genai
from core.config import Settings

settings = Settings()
client = genai.Client(api_key=settings.gemini_api_key)

MODEL = settings.gemini_model

SYSTEM_PROMPT = """
You are a helpful AI assistant.

Instructions:
- Give clear, concise, and accurate answers
- Use simple language (easy to understand)
- Avoid unnecessary long explanations
- If the user asks technical questions, explain step-by-step
- If unsure, say you don't know (do not hallucinate)
- Be polite and professional
"""


def build_prompt(user_input: str, context: str = "") -> str:
    return f"""
{SYSTEM_PROMPT}

Conversation:
{context}

User: {user_input}
Assistant:
"""

def generate_reply(user_message: str, context: str = "") -> str:
    try:
        prompt = build_prompt(user_message, context)
        # print(context)
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )

        return response.text.strip()

    except Exception as e:
        print("Gemini Error:", e)
        return "Sorry, something went wrong."