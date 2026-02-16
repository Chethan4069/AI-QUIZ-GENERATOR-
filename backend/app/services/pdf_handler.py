from pypdf import PdfReader
from fastapi import UploadFile

def extract_text_from_pdf(file: UploadFile) -> str:
    reader = PdfReader(file.file)
    text = ""
    # Iterate through all pages
    for page in reader.pages:
        content = page.extract_text()
        if content:
            text += content + "\n"
    return text