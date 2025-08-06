# backend/app/core/doc_parser.py (Updated with Email Parser)

import io
import PyPDF2
import docx
import email
from email.policy import default

def get_text_from_pdf(pdf_contents: bytes) -> str:
    # ... (no changes)
    text = ""
    pdf_file = io.BytesIO(pdf_contents)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    for page in pdf_reader.pages:
        text += page.extract_text() or ""
    return text

def get_text_from_docx(docx_contents: bytes) -> str:
    # ... (no changes)
    text = ""
    doc_file = io.BytesIO(docx_contents)
    document = docx.Document(doc_file)
    for para in document.paragraphs:
        text += para.text + "\n"
    return text

# --- NEW Function for Parsing Emails ---
def get_text_from_eml(eml_contents: bytes) -> str:
    """
    Extracts text content from the bytes of an .eml file.
    """
    msg = email.message_from_bytes(eml_contents, policy=default)
    body = ""

    if msg.is_multipart():
        for part in msg.walk():
            content_type = part.get_content_type()
            content_disposition = str(part.get("Content-Disposition"))
            if content_type == "text/plain" and "attachment" not in content_disposition:
                body += part.get_payload(decode=True).decode()
    else:
        if msg.get_content_type() == "text/plain":
            body = msg.get_payload(decode=True).decode()
    
    # Add subject and sender info to the text for better context
    subject = msg.get("Subject", "No Subject")
    sender = msg.get("From", "Unknown Sender")
    
    return f"Email from: {sender}\nSubject: {subject}\n\n{body}"