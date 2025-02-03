# AUTODOC

## Screenshots

### File Upload Interface

![File Upload](/screenshots/File_Upload_Interface.png)

### Generated Output

![Output](/screenshots/Generated_Doc_View.png)

## Client

## Overview

A React-based web application that provides an interface for uploading project files and viewing generated documentation.

## Tech Stack

- React.js
- Tailwind CSS
- Vite

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features
- Document Creation
- Documentation viewer

---

# Server

## Overview

FastAPI backend service that processes project files and generates technical documentation using Ollama with the deepseek-coder model.

## Tech Stack

- Python 3.8+
- FastAPI
- Ollama (deepseek-r1:7b model)
- uvicorn
- llama-index

## Getting Started

1. Install Ollama:

```bash
# macOS/Linux
curl https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download/windows
```

2. Pull and run the Deepseek R1 model:

```bash
ollama pull deepseek-r1:7b
ollama run deepseek-r1:7b
```

3. Create and activate virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

5. Start the server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### POST /generate-documentation

Generate documentation for Python files in a directory.

Request body:

```json
{
  "directory_path": "string",
  "output_path": "string (optional)"
}
```

Response:

```json
{
    "success": boolean,
    "message": "string",
    "documentation": {
        "projectName": "string",
        "projectDescription": "string",
        "files": [
            {
                "fileName": "string",
                "overview": "string",
                "functions": [...]
            }
        ]
    },
    "output_path": "string"
}
```
