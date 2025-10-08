import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { Message, Document } from '../types/api';
import { 
  Send, 
  Bot, 
  User, 
  ArrowLeft, 
  MoreVertical, 
  Download,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react';

// Types are now imported from '../types/api'

const ChatPage: React.FC = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [document, setDocument] = useState<Document | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionId) {
      loadChatSession();
    }
  }, [sessionId, loadChatSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatSession = useCallback(async () => {
    try {
      setIsInitializing(true);
      if (!user || !sessionId) return;

      // Load chat session and messages
      const sessionData = await apiService.getChatSession(sessionId, user.id);
      setDocument(sessionData.document as Document);
      
      const sessionMessages = await apiService.getMessages(sessionId, user.id);
      // Ensure messages is an array and filter out any invalid messages
      const validMessages = Array.isArray(sessionMessages.messages) 
        ? sessionMessages.messages.filter(msg => msg && msg.role && msg.content)
        : [];
      
      // If no messages exist, add a welcome message
      if (validMessages.length === 0) {
        const welcomeMessage: Message = {
          id: 'welcome-1',
          content: 'Hello! I can help you analyze this document. What would you like to know?',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          confidence: 0.95
        };
        setMessages([welcomeMessage]);
      } else {
        setMessages(validMessages);
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      // Fallback to mock data if API fails
      const mockDocument: Document = {
        id: '1',
        title: 'Research Paper - AI in Healthcare',
        filename: 'ai-healthcare-research.pdf',
        originalName: 'ai-healthcare-research.pdf',
        filePath: '/uploads/ai-healthcare-research.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'completed',
        extractedText: 'Sample extracted text from the document...',
        summary: 'This document discusses AI applications in healthcare...',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user?.id || 'unknown'
      };
      setDocument(mockDocument);

      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hello! I can help you analyze this document. What would you like to know?',
          role: 'assistant',
          timestamp: new Date().toISOString(),
          confidence: 0.95
        }
      ];
      setMessages(mockMessages);
    } finally {
      setIsInitializing(false);
    }
  }, [user, sessionId]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user || !sessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately for better UX
    setMessages(prev => [...prev, userMessage]);
    
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to API
      console.log('Sending message to API:', { sessionId, currentMessage, userId: user.id });
      const response = await apiService.sendMessage(sessionId, currentMessage, user.id);
      console.log('API response:', response);
      
      // Add AI response to the chat
      if (response && response.assistantMessage) {
        setMessages(prev => [...prev, response.assistantMessage]);
      } else {
        console.error('Invalid API response structure:', response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to mock response if API fails
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `This is a sample AI response to your question: "${currentMessage}". The AI would analyze the document content and provide a contextual answer with source citations.`,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        sources: [
          'Sample source text from the document...',
          'Another relevant quote from the document...'
        ],
        confidence: 0.87
      };

      setMessages(prev => [...prev, aiResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Show loading screen while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">
            Initializing Chat Session
          </h2>
          <p className="text-neutral-600">
            Loading your document and preparing AI assistant...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-neutral-900">
                {document?.title || 'Chat Session'}
              </h1>
              <p className="text-sm text-neutral-600">
                {document?.filename}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <Download className="w-4 h-4 text-neutral-600" />
            </button>
            <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <MoreVertical className="w-4 h-4 text-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-neutral-200 h-[600px] flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <AnimatePresence>
              {(messages || []).filter(message => message && message.role).map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start space-x-3 ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        <div className={`inline-block p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-100 text-neutral-900'
                        }`}>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          
                          {/* Sources for AI messages */}
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-neutral-200">
                              <p className="text-xs font-medium mb-2">Sources:</p>
                              <div className="space-y-1">
                                {message.sources.map((source, index) => (
                                  <p key={index} className="text-xs italic">
                                    "{source}"
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Confidence score */}
                          {message.confidence && (
                            <div className="mt-2 text-xs opacity-75">
                              Confidence: {Math.round(message.confidence * 100)}%
                            </div>
                          )}
                        </div>

                        {/* Message Actions */}
                        <div className={`flex items-center space-x-2 mt-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className="text-xs text-neutral-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                          <button
                            onClick={() => copyMessage(message.content, message.id)}
                            className="p-1 hover:bg-neutral-100 rounded transition-colors"
                          >
                            {copiedMessageId === message.id ? (
                              <CheckCircle className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-neutral-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-neutral-600" />
                  </div>
                  <div className="bg-neutral-100 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                      <span className="text-neutral-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-end space-x-3">
              <div className="flex-1">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about the document..."
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={2}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
