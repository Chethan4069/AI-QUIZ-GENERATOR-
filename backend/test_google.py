import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load your .env file
load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

if not api_key:
    print("❌ Error: No API Key found in .env")
else:
    genai.configure(api_key=api_key)
    print("✅ Key Found! Listing available models...")
    
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f" - {m.name}")
    except Exception as e:
        print(f"❌ Error connecting to Google: {e}")