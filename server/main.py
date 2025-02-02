from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import os
import re
from datetime import datetime
from llama_index.llms.ollama import Ollama
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List, Optional, Dict, Any, Tuple
import logging
from pathlib import Path
import json

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('documentation_generator.log')
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Documentation Generator",
    description="API for generating documentation from Python code using AI",
    version="1.0.0"
)

# Updated CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DirectoryRequest(BaseModel):
    directory_path: str
    output_path: Optional[str] = "./output/documentation.json"


class DocumentationResponse(BaseModel):
    success: bool
    message: str
    documentation: Optional[Dict[str, Any]] = None
    output_path: Optional[str] = None


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def generate_code_documentation(code: str, filename: str) -> Dict[str, Any]:
    """Generate documentation for code using Ollama directly in JSON format."""
    try:
        llm = Ollama(
            model="deepseek-r1:7b",
            stop=[
                "<｜begin▁of▁sentence｜>",
                "<｜end▁of▁sentence｜>",
                "<｜User｜>",
                "<｜Assistant｜>"
            ],
            timeout=3000
        )

        prompt = f"""Analyze this Python code from file '{filename}' and provide documentation in the following JSON structure.
        Return ONLY the JSON object, no other text:

        {{
            "overview": "Brief description of what the code does",
            "functions": [
                {{
                    "name": "function name with signature",
                    "description": ["detailed function description"],
                    "parameters": ["parameter descriptions with types"],
                    "returns": ["return value descriptions"]
                }}
            ]
        }}

        CODE:
        {code}
        """

        logger.info(f"Generating documentation for {filename}")
        response = llm.complete(prompt)

        # Extract JSON from the response
        raw_text = response.text

        # Find the first '{' and last '}' to extract the JSON
        start_index = raw_text.find('{')
        end_index = raw_text.rfind('}') + 1

        if start_index == -1 or end_index == 0:
            logger.error(f"No valid JSON found in response for {filename}")
            raise json.JSONDecodeError("No valid JSON", raw_text, 0)

        json_str = raw_text[start_index:end_index]

        # Parse the extracted JSON
        documentation = json.loads(json_str)

        logger.info(f"Generated documentation for {
                    filename}: {str(documentation)[:200]}...")
        return documentation

    except json.JSONDecodeError as e:
        logger.error(f"Error parsing JSON response: {str(e)}")
        logger.error(f"Raw response: {raw_text}")
        raise
    except Exception as e:
        logger.error(f"Error generating documentation for {
                     filename}: {str(e)}")
        raise


async def document_file(file_path: str) -> Optional[Dict[str, Any]]:
    """Generate documentation for a single Python file."""
    try:
        file_path = Path(file_path)
        with open(file_path, 'r', encoding='utf-8') as file:
            code = file.read()
            filename = file_path.name
            logger.info(f"Processing file: {filename}")
            documentation = await generate_code_documentation(code, filename)
            return {
                'fileName': filename,
                'filePath': str(file_path),
                **documentation
            }
    except Exception as e:
        logger.error(f"Error processing {file_path}: {str(e)}")
        return None


async def document_directory(directory_path: str) -> Tuple[List[Dict[str, Any]], List[str]]:
    """Generate documentation for all Python files in a directory."""
    dir_path = Path(directory_path).resolve()

    if not dir_path.exists():
        logger.error(f"Directory not found: {dir_path}")
        raise HTTPException(status_code=404, detail="Directory not found")

    logger.info(f"Scanning directory: {dir_path}")

    tasks = []
    file_paths = []

    python_files = list(dir_path.rglob("*.py"))
    logger.info(f"Found {len(python_files)} Python files")

    for file_path in python_files:
        logger.info(f"Adding file to queue: {file_path}")
        file_paths.append(str(file_path))
        tasks.append(document_file(str(file_path)))

    if not tasks:
        logger.warning(f"No Python files found in {dir_path}")
        return [], []

    results = []
    chunk_size = 3  # Process 3 files at a time
    for i in range(0, len(tasks), chunk_size):
        chunk = tasks[i:i + chunk_size]
        chunk_results = await asyncio.gather(*chunk)
        results.extend(chunk_results)

    valid_results = []
    valid_paths = []
    for doc, path in zip(results, file_paths):
        if doc is not None:
            valid_results.append(doc)
            valid_paths.append(path)
            logger.info(f"Successfully processed: {path}")
        else:
            logger.error(f"Failed to process: {path}")

    return valid_results, valid_paths


@app.post("/generate-documentation", response_model=DocumentationResponse)
async def generate_documentation(request: DirectoryRequest):
    """Generate documentation for Python files in the specified directory."""
    try:
        directory_path = Path(request.directory_path).resolve()
        output_path = Path(request.output_path)

        logger.info(f"Received request for directory: {directory_path}")
        logger.info(f"Files in directory: {list(directory_path.glob('*.py'))}")

        output_dir = output_path.parent
        output_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created output directory: {output_dir}")

        documentation_list, file_paths = await document_directory(str(directory_path))

        if not documentation_list:
            logger.warning("No documentation generated")
            return DocumentationResponse(
                success=False,
                message="No documentation generated",
                documentation={},
                output_path=str(output_path)
            )

        formatted_docs = {
            'projectName': 'Python Project Documentation',
            'projectDescription': f'Documentation for {len(file_paths)} Python files',
            'files': documentation_list,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        with open(output_path, "w", encoding='utf-8') as file:
            json.dump(formatted_docs, file, indent=2)

        return DocumentationResponse(
            success=True,
            message="Documentation generated successfully",
            documentation=formatted_docs,
            output_path=str(output_path)
        )

    except Exception as e:
        logger.error(f"Error generating documentation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
