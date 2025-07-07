# FastAPI Backend Implementation Plan

## Overview

This document outlines the implementation plan for adding FastAPI as a backend service to the AU-GURU project. FastAPI will handle API endpoints, business logic, and data management while the Next.js frontend will consume these APIs.

## Architecture Overview

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   Next.js       │◄──────────────►│   FastAPI       │
│   Frontend      │                 │   Backend       │
│   (Port 3000)   │                 │   (Port 8000)   │
└─────────────────┘                 └─────────────────┘
                                            │
                                            ▼
                                    ┌─────────────────┐
                                    │   Database      │
                                    │   (SQLite/      │
                                    │   PostgreSQL)   │
                                    └─────────────────┘
```

## Installation Requirements

### 1. Python Dependencies

Create a `requirements.txt` file in the project root:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
sqlalchemy==2.0.23
databases[sqlite]==0.8.0
alembic==1.13.1
httpx==0.25.2
python-dotenv==1.0.0
```

### 2. Development Dependencies

Create a `requirements-dev.txt` file:

```txt
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.11.0
flake8==6.1.0
mypy==1.7.1
```

### 3. Installation Commands

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

## Project Structure

```
au-guru/
├── app/                    # Next.js frontend (existing)
├── components/             # React components (existing)
├── lib/                    # Frontend utilities (existing)
├── data/                   # JSON data files (existing)
├── backend/                # FastAPI backend (new)
│   ├── __init__.py
│   ├── main.py            # FastAPI app entry point
│   ├── config.py          # Configuration settings
│   ├── database.py        # Database connection
│   ├── models/            # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   └── chat.py
│   ├── schemas/           # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── chat.py
│   ├── api/               # API routes
│   │   ├── __init__.py
│   │   ├── deps.py        # Dependencies
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── chat.py
│   │       ├── users.py
│   │       └── knowledge.py
│   ├── core/              # Core functionality
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── security.py
│   │   └── gemini.py      # Gemini AI integration
│   ├── services/          # Business logic
│   │   ├── __init__.py
│   │   ├── chat_service.py
│   │   └── knowledge_service.py
│   └── utils/             # Utility functions
│       ├── __init__.py
│       └── helpers.py
├── alembic/               # Database migrations
├── tests/                 # Test files
├── requirements.txt       # Python dependencies
├── requirements-dev.txt   # Development dependencies
├── alembic.ini           # Alembic configuration
└── .env                  # Environment variables
```

## Implementation Steps

### Phase 1: Basic FastAPI Setup

#### 1. Create FastAPI Application (`backend/main.py`)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.v1 import chat, users, knowledge
from backend.config import settings

app = FastAPI(
    title="AU-GURU API",
    description="Backend API for AU-GURU Chatbot",
    version="1.0.0"
)

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(knowledge.router, prefix="/api/v1/knowledge", tags=["knowledge"])

@app.get("/")
async def root():
    return {"message": "AU-GURU API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

#### 2. Configuration (`backend/config.py`)

```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./au_guru.db"
    
    # API Keys
    GEMINI_API_KEY: str
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Phase 2: Database Setup

#### 1. Database Models (`backend/models/chat.py`)

```python
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String)  # "user" or "assistant"
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="messages")
```

#### 2. Database Connection (`backend/database.py`)

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Phase 3: API Endpoints

#### 1. Chat API (`backend/api/v1/chat.py`)

```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.chat import ChatRequest, ChatResponse
from backend.services.chat_service import ChatService

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Send a message to the chatbot"""
    chat_service = ChatService(db)
    return await chat_service.process_message(request)

@router.delete("/{session_id}")
async def reset_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Reset a chat session"""
    chat_service = ChatService(db)
    return await chat_service.reset_session(session_id)

@router.get("/{session_id}/history")
async def get_chat_history(
    session_id: str,
    db: Session = Depends(get_db)
):
    """Get chat history for a session"""
    chat_service = ChatService(db)
    return await chat_service.get_history(session_id)
```

#### 2. Pydantic Schemas (`backend/schemas/chat.py`)

```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True
```

### Phase 4: Business Logic

#### 1. Chat Service (`backend/services/chat_service.py`)

```python
from sqlalchemy.orm import Session
from backend.models.chat import ChatSession, ChatMessage
from backend.core.gemini import AUGeminiClient
from backend.services.knowledge_service import KnowledgeService
from backend.schemas.chat import ChatRequest, ChatResponse
from datetime import datetime
import uuid

class ChatService:
    def __init__(self, db: Session):
        self.db = db
        self.gemini_client = AUGeminiClient()
        self.knowledge_service = KnowledgeService()
    
    async def process_message(self, request: ChatRequest) -> ChatResponse:
        # Get or create session
        session = self._get_or_create_session(request.session_id)
        
        # Save user message
        user_message = ChatMessage(
            session_id=session.id,
            role="user",
            content=request.message
        )
        self.db.add(user_message)
        
        # Get knowledge context
        context = self.knowledge_service.get_context(request.message)
        
        # Get chat history
        history = self._get_session_history(session.id)
        
        # Generate response
        response = await self.gemini_client.generate_response(
            message=request.message,
            context=context,
            history=history
        )
        
        # Save assistant response
        assistant_message = ChatMessage(
            session_id=session.id,
            role="assistant",
            content=response
        )
        self.db.add(assistant_message)
        self.db.commit()
        
        return ChatResponse(
            response=response,
            session_id=session.id,
            timestamp=datetime.utcnow()
        )
    
    def _get_or_create_session(self, session_id: Optional[str]) -> ChatSession:
        if session_id:
            session = self.db.query(ChatSession).filter(
                ChatSession.id == session_id
            ).first()
            if session:
                return session
        
        # Create new session
        session = ChatSession(id=str(uuid.uuid4()))
        self.db.add(session)
        self.db.commit()
        return session
```

### Phase 5: Frontend Integration

#### 1. Update Next.js API Client

Create a new API client (`lib/api-client.ts`):

```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async sendMessage(message: string, sessionId?: string) {
    const response = await fetch(`${this.baseUrl}/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        session_id: sessionId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    return response.json();
  }

  async resetSession(sessionId: string) {
    const response = await fetch(`${this.baseUrl}/chat/${sessionId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to reset session');
    }

    return response.json();
  }
}
```

#### 2. Update Chatbot Component

Modify `components/chatbot.tsx` to use the new API client instead of the Next.js API route.

## Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Start FastAPI backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Next.js frontend
npm run dev
```

### 2. Database Migrations

```bash
# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migration
alembic upgrade head
```

### 3. Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=backend tests/
```

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=sqlite:///./au_guru.db

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000"]
```

## Benefits of This Architecture

1. **Separation of Concerns**: Frontend handles UI, backend handles business logic
2. **Scalability**: Backend can be scaled independently
3. **API Documentation**: FastAPI provides automatic OpenAPI documentation
4. **Type Safety**: Pydantic schemas ensure data validation
5. **Database Management**: SQLAlchemy provides robust ORM capabilities
6. **Testing**: Easier to test backend logic independently
7. **Deployment**: Backend and frontend can be deployed separately

## Next Steps

1. Implement Phase 1 (Basic FastAPI setup)
2. Set up database models and migrations
3. Create API endpoints
4. Implement business logic services
5. Update frontend to use new API
6. Add authentication and user management
7. Implement comprehensive testing
8. Set up production deployment

This plan provides a solid foundation for integrating FastAPI into your AU-GURU project while maintaining the existing Next.js frontend functionality.