from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
from sqlmodel import Session, SQLModel
import logging

from .routers import challenges, conversations, user
from .database import engine
from .dependencies import get_session
from sqlmodel import select

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    SQLModel.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield

# Create FastAPI app
app = FastAPI(
    title="PennyLane Support API",
    description="API for PennyLane Support Platform - A community-driven support system for PennyLane coding challenges",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Include routers
app.include_router(
    challenges.router,
    tags=["Challenges"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    conversations.router,
    tags=["Conversations"],
    responses={404: {"description": "Not found"}},
)

app.include_router(
    user.router,
    tags=["User"],
    responses={404: {"description": "Not found"}},
)

# Health check endpoint
@app.get("/api/health", tags=["System"])
async def health_check(session: Session = Depends(get_session)):
    """Health check endpoint."""
    try:
        # Test database connection
        session.exec(select(1))
        return {
            "status": "healthy",
            "version": app.version,
            "database": "connected",
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "version": app.version,
            "database": "disconnected",
            "error": str(e),
        }, 503
