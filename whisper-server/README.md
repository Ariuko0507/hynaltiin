# Local Whisper Server Setup

## Prerequisites
- Python 3.8 or higher installed
- pip (Python package manager)

## Installation Steps

1. **Navigate to whisper-server directory:**
```bash
cd whisper-server
```

2. **Create a virtual environment (recommended):**
```bash
python -m venv venv
```

3. **Activate virtual environment:**

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

4. **Install dependencies:**
```bash
pip install -r requirements.txt
```

5. **Start the Whisper server:**
```bash
python server.py
```

The server will:
- Download the Whisper "base" model on first run (~140MB)
- Start on http://localhost:8001
- Print "Whisper model loaded!" when ready

## Usage

Keep the Whisper server running in a separate terminal. Then use the "Бичлэг + Текст (Transcription)" recorder in your app.

## Notes

- First run will download the model (takes a few minutes)
- Transcription happens locally - no API costs
- Supports Mongolian language
- Requires ~2GB RAM for the base model
