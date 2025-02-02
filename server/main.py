from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio
import os
import re
import httpx
from llama_index.llms.ollama import Ollama
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List, Optional
import uvicorn

app = FastAPI()


class DirectoryRequest(BaseModel):
    directory_path: str
    output_path: Optional[str] = "./output/README.MD"


class DocumentationResponse(BaseModel):
    success: bool
    message: str
    documentation: Optional[List[str]] = None
    output_path: Optional[str] = None


def remove_think_tags(text):
    """Remove only <think> tags and their content."""
    pattern = '<think>.*?</think>'
    return re.sub(pattern, '', text, flags=re.DOTALL)


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10)
)
async def generate_code_documentation(code):
    """Generate code documentation using LLM."""
    llm = Ollama(
        model="deepseek-r1:7b",
        stop=[
            "<｜begin▁of▁sentence｜>",
            "<｜end▁of▁sentence｜>",
            "<｜User｜>",
            "<｜Assistant｜>"
        ],
        timeout=1000
    )

    prompt = f"""Please analyze and document this code:
    {code}
    Do not add anything else to your reply besides below things.
    Provide:
    1. Overview
    2. Function descriptions
    3. Parameters
    4. Return values
    """

    response = llm.complete(prompt)
    return remove_think_tags(response.text)


async def document_file(file_path: str):
    """Generate documentation for code in a file."""
    try:
        with open(file_path, 'r') as file:
            code = file.read()
            print(f"\nGenerating documentation for {file_path}...")
            documentation = await generate_code_documentation(code)
            return documentation
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None


async def document_directory(directory_path: str):
    """Generate documentation for all Python files in a directory."""
    if not os.path.exists(directory_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    tasks = []
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                tasks.append(document_file(file_path))

    results = []
    chunk_size = 3
    for i in range(0, len(tasks), chunk_size):
        chunk = tasks[i:i + chunk_size]
        chunk_results = await asyncio.gather(*chunk)
        results.extend(chunk_results)

    return [doc for doc in results if doc is not None]


@app.post("/generate-documentation", response_model=DocumentationResponse)
async def generate_documentation(request: DirectoryRequest):
    try:
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(request.output_path), exist_ok=True)

        # Generate documentation
        documentation_list = await document_directory(request.directory_path)

        if not documentation_list:
            return DocumentationResponse(
                success=False,
                message="No documentation generated",
                documentation=[],
                output_path=request.output_path
            )

        # Save to file
        with open(request.output_path, "w") as file:
            for doc in documentation_list:
                file.write(doc + "\n")

        return DocumentationResponse(
            success=True,
            message="Documentation generated successfully",
            documentation=documentation_list,
            output_path=request.output_path
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
