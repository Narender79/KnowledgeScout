// API Response Types
export interface ApiResponse<T> {
  message: string;
  data?: T;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

// Document Types
export interface Document {
  id: string;
  title: string;
  filename: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: string;
  extractedText?: string;
  summary?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface DocumentResponse {
  message: string;
  document: Document;
}

export interface DocumentsResponse {
  documents: Document[];
}

// Chat Types
export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  sources?: string[];
  confidence?: number;
}

export interface ChatSession {
  id: string;
  title?: string;
  documentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatSessionWithDocument extends ChatSession {
  document: {
    id: string;
    title: string;
    filename: string;
  };
  messages: Message[];
}

export interface ChatSessionResponse {
  message: string;
  session: ChatSession;
}

export interface MessagesResponse {
  sessionId: string;
  document: {
    id: string;
    title: string;
    filename: string;
  };
  messages: Message[];
}

export interface SendMessageResponse {
  message: string;
  userMessage: Message;
  assistantMessage: Message;
}

export interface ChatSessionsResponse {
  sessions: ChatSessionWithDocument[];
}

// AI Types
export interface SummaryResponse {
  message: string;
  summary: string;
}

export interface QuestionsResponse {
  message: string;
  questions: string[];
}
