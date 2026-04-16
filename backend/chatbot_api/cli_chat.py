import asyncio
from pathlib import Path

import httpx

API_URL = "http://127.0.0.1:8000/pdf/chat"
HEALTH_URL = "http://127.0.0.1:8000/health"


async def main() -> None:
    print("PDF Chatbot (ketik 'exit' untuk keluar)")

    timeout = httpx.Timeout(connect=10.0, read=120.0, write=30.0, pool=30.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            health_response = await client.get(HEALTH_URL)
            health_response.raise_for_status()
        except httpx.HTTPError as exc:
            print("API server belum aktif di http://127.0.0.1:8000")
            print(f"Detail: {type(exc).__name__}: {exc!r}")
            print("Jalankan dulu: uvicorn chatbot_api.main:app --reload --host 127.0.0.1 --port 8000")
            return

        pdf_path_input = input("Path PDF: ").strip().strip('"')
        if not pdf_path_input:
            print("Path PDF wajib diisi.")
            return
        if pdf_path_input.lower() in {"exit", "quit"}:
            print("Selesai.")
            return

        pdf_path = Path(pdf_path_input)
        if not pdf_path.exists() or not pdf_path.is_file():
            print("File PDF tidak ditemukan.")
            return
        if pdf_path.suffix.lower() != ".pdf":
            print("File harus berekstensi .pdf")
            return

        while True:
            question = input("Pertanyaan: ").strip()
            if not question:
                continue
            if question.lower() in {"exit", "quit"}:
                print("Selesai.")
                break

            response = None
            for attempt in range(2):
                try:
                    with pdf_path.open("rb") as file_handle:
                        files = {"file": (pdf_path.name, file_handle, "application/pdf")}
                        data = {"question": question}
                        response = await client.post(API_URL, files=files, data=data)
                    break
                except httpx.HTTPError as exc:
                    if attempt == 1:
                        print(f"Bot: gagal menghubungi API. Detail: {type(exc).__name__}: {exc!r}")
                    else:
                        print("Bot: koneksi sempat gagal, mencoba ulang...")

            if response is None:
                continue

            if response.status_code >= 400:
                print("Bot: Error", response.text)
                continue

            data = response.json()
            print(f"Bot: {data.get('reply', '')}")
            print(
                f"Info: model={data.get('model', '-')}, pages={data.get('page_count', '-')}, "
                f"chars={data.get('character_count', '-')}\n"
            )


if __name__ == "__main__":
    asyncio.run(main())
