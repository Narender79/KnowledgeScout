import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null;

  constructor() {
    console.log('Environment variables check:');
    console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
    console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('GEMINI')));
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables. AI features will be disabled.');
      this.genAI = null;
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI service initialized successfully');
  }

  async generateDocumentSummary(documentText: string): Promise<string> {
    try {
      if (!this.genAI) {
        return 'AI summary generation is not available. Please check your API configuration.';
      }
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `
        Please provide a comprehensive summary of the following document. 
        Focus on the main points, key concepts, and important information.
        Keep the summary concise but informative (2-3 paragraphs).
        
        Document content:
        ${documentText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating document summary:', error);
      throw new Error('Failed to generate document summary');
    }
  }

  async answerQuestion(question: string, documentText: string, chatHistory: any[] = []): Promise<{
    answer: string;
    sources: string[];
    confidence: number;
  }> {
    try {
      if (!this.genAI) {
        return {
          answer: 'AI Q&A is not available. Please check your API configuration.',
          sources: [],
          confidence: 0
        };
      }
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      // Build context from chat history
      const historyContext = chatHistory.length > 0 
        ? `\n\nPrevious conversation context:\n${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}`
        : '';

      const prompt = `
        You are an intelligent document analysis assistant. Answer the user's question based on the provided document content.
        
        Document content:
        ${documentText}
        
        ${historyContext}
        
        User question: ${question}
        
        Please provide:
        1. A direct, accurate answer based on the document content
        2. Quote relevant sections from the document to support your answer
        3. If the answer is not found in the document, clearly state this
        4. Be concise but comprehensive
        
        Respond in a natural, conversational way. Do not use JSON format.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Return the AI response as plain text
      return {
        answer: text,
        sources: [],
        confidence: 0.8
      };
    } catch (error) {
      console.error('Error answering question:', error);
      throw new Error('Failed to answer question');
    }
  }

  async extractKeyPoints(documentText: string): Promise<string[]> {
    try {
      if (!this.genAI) {
        return ['AI key point extraction is not available. Please check your API configuration.'];
      }
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `
        Extract the key points and main topics from the following document.
        Return them as a JSON array of strings, with each string being a key point.
        Focus on the most important concepts and findings.
        
        Document content:
        ${documentText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const keyPoints = JSON.parse(text);
        return Array.isArray(keyPoints) ? keyPoints : [text];
      } catch (parseError) {
        return [text];
      }
    } catch (error) {
      console.error('Error extracting key points:', error);
      return ['Failed to extract key points'];
    }
  }

  async generateQuestions(documentText: string): Promise<string[]> {
    try {
      if (!this.genAI) {
        return ['AI question generation is not available. Please check your API configuration.'];
      }
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `
        Based on the following document content, generate 5 relevant questions that someone might ask about this document.
        Make the questions specific and answerable from the document content.
        Return them as a JSON array of strings.
        
        Document content:
        ${documentText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const questions = JSON.parse(text);
        return Array.isArray(questions) ? questions : [text];
      } catch (parseError) {
        return [text];
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      return ['What is the main topic of this document?'];
    }
  }
}

export default new GeminiService();
