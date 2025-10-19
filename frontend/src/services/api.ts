import {
  AuthResponse,
  DocumentResponse,
  DocumentsResponse,
  ChatSessionResponse,
  ChatSessionsResponse,
  MessagesResponse,
  SendMessageResponse,
  SummaryResponse,
  QuestionsResponse
} from '../types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://knowledgescout-production.up.railway.app/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    // Don't set Content-Type for FormData - let browser set it automatically
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making API request:', {
        url,
        method: config.method || 'GET',
        hasBody: !!config.body,
        bodyType: config.body instanceof FormData ? 'FormData' : typeof config.body,
        headers: config.headers
      });
      
      const response = await fetch(url, config);
      
      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error body:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Response JSON:', result);
      return result;
    } catch (error) {
      console.error('API request failed:', {
        error: error.message,
        url,
        method: config.method || 'GET'
      });
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  // Documents
  async getDocuments(): Promise<DocumentsResponse> {
    return this.request<DocumentsResponse>('/documents');
  }

  async getDocument(id: string): Promise<DocumentResponse> {
    return this.request<DocumentResponse>(`/documents/${id}`);
  }

  async uploadDocument(file: File): Promise<DocumentResponse> {
    console.log('Uploading file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    const formData = new FormData();
    formData.append('document', file);
    
    console.log('FormData created, sending request to:', `${API_BASE_URL}/documents/upload`);

    return this.request<DocumentResponse>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async deleteDocument(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/documents/${id}`, {
      method: 'DELETE',
    });
  }

  async reprocessDocument(id: string): Promise<{ message: string; documentId: string; status: string }> {
    return this.request<{ message: string; documentId: string; status: string }>(`/documents/${id}/reprocess`, {
      method: 'POST',
    });
  }

  async testDocumentExtraction(id: string): Promise<any> {
    return this.request<any>(`/documents/${id}/test-extraction`);
  }

  // Chat Sessions
  async createChatSession(documentId: string, userId: string, title?: string): Promise<ChatSessionResponse> {
    console.log('API: Creating chat session with documentId:', documentId, 'userId:', userId);
    return this.request<ChatSessionResponse>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ documentId, userId, title }),
    });
  }

  async getChatSessions(userId: string): Promise<ChatSessionsResponse> {
    return this.request<ChatSessionsResponse>(`/chat/sessions?userId=${userId}`);
  }

  async getChatSession(sessionId: string, userId: string): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/chat/sessions/${sessionId}?userId=${userId}`);
  }

  async sendMessage(sessionId: string, message: string, userId: string): Promise<SendMessageResponse> {
    return this.request<SendMessageResponse>(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, userId }),
    });
  }

  async getMessages(sessionId: string, userId: string): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/chat/sessions/${sessionId}/messages?userId=${userId}`);
  }

  async deleteChatSession(sessionId: string, userId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/chat/sessions/${sessionId}?userId=${userId}`, {
      method: 'DELETE',
    });
  }

  // AI Features
  async generateSummary(documentId: string, userId: string): Promise<SummaryResponse> {
    return this.request<SummaryResponse>(`/documents/${documentId}/summary`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async generateQuestions(documentId: string, userId: string): Promise<QuestionsResponse> {
    return this.request<QuestionsResponse>(`/documents/${documentId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }
}

const apiService = new ApiService();
export default apiService;

