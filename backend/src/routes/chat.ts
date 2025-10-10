import express from 'express';
import geminiService from '../services/geminiService';
import databaseService from '../services/databaseService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create new chat session
router.post('/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { documentId, title } = req.body;
    const userId = req.user?.userId;

    if (!documentId || !userId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    // Verify document exists and belongs to user
    console.log('Looking for document ID:', documentId);
    console.log('User ID:', userId);
    const document = await databaseService.getDocumentById(documentId);
    console.log('Document found:', document ? 'Yes' : 'No');
    if (document) {
      console.log('Document userId:', document.userId);
      console.log('Request userId:', userId);
      console.log('User match:', document.userId === userId);
    }
    if (!document || document.userId !== userId) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    const session = await databaseService.createChatSession({
      title: title || `Chat about ${document.title}`,
      userId,
      documentId,
    });

    res.status(201).json({
      message: 'Chat session created successfully',
      session: {
        id: session.id,
        title: session.title,
        documentId: session.documentId,
        userId: session.userId,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Get single chat session with document info
router.get('/sessions/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const session = await databaseService.getChatSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const document = await databaseService.getDocumentById(session.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const messages = await databaseService.getMessagesBySessionId(sessionId);

    res.json({
      sessionId: session.id,
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename
      },
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        sources: (msg as any).sources ? JSON.parse((msg as any).sources) : [],
        confidence: (msg as any).confidence || 0
      }))
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch chat session' });
  }
});

// Send message to chat session
router.post('/sessions/:sessionId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get chat session
    const session = await databaseService.getChatSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    // Get document content
    const document = await databaseService.getDocumentById(session.documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check document processing status
    if (document.status === 'processing') {
      return res.status(400).json({ 
        error: 'Document is still being processed. Please wait a moment and try again.',
        status: 'processing'
      });
    }

    if (document.status === 'error') {
      return res.status(400).json({ 
        error: 'Document processing failed. Please try re-uploading the document.',
        status: 'error'
      });
    }

    // Check if extracted text is available
    if (!document.extractedText || document.extractedText.trim() === '') {
      return res.status(400).json({ 
        error: 'Document text extraction failed. This may be due to an image-based PDF or encryption. Please try with a different document.',
        status: 'no_text'
      });
    }

    // Add user message to database
    const userMessage = await databaseService.addMessage({
      sessionId,
      role: 'user',
      content: message,
    });

    // Get chat history for context
    const chatHistory = await databaseService.getMessagesBySessionId(sessionId);

    // Generate AI response using real document content
    let aiContent = 'I apologize, but I cannot process your question at the moment.';
    let sources: string[] = [];
    let confidence = 0.0;

    try {
      const aiResponse = await geminiService.answerQuestion(
        message, 
        document.extractedText, 
        chatHistory.slice(-5) // Last 5 messages for context
      );
      
      if (aiResponse && typeof aiResponse === 'object' && aiResponse.answer) {
        aiContent = aiResponse.answer;
        sources = aiResponse.sources || [];
        confidence = aiResponse.confidence || 0.8;
      }
    } catch (error) {
      console.error('AI response error:', error);
      aiContent = 'I apologize, but I encountered an error while processing your question. Please try again.';
    }

    // Add AI response to database
    const aiMessage = await databaseService.addMessage({
      sessionId,
      role: 'assistant',
      content: aiContent,
    });

    res.json({
      message: 'Message sent successfully',
      userMessage: {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
      },
      assistantMessage: {
        id: aiMessage.id,
        role: aiMessage.role,
        content: aiMessage.content,
        timestamp: aiMessage.timestamp,
        sources: sources,
        confidence: confidence,
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get chat session messages
router.get('/sessions/:sessionId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const session = await databaseService.getChatSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const messages = await databaseService.getMessagesBySessionId(sessionId);

    res.json({
      sessionId: session.id,
      messages: messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        sources: (msg as any).sources ? JSON.parse((msg as any).sources) : [],
        confidence: (msg as any).confidence || 0
      }))
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get all chat sessions for a user
router.get('/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const sessions = await databaseService.getChatSessionsByUserId(userId);

    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        title: session.title,
        documentId: session.documentId,
        userId: session.userId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const session = await databaseService.getChatSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    await databaseService.deleteChatSession(sessionId);

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

export default router;
