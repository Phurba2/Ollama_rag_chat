# Ollama RAG Chat

A local web interface for asking questions about your Markdown documents using the Ollama RAG backend.

## Requirements

- This project in `/home/furba/Ollama_rag_chat`
- The RAG backend in `/home/furba/chunk_Ollama`
- The backend Python environment at `/home/furba/chunk_Ollama/env`
- Ollama installed and available locally
- The backend database configured and running

## Start the server

Open a terminal and run:

```bash
cd /home/furba/Ollama_rag_chat
/home/furba/chunk_Ollama/env/bin/python server.py
```

When the server starts, open <http://127.0.0.1:8080> in your browser. Keep the terminal open while using the chat.

Press `Ctrl+C` in the terminal to stop the server.

## Ollama model

The app uses the `llama3.2:3b` model. If it is not installed yet, run:

```bash
ollama pull llama3.2:3b
```

If Ollama is not already running, start it in a separate terminal:

```bash
ollama serve
```

## Troubleshooting

- **`No module named 'dotenv'`**: Run the server with `/home/furba/chunk_Ollama/env/bin/python` as shown above. The system `python3` may not have the backend dependencies installed.
- **Backend import error**: Check that `/home/furba/chunk_Ollama` exists and contains `ollama_rag.py`.
- **Database connection error**: Check the backend's `.env` settings and make sure its database is running.
- **Ollama connection error**: Make sure Ollama is running and the `llama3.2:3b` model is installed.
- **Port 8080 already in use**: Stop the other process using the port, or change `PORT` in `server.py`.
