import os
from io import BytesIO
from pathlib import Path
from typing import Any

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field
from pypdf import PdfReader

BASE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BASE_DIR.parent

# Load env files from both backend and project root. .env.local is preferred.
for env_path in (
    PROJECT_ROOT / ".env.local",
    PROJECT_ROOT / ".env",
    BASE_DIR / ".env.local",
    BASE_DIR / ".env",
):
    if env_path.exists():
        load_dotenv(env_path, override=False)

GITHUB_AI_API_KEY = os.getenv("GITHUB_AI_API_KEY", "")
GITHUB_AI_BASE_URL = os.getenv("GITHUB_AI_BASE_URL", "https://models.inference.ai.azure.com")
GITHUB_AI_MODEL = os.getenv("GITHUB_AI_MODEL", "gpt-4o-mini")
MAX_PDF_CHARS = int(os.getenv("MAX_PDF_CHARS", "15000"))

app = FastAPI(title="Simple GitHub AI Chatbot API", version="0.1.0")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message")
    system_prompt: str = Field(
        default="You are a helpful assistant. Reply in Indonesian when possible.",
        description="System instruction for the model",
    )


class ChatResponse(BaseModel):
    reply: str
    model: str


class PdfParseResponse(BaseModel):
    file_name: str
    page_count: int
    character_count: int
    text_preview: str
    full_text: str


class PdfChatResponse(BaseModel):
    reply: str
    model: str
    file_name: str
    page_count: int
    character_count: int


def _candidate_models() -> list[str]:
    defaults = [
        GITHUB_AI_MODEL,
        "gpt-4o-mini",
        "openai/gpt-4o-mini",
        "gpt-4.1-mini",
        "openai/gpt-4.1-mini",
    ]
    ordered_unique: list[str] = []
    for model in defaults:
        if model and model not in ordered_unique:
            ordered_unique.append(model)
    return ordered_unique


async def call_github_ai(system_prompt: str, user_message: str) -> tuple[dict[str, Any], str]:
    if not GITHUB_AI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GITHUB_AI_API_KEY belum diatur. Isi dulu di .env.local.",
        )

    endpoint = f"{GITHUB_AI_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {GITHUB_AI_API_KEY}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=60.0) as client:
        last_response: httpx.Response | None = None
        for model_name in _candidate_models():
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                "temperature": 0.7,
            }

            response = await client.post(endpoint, headers=headers, json=payload)
            last_response = response

            if response.status_code < 400:
                return response.json(), model_name

            if response.status_code == 400 and "unknown_model" in response.text:
                continue

            raise HTTPException(
                status_code=502,
                detail={
                    "message": "Gagal memanggil GitHub AI API",
                    "status": response.status_code,
                    "upstream": response.text,
                },
            )

    raise HTTPException(
        status_code=502,
        detail={
            "message": "Semua kandidat model tidak dikenali oleh endpoint",
            "tried_models": _candidate_models(),
            "last_upstream_status": last_response.status_code if last_response else None,
            "last_upstream": last_response.text if last_response else None,
        },
    )


def parse_pdf_bytes(file_name: str, raw: bytes) -> dict[str, Any]:
    if not file_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File harus berformat .pdf")

    try:
        reader = PdfReader(BytesIO(raw))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Gagal membaca PDF: {exc}") from exc

    pages_text: list[str] = []
    for page in reader.pages:
        pages_text.append((page.extract_text() or "").strip())

    full_text = "\n\n".join([t for t in pages_text if t]).strip()
    if not full_text:
        raise HTTPException(
            status_code=400,
            detail="PDF tidak memiliki teks yang bisa diekstrak (kemungkinan hasil scan gambar).",
        )

    clipped = full_text[:MAX_PDF_CHARS]
    return {
        "file_name": file_name,
        "page_count": len(reader.pages),
        "character_count": len(full_text),
        "text_preview": clipped[:500],
        "full_text": clipped,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    data, used_model = await call_github_ai(request.system_prompt, request.message)

    try:
        reply = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail={"message": "Respons GitHub AI tidak sesuai format", "raw": data},
        ) from exc

    return ChatResponse(reply=reply, model=used_model)


@app.post("/pdf/parse", response_model=PdfParseResponse)
async def pdf_parse(file: UploadFile = File(...)) -> PdfParseResponse:
    raw = await file.read()
    parsed = parse_pdf_bytes(file.filename or "document.pdf", raw)
    return PdfParseResponse(**parsed)


@app.post("/pdf/chat", response_model=PdfChatResponse)
async def pdf_chat(
    file: UploadFile = File(...),
    question: str = Form(...),
    system_prompt: str = Form(
        "Anda adalah asisten analisis dokumen. Jawab berdasarkan isi PDF secara ringkas dan jelas."
    ),
) -> PdfChatResponse:
    raw = await file.read()
    parsed = parse_pdf_bytes(file.filename or "document.pdf", raw)

    user_message = (
        "Gunakan isi dokumen berikut untuk menjawab pertanyaan. "
        "Jika informasi tidak ditemukan di dokumen, katakan tidak ditemukan.\n\n"
        f"ISI_DOKUMEN:\n{parsed['full_text']}\n\n"
        f"PERTANYAAN: {question}"
    )
    data, used_model = await call_github_ai(system_prompt, user_message)

    try:
        reply = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise HTTPException(
            status_code=502,
            detail={"message": "Respons GitHub AI tidak sesuai format", "raw": data},
        ) from exc

    return PdfChatResponse(
        reply=reply,
        model=used_model,
        file_name=parsed["file_name"],
        page_count=parsed["page_count"],
        character_count=parsed["character_count"],
    )
