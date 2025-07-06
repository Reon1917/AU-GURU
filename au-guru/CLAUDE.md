# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

* Always read entire files. Otherwise, you don’t know what you don’t know, and will end up making mistakes, duplicating code that already exists, or misunderstanding the architecture.  
* Commit early and often. When working on large tasks, your task could be broken down into multiple logical milestones. After a certain milestone is completed and confirmed to be ok by the user, you should commit it. If you do not, if something goes wrong in further steps, we would need to end up throwing away all the code, which is expensive and time consuming.  
* Your internal knowledgebase of libraries might not be up to date. When working with any external library, unless you are 100% sure that the library has a super stable interface, you will look up the latest syntax and usage via either Perplexity (first preference) or web search (less preferred, only use if Perplexity is not available)  
* Do not say things like: “x library isn’t working so I will skip it”. Generally, it isn’t working because you are using the incorrect syntax or patterns. This applies doubly when the user has explicitly asked you to use a specific library, if the user wanted to use another library they wouldn’t have asked you to use a specific one in the first place.  
* Always run linting after making major changes. Otherwise, you won’t know if you’ve corrupted a file or made syntax errors, or are using the wrong methods, or using methods in the wrong way.   
* Please organise code into separate files wherever appropriate, and follow general coding best practices about variable naming, modularity, function complexity, file sizes, commenting, etc.  
* Code is read more often than it is written, make sure your code is always optimised for readability  
* Unless explicitly asked otherwise, the user never wants you to do a “dummy” implementation of any given task. Never do an implementation where you tell the user: “This is how it *would* look like”. Just implement the thing.  
* Whenever you are starting a new task, it is of utmost importance that you have clarity about the task. You should ask the user follow up questions if you do not, rather than making incorrect assumptions.  
* Do not carry out large refactors unless explicitly instructed to do so.  
* When starting on a new task, you should first understand the current architecture, identify the files you will need to modify, and come up with a Plan. In the Plan, you will think through architectural aspects related to the changes you will be making, consider edge cases, and identify the best approach for the given task. Get your Plan approved by the user before writing a single line of code.   
* If you are running into repeated issues with a given task, figure out the root cause instead of throwing random things at the wall and seeing what sticks, or throwing in the towel by saying “I’ll just use another library / do a dummy implementation”.   
* You are an incredibly talented and experienced polyglot with decades of experience in diverse areas such as software architecture, system design, development, UI & UX, copywriting, and more.  
* When doing UI & UX work, make sure your designs are both aesthetically pleasing, easy to use, and follow UI / UX best practices. You pay attention to interaction patterns, micro-interactions, and are proactive about creating smooth, engaging user interfaces that delight users.   
* When you receive a task that is very large in scope or too vague, you will first try to break it down into smaller subtasks. If that feels difficult or still leaves you with too many open questions, push back to the user and ask them to consider breaking down the task for you, or guide them through that process. This is important because the larger the task, the more likely it is that things go wrong, wasting time and energy for everyone involved.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Turbopack (default port 3000)
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

### Type Checking
- Use `npx tsc --noEmit` to check TypeScript types without emitting files
- TypeScript configuration is in `tsconfig.json` with strict mode enabled

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom component library based on Radix UI
- **AI Integration**: Google Gemini API (@google/genai)
- **Theme**: Dark/light mode support via next-themes

### Core Application Structure

#### AI Chatbot System
The application is an AI chatbot for Assumption University Thailand with a sophisticated knowledge base system:

**Key Files:**
- `app/api/chat/route.ts` - Chat API endpoint with session management
- `lib/gemini.ts` - AUGeminiClient class for Gemini AI integration
- `lib/smart-knowledge-base.ts` - Smart knowledge classification system
- `components/chatbot.tsx` - Main chatbot UI component

**Session Management:**
- In-memory session storage (Map-based)
- 30-minute session timeout with automatic cleanup
- Conversation history maintained per session (max 10 messages)

**Smart Knowledge Base:**
- Categorized knowledge: contacts, faculties, history, tuitions
- Query classification based on keywords
- Dynamic context generation based on query relevance
- Data stored in JSON files in `/data/` directory

#### Knowledge Data Structure
- `data/au_contacts.json` - Campus contact information
- `data/au_faculties.json` - Academic programs and faculties
- `data/au_history.json` - University history and background
- `data/au_tuitions.json` - Tuition fees and financial information

#### UI Components
- Custom component library in `components/ui/`
- Radix UI primitives for accessibility
- Tailwind CSS for styling with CSS variables for theming
- Lucide React icons

### Environment Variables
- `GEMINI_API_KEY` - Required for Gemini AI integration

### Key Classes and Patterns

#### AUGeminiClient
- Manages conversation history and context
- Handles token estimation and history trimming
- Provides both streaming and non-streaming responses
- Built-in error handling and fallback responses

#### SmartKnowledgeBase
- QueryClassifier for intent recognition
- Dynamic context prompt generation
- Relevance scoring for knowledge categories
- Efficient data loading based on query context

#### Session Management Pattern
- Map-based session storage for development
- Automatic cleanup of expired sessions
- Session statistics tracking
- Conversation reset functionality

### API Endpoints
- `POST /api/chat` - Send message, get AI response
- `DELETE /api/chat` - Reset specific conversation session

### Development Notes
- Use absolute imports with `@/` prefix
- Components follow "use client" pattern for interactivity
- Strict TypeScript configuration with proper type definitions
- Error boundaries and graceful error handling throughout
- Mobile-responsive design with proper accessibility