import express from 'express';
import geminiService from '../services/geminiService';
import databaseService from '../services/databaseService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create new chat session
router.post('/chat/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { documentId, title } = req.body;
    const userId = req.user?.userId;

    if (!documentId || !userId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    // Verify document exists and belongs to user
    const document = await databaseService.getDocumentById(documentId);
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
    console.error('Create chat session error:', error);
    res.status(500).json({ error: 'Failed to create chat session' });
  }
});

// Send message to chat session
router.post('/chat/sessions/:sessionId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user?.userId;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get chat session with document
    const session = await databaseService.getChatSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found or access denied' });
    }

    // Check document processing status and extracted text
    if (!session.document.extractedText || session.document.extractedText.trim() === '') {
      if (session.document.status === 'processing') {
        return res.status(400).json({ 
          error: 'Document is still being processed. Please wait a moment and try again.',
          status: 'processing'
        });
      } else if (session.document.status === 'error') {
        return res.status(400).json({ 
          error: 'Document processing failed. Please try re-uploading the document.',
          status: 'error'
        });
      } else {
        return res.status(400).json({ 
          error: 'Document text extraction failed. This may be due to an image-based PDF or encryption. Please try with a different document.',
          status: 'no_text'
        });
      }
    }

    // Add user message to database
    const userMessage = await databaseService.addMessage({
      content: message,
      role: 'user',
      sessionId,
    });

    // Get chat history for context
    const chatHistory = await databaseService.getMessagesBySessionId(sessionId);

    // Generate AI response using Gemini
    const aiResponse = await geminiService.answerQuestion(
      message,
      session.document.extractedText,
      chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      }))
    );

    // Add AI response to database
    const assistantMessage = await databaseService.addMessage({
      content: aiResponse.answer,
      role: 'assistant',
      sessionId,
    });

    res.json({
      message: 'Message processed successfully',
      userMessage: {
        id: userMessage.id,
        content: userMessage.content,
        role: userMessage.role,
        timestamp: userMessage.timestamp,
      },
      assistantMessage: {
        id: assistantMessage.id,
        content: assistantMessage.content,
        role: assistantMessage.role,
        timestamp: assistantMessage.timestamp,
        sources: aiResponse.sources,
        confidence: aiResponse.confidence,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat session messages
router.get('/chat/sessions/:sessionId/messages', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const session = await databaseService.getChatSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found or access denied' });
    }

    const messages = await databaseService.getMessagesBySessionId(sessionId);

    res.json({
      sessionId: session.id,
      document: {
        id: session.document.id,
        title: session.document.title,
        filename: session.document.filename,
      },
      messages: messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp,
      })),
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get user's chat sessions
router.get('/chat/sessions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const sessions = await databaseService.getChatSessionsByUserId(userId as string);

    res.json({
      sessions: sessions.map(session => ({
        id: session.id,
        title: session.title,
        document: {
          id: session.document.id,
          title: session.document.title,
          filename: session.document.filename,
        },
        messageCount: session.messages.length,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
});

// Delete chat session
router.delete('/chat/sessions/:sessionId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const session = await databaseService.getChatSessionById(sessionId);
    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: 'Chat session not found or access denied' });
    }

    await databaseService.deleteChatSession(sessionId);

    res.json({ message: 'Chat session deleted successfully' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
});

// Generate document summary
router.post('/documents/:documentId/summary', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await databaseService.getDocumentById(documentId);
    if (!document || document.userId !== userId) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ error: 'Document has not been processed yet' });
    }

    const summary = await geminiService.generateDocumentSummary(document.extractedText);
    
    // Update document with summary
    await databaseService.updateDocument(documentId, { summary });

    res.json({
      message: 'Summary generated successfully',
      summary,
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Generate suggested questions
router.post('/documents/:documentId/questions', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await databaseService.getDocumentById(documentId);
    if (!document || document.userId !== userId) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ error: 'Document has not been processed yet' });
    }

    const questions = await geminiService.generateQuestions(document.extractedText);

    res.json({
      message: 'Questions generated successfully',
      questions,
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

export default router;
