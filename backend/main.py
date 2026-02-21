from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from router import tutor_router
import logging
from typing import Optional
import time

# =========================
# LOGGING SETUP
# =========================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =========================
# FASTAPI APP
# =========================
app = FastAPI(
    title="AI Tutor API",
    description="Offline/Online AI Tutoring System with Multilingual Support",
    version="2.0.0"
)

# Enable CORS for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# REQUEST/RESPONSE MODELS
# =========================
class QueryRequest(BaseModel):
    """Request model for questions."""
    query: str = Field(..., min_length=1, max_length=1000, description="Student's question")

class PredictionResponse(BaseModel):
    """Response model for answers."""
    text: str = Field(..., description="AI-generated answer")
    mode: str = Field(..., description="Mode used: 'online', 'offline', or 'error'")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score 0-1")
    language: str = Field(..., description="Detected language: 'en', 'hi', or 'mr'")
    processing_time: float = Field(..., description="Processing time in seconds")

# =========================
# HEALTH CHECK
# =========================
@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "AI Tutor API",
        "version": "2.0.0",
        "supported_languages": ["en", "hi", "mr"],
        "modes": ["online", "offline"]
    }

@app.get("/health")
def health_check():
    """Detailed health check."""
    return {
        "status": "ok",
        "timestamp": time.time()
    }

# =========================
# MAIN PREDICTION ENDPOINT
# =========================
@app.post("/predict", response_model=PredictionResponse)
def predict(data: QueryRequest):
    """
    Process student question and return AI-generated answer.
    
    Args:
        data: QueryRequest containing the question
    
    Returns:
        PredictionResponse with answer and metadata
    
    Raises:
        HTTPException: If processing fails
    """
    start_time = time.time()
    
    try:
        logger.info(f"Received query: {data.query[:100]}...")
        
        # Route to appropriate model
        result = tutor_router(data.query)
        
        processing_time = time.time() - start_time
        
        response = {
            "text": result["text"],
            "mode": result["mode"],
            "confidence": result["confidence"],
            "language": result["language"],
            "processing_time": round(processing_time, 2)
        }
        
        logger.info(f"Response generated - Mode: {result['mode']}, "
                   f"Language: {result['language']}, "
                   f"Time: {processing_time:.2f}s")
        
        return response
    
    except Exception as e:
        logger.error(f"Error processing query: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process question: {str(e)}"
        )

# =========================
# TESTING ENDPOINT (Optional)
# =========================
@app.post("/test")
def test_languages():
    """
    Test endpoint to verify language detection and routing.
    Returns sample responses in all supported languages.
    """
    test_questions = {
        "english": "What is force?",
        "hindi": "बल क्या है?",
        "marathi": "जडत्व म्हणजे काय?"
    }
    
    results = {}
    
    for lang, question in test_questions.items():
        try:
            result = tutor_router(question)
            results[lang] = {
                "question": question,
                "detected_language": result["language"],
                "mode": result["mode"],
                "answer_preview": result["text"][:100] + "..."
            }
        except Exception as e:
            results[lang] = {
                "question": question,
                "error": str(e)
            }
    
    return results

# =========================
# RUN SERVER
# =========================
if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting AI Tutor API server...")
    
    uvicorn.run(
        app,
        host="0.0.0.0",  # Listen on all interfaces
        port=8000,
        log_level="info"
    )