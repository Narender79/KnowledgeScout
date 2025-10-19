import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import databaseService from '../services/databaseService';
import geminiService from '../services/geminiService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Configure multer for file uploads
// Use memory storage for production (Railway) to avoid ephemeral filesystem issues
const storage = process.env.NODE_ENV === 'production' 
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, TXT, and RTF files are allowed.'));
    }
  }
});

// Helper function to extract text from different file types
async function extractTextFromFile(filePathOrBuffer: string | Buffer, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      try {
        // Handle both file path (development) and buffer (production)
        const dataBuffer = typeof filePathOrBuffer === 'string' 
          ? fs.readFileSync(filePathOrBuffer)
          : filePathOrBuffer;
        const data = await (pdfParse as any)(dataBuffer);
        
        console.log(`PDF text extraction completed. Extracted ${data.text.length} characters from ${data.numpages} pages.`);
        
        // Clean and validate extracted text
        const cleanedText = data.text.trim();
        
        if (cleanedText && cleanedText.length > 10) {
          return cleanedText;
        } else {
          // If text is too short, it might be an image-based PDF
          console.warn('PDF text extraction returned minimal content, likely an image-based PDF');
          const fileSize = typeof filePathOrBuffer === 'string' 
            ? (fs.statSync(filePathOrBuffer).size / 1024).toFixed(1)
            : (filePathOrBuffer.length / 1024).toFixed(1);
          return `PDF file uploaded successfully (${fileSize} KB). This appears to be an image-based PDF or contains minimal text content. For best results, please upload a text-based PDF document.`;
        }
        
      } catch (error) {
        console.error('PDF processing error:', error);
        // Fallback to basic info if PDF parsing fails
        const fileSize = typeof filePathOrBuffer === 'string' 
          ? (fs.statSync(filePathOrBuffer).size / 1024).toFixed(1)
          : (filePathOrBuffer.length / 1024).toFixed(1);
        return `PDF file uploaded successfully (${fileSize} KB). Text extraction failed - this may be due to image-based PDF, encryption, or corrupted file. Please try with a different PDF document.`;
      }
    } else if (mimeType === 'text/plain') {
      const textContent = typeof filePathOrBuffer === 'string' 
        ? fs.readFileSync(filePathOrBuffer, 'utf-8')
        : filePathOrBuffer.toString('utf-8');
      return textContent.trim() || 'Text file uploaded successfully but appears to be empty.';
    } else if (mimeType === 'application/msword' || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For Word documents, return a placeholder for now
      return 'Word document uploaded successfully. Text extraction for Word documents is not yet implemented. Please convert to PDF or plain text for full functionality.';
    } else if (mimeType === 'application/rtf') {
      // For RTF documents, return a placeholder for now
      return 'RTF document uploaded successfully. Text extraction for RTF documents is not yet implemented. Please convert to PDF or plain text for full functionality.';
    } else {
      // For other file types, return a placeholder
      return 'File uploaded successfully. Text extraction is not yet implemented for this file type. Please use PDF or plain text files for full functionality.';
    }
  } catch (error) {
    console.error('Text extraction error:', error);
    return 'Failed to extract text from document. Please check if the file is not corrupted and try again.';
  }
}

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), async (req: AuthRequest, res) => {
  try {
    console.log('Upload request received');
    console.log('req.file:', req.file);
    console.log('req.body:', req.body);
    console.log('Content-Type:', req.headers['content-type']);
    
    if (!req.file) {
      console.log('No file found in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get user ID from JWT token
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Create document in database
    const document = await databaseService.createDocument({
      title: req.file.originalname,
      filename: req.file.filename || `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      filePath: req.file.path || 'memory-storage', // Use placeholder for memory storage
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      userId,
      status: 'processing'
    });

    // Process document asynchronously
    setImmediate(async () => {
      try {
        // Extract text from document - handle both file path and buffer
        const fileData = req.file!.buffer || req.file!.path;
        const extractedText = await extractTextFromFile(fileData, req.file!.mimetype);
        
        // Generate summary using AI
        let summary = '';
        try {
          summary = await geminiService.generateDocumentSummary(extractedText);
        } catch (aiError) {
          console.error('AI summary generation failed:', aiError);
          summary = 'AI summary generation is currently unavailable.';
        }

        // Update document with extracted text and summary
        await databaseService.updateDocument(document.id, {
          status: 'completed',
          extractedText,
          summary
        });
      } catch (error) {
        console.error('Document processing error:', error);
        await databaseService.updateDocument(document.id, {
          status: 'error'
        });
      }
    });

    res.json({
      message: 'File uploaded successfully',
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Get all documents for a user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const documents = await databaseService.getDocumentsByUserId(userId);
    res.json({ documents });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get specific document
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await databaseService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Reprocess document with updated extraction logic
router.post('/:id/reprocess', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await databaseService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if file still exists (skip check for memory storage)
    if (document.filePath !== 'memory-storage' && !fs.existsSync(document.filePath)) {
      return res.status(400).json({ error: 'Document file not found. Please re-upload the document.' });
    }

    // Update status to processing
    await databaseService.updateDocument(document.id, {
      status: 'processing'
    });

    // Reprocess document asynchronously
    setImmediate(async () => {
      try {
        console.log(`Reprocessing document ${document.id}...`);
        console.log(`File path: ${document.filePath}`);
        console.log(`MIME type: ${document.mimeType}`);
        
        // Extract text from document with new logic
        // For memory storage, we can't reprocess as the file buffer is lost
        if (document.filePath === 'memory-storage') {
          await databaseService.updateDocument(document.id, {
            status: 'error'
          });
          console.log('Cannot reprocess document stored in memory - file buffer is lost');
          return;
        }
        
        const extractedText = await extractTextFromFile(document.filePath, document.mimeType);
        console.log(`Extracted text length: ${extractedText ? extractedText.length : 0}`);
        console.log(`Extracted text preview: ${extractedText ? extractedText.substring(0, 200) : 'No text'}`);
        
        // Validate extracted text - be more lenient with validation
        if (!extractedText || extractedText.trim() === '') {
          console.error('Text extraction returned empty content');
          await databaseService.updateDocument(document.id, {
            status: 'error'
          });
          return;
        }
        
        // Generate summary using AI
        let summary = '';
        try {
          summary = await geminiService.generateDocumentSummary(extractedText);
          console.log(`Summary generated: ${summary ? 'Yes' : 'No'}`);
        } catch (aiError) {
          console.error('AI summary generation failed:', aiError);
          summary = 'AI summary generation is currently unavailable.';
        }

        // Update document with new extracted text and summary
        await databaseService.updateDocument(document.id, {
          status: 'completed',
          extractedText,
          summary
        });
        
        console.log(`Document ${document.id} reprocessed successfully`);
      } catch (error) {
        console.error('Document reprocessing error:', error);
        await databaseService.updateDocument(document.id, {
          status: 'error'
        });
      }
    });

    res.json({ 
      message: 'Document reprocessing started',
      documentId: document.id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Reprocess document error:', error);
    res.status(500).json({ error: 'Failed to reprocess document' });
  }
});

// Test PDF extraction for debugging
router.get('/:id/test-extraction', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await databaseService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For memory storage, we can't test extraction as the file buffer is lost
    if (document.filePath === 'memory-storage') {
      return res.status(400).json({ 
        error: 'Cannot test extraction for documents stored in memory - file buffer is lost after processing',
        storageType: 'memory'
      });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(400).json({ error: 'Document file not found' });
    }

    // Test extraction
    const extractedText = await extractTextFromFile(document.filePath, document.mimeType);
    
    res.json({
      documentId: document.id,
      filePath: document.filePath,
      mimeType: document.mimeType,
      fileExists: fs.existsSync(document.filePath),
      extractedText: extractedText,
      extractedTextLength: extractedText ? extractedText.length : 0,
      currentStatus: document.status,
      currentExtractedText: document.extractedText,
      currentSummary: document.summary
    });
  } catch (error) {
    console.error('Test extraction error:', error);
    res.status(500).json({ error: 'Failed to test extraction', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const document = await databaseService.getDocumentById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check if user owns the document
    if (document.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Remove from database
    await databaseService.deleteDocument(req.params.id);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
