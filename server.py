from __future__ import annotations

import json
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


# Existing RAG project
BACKEND_DIR = Path("/home/furba/chunk_Ollama")
sys.path.insert(0, str(BACKEND_DIR))

from ollama_rag import markdown_rag_answer  # noqa: E402


FRONTEND_DIR = Path(__file__).resolve().parent
HOST = "127.0.0.1"
PORT = 8080


class ChatHandler(BaseHTTPRequestHandler):
    def send_json(self, data: dict, status: int = 200) -> None:
        response_body = json.dumps(data).encode("utf-8")

        self.send_response(status)
        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8",
        )
        self.send_header(
            "Content-Length",
            str(len(response_body)),
        )
        self.end_headers()
        self.wfile.write(response_body)

    def serve_frontend_file(self, filename: str) -> None:
        file_path = FRONTEND_DIR / filename

        if not file_path.exists() or not file_path.is_file():
            self.send_error(404, "File not found")
            return

        content_types = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "application/javascript; charset=utf-8",
        }

        content_type = content_types.get(
            file_path.suffix,
            "text/plain; charset=utf-8",
        )

        response_body = file_path.read_bytes()

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header(
            "Content-Length",
            str(len(response_body)),
        )
        self.end_headers()
        self.wfile.write(response_body)

    def do_GET(self) -> None:
        route = urlparse(self.path).path

        if route == "/":
            self.serve_frontend_file("index.html")
        elif route == "/style.css":
            self.serve_frontend_file("style.css")
        elif route == "/app.js":
            self.serve_frontend_file("app.js")
        else:
            self.send_error(404, "Route not found")

    def do_POST(self) -> None:
        route = urlparse(self.path).path

        if route != "/api/ask":
            self.send_json(
                {"error": "Route not found"},
                status=404,
            )
            return

        try:
            content_length = int(
                self.headers.get("Content-Length", "0")
            )

            raw_body = self.rfile.read(content_length)
            payload = json.loads(raw_body.decode("utf-8"))

            question = str(
                payload.get("question", "")
            ).strip()

            if not question:
                self.send_json(
                    {"error": "Please enter a question."},
                    status=400,
                )
                return

            result = markdown_rag_answer(
                question=question,
                model="llama3.2:3b",
                max_contexts=5,
            )

            self.send_json(
                {
                    "answer": result.get(
                        "answer",
                        "No answer was generated.",
                    )
                }
            )

        except json.JSONDecodeError:
            self.send_json(
                {"error": "Invalid JSON request."},
                status=400,
            )

        except Exception as error:
            self.send_json(
                {"error": f"Request failed: {error}"},
                status=500,
            )

    def log_message(self, format: str, *args) -> None:
        # Keep request logs out of the terminal.
        return


def main() -> None:
    server = ThreadingHTTPServer(
        (HOST, PORT),
        ChatHandler,
    )

    print(f"Chat interface: http://{HOST}:{PORT}")
    print("Using Ollama model: llama3.2:3b")
    print("Press Ctrl+C to stop.")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
