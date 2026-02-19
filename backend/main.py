from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from router import tutor_router

app = FastAPI()

# Enable CORS for Expo / mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

@app.post("/predict")
def predict(data: QueryRequest):
    result = tutor_router(data.query)
    return result
