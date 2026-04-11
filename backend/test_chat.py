import sys
sys.path.append(r"C:\Users\Madhav Shah\Desktop\project\simplerisk-watch\backend")

from nlp.chat_engine import _get_gemini_response
import json

messages = [{"role": "user", "content": "gregregr"}]
context = "{}"

response = _get_gemini_response(messages, context)
print("GEMINI RESPONSE:", response)
