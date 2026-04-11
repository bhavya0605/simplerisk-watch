from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine
from db import models
from api.routes import products, analysis, scrape, news_chat, auth

# Create all tables on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SimpleRisk Watch API",
    description="Financial Mis-Selling Detection System — Backend API",
    version="1.0.0",
)

# Allow React frontend to call the API locally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(products.router)
app.include_router(analysis.router)
app.include_router(scrape.router)
app.include_router(news_chat.router)
app.include_router(auth.router)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "SimpleRisk Watch API"}
