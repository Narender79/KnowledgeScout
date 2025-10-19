# Knowledge Scout - Comprehensive Interview Preparation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [File Structure & Responsibilities](#file-structure--responsibilities)
4. [Core Functionality & Workflows](#core-functionality--workflows)
5. [Database Schema & Models](#database-schema--models)
6. [API Endpoints & Routes](#api-endpoints--routes)
7. [Authentication & Security](#authentication--security)
8. [AI Integration & Services](#ai-integration--services)
9. [Frontend Components & Pages](#frontend-components--pages)
10. [Deployment & DevOps](#deployment--devops)
11. [Common Interview Questions](#common-interview-questions)
12. [Technical Deep Dive Questions](#technical-deep-dive-questions)

---

## Project Overview

**Knowledge Scout** is an intelligent document analysis and Q&A platform that transforms documents into interactive, intelligent conversations. It allows users to upload documents (PDF, DOC, DOCX, TXT, RTF), extract text using AI, and engage in natural language Q&A sessions about the document content.

### Key Features:
- **Document Upload & Analysis**: Support for multiple file types with AI-powered text extraction
- **Intelligent Q&A**: Natural language questions with contextual answers and source citations
- **Collaborative Workspace**: Team-based document sharing and real-time collaboration
- **History Dashboard**: Document library with search, filter, and usage analytics
- **Modern UI**: Responsive design with accessibility focus and smooth animations

---

## Architecture & Tech Stack

### Backend Stack
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer middleware
- **AI Integration**: Google Gemini 2.0 Flash
- **PDF Processing**: pdf-parse library
- **Security**: Helmet, CORS, bcryptjs

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Build Tool**: Create React App

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Frontend Hosting**: Vercel/Netlify
- **Backend Hosting**: Railway
- **Database**: PostgreSQL (Railway)

---

## File Structure & Responsibilities

### Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── index.ts                 # Main server entry point
│   ├── middleware/
│   │   └── auth.ts             # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts             # User authentication routes
│   │   ├── documents.ts        # Document management routes
│   │   ├── chat.ts             # Chat/Q&A routes
│   │   └── ai.ts               # AI-specific routes
│   ├── services/
│   │   ├── databaseService.ts  # Database operations
│   │   └── geminiService.ts    # AI service integration
│   └── scripts/
│       └── initDemoUser.ts     # Demo user initialization
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── uploads/                    # File storage directory
└── dist/                       # Compiled JavaScript
```

### Frontend Structure (`/frontend`)

```
frontend/
├── src/
│   ├── App.tsx                 # Main application component
│   ├── components/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── Footer.tsx          # Application footer
│   │   └── DemoModal.tsx       # Demo user modal
│   ├── pages/
│   │   ├── HomePage.tsx        # Landing page
│   │   ├── LoginPage.tsx       # User login
│   │   ├── SignupPage.tsx      # User registration
│   │   ├── DashboardPage.tsx   # Document dashboard
│   │   ├── UploadPage.tsx      # Document upload
│   │   ├── ChatPage.tsx        # Q&A interface
│   │   └── AboutPage.tsx       # About page
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication context
│   ├── services/
│   │   └── api.ts              # API service layer
│   ├── types/
│   │   └── api.ts              # TypeScript type definitions
│   └── index.tsx               # Application entry point
└── build/                      # Production build
```

---

## Core Functionality & Workflows

### 1. User Authentication Workflow

```mermaid
graph TD
    A[User Registration/Login] --> B[Validate Credentials]
    B --> C[Generate JWT Token]
    C --> D[Store Token in localStorage]
    D --> E[Set User Context]
    E --> F[Redirect to Dashboard]
```

**Key Files:**
- `backend/src/routes/auth.ts` - Authentication endpoints
- `frontend/src/contexts/AuthContext.tsx` - Auth state management
- `backend/src/middleware/auth.ts` - JWT middleware

### 2. Document Upload & Processing Workflow

```mermaid
graph TD
    A[User Uploads Document] --> B[Multer File Upload]
    B --> C[Save File to /uploads]
    C --> D[Create Document Record]
    D --> E[Extract Text from File]
    E --> F[Generate AI Summary]
    F --> G[Update Document Status]
    G --> H[Return Processing Status]
```

**Key Files:**
- `backend/src/routes/documents.ts` - Document endpoints
- `backend/src/services/databaseService.ts` - Database operations
- `frontend/src/pages/UploadPage.tsx` - Upload interface

### 3. Q&A Chat Workflow

```mermaid
graph TD
    A[User Asks Question] --> B[Create/Get Chat Session]
    B --> C[Save User Message]
    C --> D[Send to Gemini AI]
    D --> E[Process with Document Context]
    E --> F[Generate AI Response]
    F --> G[Save AI Message]
    G --> H[Return to Frontend]
```

**Key Files:**
- `backend/src/routes/chat.ts` - Chat endpoints
- `backend/src/services/geminiService.ts` - AI integration
- `frontend/src/pages/ChatPage.tsx` - Chat interface

---

## Database Schema & Models

### Prisma Schema (`backend/prisma/schema.prisma`)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  documents     Document[]
  chatSessions  ChatSession[]
  teams         TeamMember[]
  createdTeams  Team[]        @relation("TeamCreator")
}

model Document {
  id           String   @id @default(cuid())
  title        String
  filename     String
  originalName String
  filePath     String
  fileSize     Int
  mimeType     String
  status       String   @default("processing")
  extractedText String?
  summary      String?
  metadata     Json?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  userId       String

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  chatSessions ChatSession[]
}

model ChatSession {
  id         String   @id @default(cuid())
  title      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  userId     String
  documentId String

  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  document Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  messages Message[]
}

model Message {
  id        String   @id @default(cuid())
  content   String
  role      String   // user, assistant
  timestamp DateTime @default(now())
  sessionId String

  session ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}
```

---

## API Endpoints & Routes

### Authentication Routes (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `POST /init-demo` - Initialize demo user

### Document Routes (`/api/documents`)
- `POST /upload` - Upload document (multipart/form-data)
- `GET /` - Get user's documents
- `GET /:id` - Get specific document
- `POST /:id/reprocess` - Reprocess document
- `GET /:id/test-extraction` - Test text extraction
- `DELETE /:id` - Delete document

### Chat Routes (`/api/chat`)
- `POST /sessions` - Create chat session
- `GET /sessions` - Get user's chat sessions
- `GET /sessions/:id` - Get specific session
- `POST /sessions/:id/messages` - Send message
- `GET /sessions/:id/messages` - Get session messages
- `DELETE /sessions/:id` - Delete session

### AI Routes (`/api`)
- `POST /documents/:id/summary` - Generate summary
- `POST /documents/:id/questions` - Generate questions

---

## Authentication & Security

### JWT Implementation
```typescript
// Token Generation
const token = jwt.sign(
  { userId: user.id, email: user.email },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '7d' }
);

// Token Verification Middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

### Security Features
- **Password Hashing**: bcryptjs with salt rounds
- **CORS Configuration**: Restricted to frontend domain
- **Helmet**: Security headers
- **File Upload Validation**: MIME type and size limits
- **Input Validation**: Request body validation

---

## AI Integration & Services

### Gemini Service (`backend/src/services/geminiService.ts`)

```typescript
class GeminiService {
  private genAI: GoogleGenerativeAI;

  async generateDocumentSummary(documentText: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const prompt = `Please provide a comprehensive summary of the following document...`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async answerQuestion(question: string, documentText: string, chatHistory: any[]): Promise<{
    answer: string;
    sources: string[];
    confidence: number;
  }> {
    // Implementation for Q&A with document context
  }
}
```

### AI Features
- **Document Summarization**: Generate concise summaries
- **Question Answering**: Context-aware responses
- **Key Point Extraction**: Identify important concepts
- **Question Generation**: Suggest relevant questions

---

## Frontend Components & Pages

### Key Components

#### AuthContext (`frontend/src/contexts/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}
```

#### API Service (`frontend/src/services/api.ts`)
```typescript
class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('token');
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };
    // Implementation
  }
}
```

### Page Components

#### DashboardPage
- Document list with search and filtering
- Statistics cards
- Recent activity feed
- Document management actions

#### UploadPage
- Drag-and-drop file upload
- Real-time processing status
- File validation and error handling
- Integration with document processing

#### ChatPage
- Real-time chat interface
- Message history
- AI response handling
- Copy and export functionality

---

## Deployment & DevOps

### Docker Configuration
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: knowledge_scout
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password123
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password123@postgres:5432/knowledge_scout
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

### Environment Variables
```env
# Backend
DATABASE_URL=postgresql://username:password@localhost:5432/knowledge_scout
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads

# Frontend
REACT_APP_API_URL=http://localhost:5000
```

---

## Common Interview Questions

### General Questions

**Q: What is Knowledge Scout and what problem does it solve?**
A: Knowledge Scout is an intelligent document analysis platform that allows users to upload documents and engage in natural language Q&A sessions about the content. It solves the problem of quickly extracting insights from large documents without having to read through them manually.

**Q: What technologies did you use and why?**
A: 
- **Backend**: Node.js with Express for rapid API development and TypeScript for type safety
- **Database**: PostgreSQL with Prisma ORM for robust data management and type-safe queries
- **Frontend**: React with TypeScript for component-based UI development
- **AI**: Google Gemini 2.0 for advanced natural language processing
- **Styling**: Tailwind CSS for rapid UI development with consistent design

**Q: How does the authentication system work?**
A: The system uses JWT tokens for stateless authentication. Users register/login with email and password, which is hashed using bcrypt. Upon successful authentication, a JWT token is generated and stored in localStorage. The token is included in subsequent API requests via the Authorization header.

**Q: Explain the document processing workflow.**
A: 
1. User uploads a document via the frontend
2. Multer middleware handles file upload and saves to `/uploads` directory
3. A document record is created in the database with "processing" status
4. Text is extracted from the file using appropriate libraries (pdf-parse for PDFs)
5. AI generates a summary of the extracted text
6. Document status is updated to "completed" with extracted text and summary

**Q: How do you handle file uploads securely?**
A: 
- File type validation using MIME type checking
- File size limits (50MB maximum)
- Secure file storage in dedicated `/uploads` directory
- Unique filename generation to prevent conflicts
- User authentication required for uploads

### Technical Questions

**Q: What is the database schema design?**
A: The schema includes four main models:
- **User**: Stores user authentication and profile data
- **Document**: Stores uploaded file metadata and extracted content
- **ChatSession**: Links users to documents for Q&A sessions
- **Message**: Stores individual chat messages within sessions

**Q: How do you handle AI integration?**
A: The GeminiService class encapsulates all AI functionality:
- Document summarization using Gemini 2.0 Flash
- Question answering with document context
- Key point extraction and question generation
- Error handling for AI service unavailability

**Q: Explain the chat functionality.**
A: 
1. Users create a chat session linked to a specific document
2. Messages are stored in the database with role (user/assistant)
3. User messages are sent to Gemini AI with document context and chat history
4. AI responses are generated and stored
5. Frontend displays the conversation in real-time

**Q: How do you handle errors and edge cases?**
A: 
- Try-catch blocks around all async operations
- Specific error messages for different failure scenarios
- Graceful degradation when AI services are unavailable
- Input validation on both frontend and backend
- File processing error handling with user feedback

**Q: What are the security considerations?**
A: 
- JWT token authentication with expiration
- Password hashing with bcrypt
- CORS configuration for cross-origin requests
- File upload validation and sanitization
- SQL injection prevention through Prisma ORM
- Environment variable protection for sensitive data

---

## Technical Deep Dive Questions

### Backend Architecture

**Q: Explain the middleware pattern used in the application.**
A: The application uses Express middleware for:
- **Authentication**: JWT token verification for protected routes
- **CORS**: Cross-origin request handling
- **Security**: Helmet for security headers
- **Logging**: Morgan for HTTP request logging
- **File Upload**: Multer for multipart form data handling

**Q: How do you structure the API routes?**
A: Routes are organized by feature:
- `/api/auth` - Authentication endpoints
- `/api/documents` - Document management
- `/api/chat` - Chat and Q&A functionality
- Each route file contains related endpoints with proper error handling

**Q: Explain the service layer pattern.**
A: Services encapsulate business logic:
- **DatabaseService**: All database operations using Prisma
- **GeminiService**: AI integration and processing
- Services are imported and used by route handlers
- Promotes separation of concerns and testability

### Frontend Architecture

**Q: How do you manage state in the React application?**
A: 
- **React Context API** for global authentication state
- **Local component state** for UI-specific data
- **localStorage** for persistent user data and tokens
- Custom hooks for reusable logic

**Q: Explain the component structure and reusability.**
A: 
- **Page components** for major application sections
- **Shared components** (Header, Footer) for common UI elements
- **Context providers** for state management
- **Custom hooks** for reusable logic
- **TypeScript interfaces** for type safety

**Q: How do you handle API communication?**
A: 
- Centralized **ApiService class** for all HTTP requests
- **TypeScript interfaces** for request/response types
- **Error handling** with user-friendly messages
- **Loading states** for better UX
- **Token management** for authenticated requests

### Database Design

**Q: Explain the relationship between your database models.**
A: 
- **One-to-Many**: User → Documents, User → ChatSessions
- **One-to-Many**: Document → ChatSessions
- **One-to-Many**: ChatSession → Messages
- **Cascade deletes** ensure data consistency when users or documents are removed

**Q: How do you handle database migrations?**
A: 
- **Prisma migrations** for schema changes
- **Version-controlled** migration files
- **Environment-specific** database configurations
- **Seed scripts** for initial data setup

### AI Integration

**Q: How do you integrate with Google Gemini API?**
A: 
- **GoogleGenerativeAI client** initialization
- **Model selection** (gemini-2.0-flash-exp)
- **Prompt engineering** for different use cases
- **Error handling** for API failures
- **Rate limiting** and retry logic

**Q: Explain the prompt engineering approach.**
A: 
- **Context-aware prompts** including document content
- **Chat history integration** for conversational continuity
- **Structured responses** with confidence scores
- **Fallback handling** when AI is unavailable

### Performance & Scalability

**Q: How do you handle file processing performance?**
A: 
- **Asynchronous processing** using setImmediate
- **Polling mechanism** for status updates
- **File size limits** to prevent memory issues
- **Background processing** without blocking API responses

**Q: What scalability considerations did you implement?**
A: 
- **Docker containerization** for easy deployment
- **Environment-based configuration**
- **Database connection pooling** via Prisma
- **Static file serving** for uploaded documents
- **Horizontal scaling** ready architecture

### Testing & Quality

**Q: How do you ensure code quality?**
A: 
- **TypeScript** for type safety and better IDE support
- **ESLint** configuration for code standards
- **Error boundaries** in React components
- **Input validation** on both client and server
- **Environment variable** validation

**Q: What monitoring and logging do you have?**
A: 
- **Console logging** for development debugging
- **Morgan HTTP logging** for request tracking
- **Error logging** with stack traces
- **Health check endpoints** for service monitoring

---

## Demo User Credentials

For testing and demonstration purposes:
- **Email**: admin@mail.com
- **Password**: admin123

This demo user is automatically created when the backend starts up and provides access to all features of the application.

---

## Key Takeaways for Interview

1. **Full-Stack Proficiency**: Demonstrates both frontend and backend development skills
2. **Modern Tech Stack**: Uses current industry-standard technologies
3. **AI Integration**: Shows ability to integrate third-party AI services
4. **Security Awareness**: Implements proper authentication and security measures
5. **Database Design**: Shows understanding of relational database design
6. **API Design**: RESTful API design with proper error handling
7. **User Experience**: Focus on responsive design and smooth interactions
8. **DevOps Knowledge**: Docker containerization and deployment strategies

This project showcases a comprehensive understanding of modern web development practices, from database design to AI integration, making it an excellent talking point for technical interviews.
