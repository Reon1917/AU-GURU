# Deployment Options for AU-GURU Project

## Overview

This document outlines suitable deployment options for the AU-GURU project, focusing on free tier solutions for:
- Next.js Frontend
- FastAPI Backend
- Database (Traditional + Vector Database for RAG)
- AI/ML Services

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js       │    │   FastAPI       │    │   Database      │
│   Frontend      │    │   Backend       │    │   (PostgreSQL)  │
│   (Vercel)      │    │   (Railway/     │    │   (Supabase/    │
│                 │◄──►│    Render)      │◄──►│    Railway)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Vector DB     │
                       │   (Pinecone/    │
                       │    Weaviate)    │
                       └─────────────────┘
```

## Frontend Deployment Options

### 1. Vercel (Recommended)
**Free Tier Limits:**
- 100 GB bandwidth/month
- 6,000 build minutes/month
- 1,000 serverless function invocations/day
- Custom domains included

**Setup:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Configuration (`vercel.json`):**
```json
{
  "builds": [
    {
      "src": "next.config.ts",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://your-backend-url.com"
  }
}
```

### 2. Netlify (Alternative)
**Free Tier Limits:**
- 100 GB bandwidth/month
- 300 build minutes/month
- 1,000 serverless function invocations/month

## Backend Deployment Options

### 1. Railway (Recommended)
**Free Tier Limits:**
- $5 credit/month (sufficient for small apps)
- 512 MB RAM
- 1 GB storage
- Custom domains

**Setup:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

**Configuration (`railway.json`):**
```json
{
  "build": {
    "builder": "DOCKERFILE"
  },
  "deploy": {
    "startCommand": "uvicorn backend.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 2. Render (Alternative)
**Free Tier Limits:**
- 750 hours/month
- 512 MB RAM
- Automatic deploys from Git

### 3. Fly.io (Alternative)
**Free Tier Limits:**
- 3 shared-cpu-1x VMs
- 160GB outbound data transfer

## Database Options

### 1. Traditional Database

#### Supabase (Recommended)
**Free Tier:**
- 500 MB database space
- 2 GB bandwidth/month
- 50k monthly active users
- Built-in authentication
- Real-time subscriptions

**Setup:**
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Start local development
supabase start
```

**Environment Variables:**
```env
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

#### Railway PostgreSQL (Alternative)
**Free Tier:**
- Part of Railway's $5 credit
- 1 GB storage
- Automatic backups

### 2. Vector Database for RAG

#### Pinecone (Recommended for Beginners)
**Free Tier:**
- 1 million vector dimensions
- 5 GB storage
- 2 million queries/month

**Setup:**
```python
# Install Pinecone
pip install pinecone-client

# Initialize
import pinecone
from pinecone import Pinecone

pc = Pinecone(api_key="your-api-key")

# Create index
pc.create_index(
    name="au-guru-knowledge",
    dimension=1536,  # OpenAI embedding dimension
    metric="cosine",
    spec=pinecone.ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )
)
```

**Integration Example:**
```python
# backend/services/vector_service.py
from pinecone import Pinecone
from openai import OpenAI
from backend.config import settings

class VectorService:
    def __init__(self):
        self.pc = Pinecone(api_key=settings.PINECONE_API_KEY)
        self.index = self.pc.Index("au-guru-knowledge")
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def embed_text(self, text: str) -> list[float]:
        """Generate embeddings for text"""
        response = await self.openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    
    async def store_knowledge(self, text: str, metadata: dict):
        """Store knowledge in vector database"""
        embedding = await self.embed_text(text)
        self.index.upsert(
            vectors=[(str(hash(text)), embedding, metadata)]
        )
    
    async def search_knowledge(self, query: str, top_k: int = 5):
        """Search for relevant knowledge"""
        query_embedding = await self.embed_text(query)
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        return results.matches
```

#### Weaviate Cloud (Alternative)
**Free Tier:**
- 1 cluster for 14 days (then sandbox)
- Good for experimentation

#### Qdrant Cloud (Alternative)
**Free Tier:**
- 1 GB storage
- 1 million vectors
- 1 cluster

## AI/ML Services

### 1. Google AI Studio / Gemini (Current)
**Free Tier:**
- 15 requests/minute
- 1 million tokens/month
- Good for development

### 2. OpenAI (For Embeddings)
**Free Tier:**
- $5 credit for new accounts
- Pay-per-use after credit exhausted

### 3. Hugging Face (Alternative)
**Free Tier:**
- Inference API with rate limits
- Good for open-source models

## Recommended Deployment Stack

### Option 1: Full Free Tier
```
Frontend: Vercel
Backend: Railway
Database: Supabase (PostgreSQL)
Vector DB: Pinecone
AI: Google Gemini + OpenAI Embeddings
```

### Option 2: Hybrid Approach
```
Frontend: Vercel
Backend: Render
Database: Railway PostgreSQL
Vector DB: Qdrant Cloud
AI: Google Gemini + Hugging Face Embeddings
```

## Environment Variables Setup

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres

# AI Services
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key

# Vector Database
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=au-guru-knowledge

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256

# CORS
ALLOWED_ORIGINS=["https://your-frontend.vercel.app"]
```

## Deployment Scripts

### Backend Deployment Script
```bash
#!/bin/bash
# deploy-backend.sh

echo "Building and deploying backend..."

# Build requirements
pip freeze > requirements.txt

# Deploy to Railway
railway up

echo "Backend deployed successfully!"
```

### Frontend Deployment Script
```bash
#!/bin/bash
# deploy-frontend.sh

echo "Building and deploying frontend..."

# Build application
npm run build

# Deploy to Vercel
vercel --prod

echo "Frontend deployed successfully!"
```

## RAG Implementation with Pinecone

### 1. Knowledge Ingestion
```python
# scripts/ingest_knowledge.py
import json
from backend.services.vector_service import VectorService

async def ingest_au_data():
    vector_service = VectorService()
    
    # Load existing JSON data
    with open('data/au_faculties.json', 'r') as f:
        faculties = json.load(f)
    
    # Process and store each faculty
    for faculty in faculties:
        text = f"{faculty['name']} - {faculty['description']}"
        metadata = {
            'type': 'faculty',
            'name': faculty['name'],
            'category': faculty.get('category', 'general')
        }
        await vector_service.store_knowledge(text, metadata)
    
    print("Knowledge ingestion completed!")
```

### 2. Enhanced Chat Service
```python
# backend/services/enhanced_chat_service.py
from backend.services.vector_service import VectorService
from backend.services.chat_service import ChatService

class EnhancedChatService(ChatService):
    def __init__(self, db: Session):
        super().__init__(db)
        self.vector_service = VectorService()
    
    async def process_message(self, request: ChatRequest) -> ChatResponse:
        # Search for relevant knowledge
        relevant_docs = await self.vector_service.search_knowledge(
            request.message, 
            top_k=3
        )
        
        # Enhance context with vector search results
        enhanced_context = self._build_enhanced_context(relevant_docs)
        
        # Generate response with enhanced context
        response = await self.gemini_client.generate_response(
            message=request.message,
            context=enhanced_context,
            history=self._get_session_history(session.id)
        )
        
        return ChatResponse(
            response=response,
            session_id=session.id,
            timestamp=datetime.utcnow()
        )
```

## Cost Estimation

### Monthly Costs (Free Tier)
- **Vercel**: $0 (within limits)
- **Railway**: $0 (within $5 credit)
- **Supabase**: $0 (within limits)
- **Pinecone**: $0 (within limits)
- **Google Gemini**: $0 (within limits)
- **OpenAI Embeddings**: ~$1-5/month (pay-per-use)

**Total Estimated Monthly Cost: $1-5/month**

## Scaling Considerations

### When to Upgrade:
1. **Traffic exceeds free tier limits**
2. **Need more database storage**
3. **Require better performance**
4. **Need advanced features**

### Upgrade Path:
- Vercel Pro: $20/month
- Railway Pro: $5-20/month
- Supabase Pro: $25/month
- Pinecone Starter: $70/month

## Security Considerations

### 1. API Security
- Use HTTPS everywhere
- Implement proper CORS policies
- Add rate limiting
- Use API keys securely

### 2. Database Security
- Use connection pooling
- Implement proper access controls
- Regular security updates
- Backup strategies

### 3. Vector Database Security
- Secure API keys
- Implement access controls
- Monitor usage patterns
- Regular security audits

## Monitoring and Observability

### 1. Application Monitoring
- Vercel Analytics (free)
- Railway Metrics (included)
- Supabase Dashboard (included)

### 2. Error Tracking
- Sentry (free tier available)
- LogRocket (free tier available)

### 3. Performance Monitoring
- Web Vitals (Vercel)
- Database performance (Supabase)
- API response times (Railway)

This deployment strategy provides a robust, scalable, and cost-effective solution for your AU-GURU project while staying within free tier limits for initial development and testing.