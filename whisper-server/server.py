from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import whisper
import torch
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model (will download on first run)
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Whisper model loaded!")

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """
    Transcribe audio file using local Whisper model
    Supports Mongolian language (mn)
    """
    try:
        # Save uploaded file temporarily
        temp_filename = f"temp_{file.filename}"
        with open(temp_filename, "wb") as buffer:
            buffer.write(await file.read())
        
        # Transcribe with Mongolian language
        result = model.transcribe(
            temp_filename,
            language="mn",  # Mongolian
            task="transcribe"
        )
        
        # Clean up temp file
        import os
        os.remove(temp_filename)
        
        return {
            "success": True,
            "transcription": result["text"],
            "language": result.get("language", "mn")
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
