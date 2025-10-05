import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  ArrowRight,
  File,
  FileSpreadsheet
} from 'lucide-react';

interface UploadedFile {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  extractedText?: string;
  summary?: string;
  documentId?: string;
}

const UploadPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    if (!user) {
      alert('Please log in to upload documents');
      return;
    }

    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf'];
      return validTypes.includes(file.type) && file.size <= 50 * 1024 * 1024; // 50MB limit
    });

    if (validFiles.length !== files.length) {
      alert('Some files were rejected. Only PDF files under 50MB are allowed.');
    }

    setIsUploading(true);

    for (const file of validFiles) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const newFile: UploadedFile = {
        id: fileId,
        file,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);

      try {
        // Upload file to backend
        const response = await apiService.uploadDocument(file);
        
        // Update file status to processing and store document ID
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'processing', documentId: response.document.id } : f)
        );

        // Poll for completion (in a real app, you'd use WebSockets or Server-Sent Events)
        const pollForCompletion = async () => {
          try {
            const docResponse = await apiService.getDocument(response.document.id);
            const document = docResponse.document;
            
            if (document.status === 'completed') {
              setUploadedFiles(prev => 
                prev.map(f => f.id === fileId ? { 
                  ...f, 
                  status: 'completed',
                  extractedText: document.extractedText,
                  summary: document.summary
                } : f)
              );
            } else if (document.status === 'error') {
              setUploadedFiles(prev => 
                prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
              );
            } else {
              // Still processing, check again in 2 seconds
              setTimeout(pollForCompletion, 2000);
            }
          } catch (error) {
            console.error('Error polling document status:', error);
            setUploadedFiles(prev => 
              prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
            );
          }
        };

        // Start polling after a short delay
        setTimeout(pollForCompletion, 1000);

      } catch (error) {
        console.error('Upload error:', error);
        setUploadedFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
        );
      }
    }

    setIsUploading(false);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleStartQA = async (file: UploadedFile) => {
    if (!user || !file.documentId) {
      alert('Please log in to start a Q&A session');
      return;
    }

    try {
      // Create a new chat session
      const session = await apiService.createChatSession(
        file.documentId, 
        user.id, 
        `Chat about ${file.file.name}`
      );

      // Navigate to the chat page
      navigate(`/chat/${session.session.id}`);
    } catch (error) {
      console.error('Error starting Q&A session:', error);
      alert('Failed to start Q&A session. Please try again.');
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc':
      case 'docx':
        return <File className="w-8 h-8 text-blue-500" />;
      case 'txt':
        return <FileText className="w-8 h-8 text-gray-500" />;
      case 'rtf':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              Upload Your Documents
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Drag and drop your documents or click to browse. We'll extract the text and make it ready for intelligent Q&A.
            </p>
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
              isDragOver
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-300 hover:border-primary-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Upload className="w-16 h-16 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {isDragOver ? 'Drop your files here' : 'Choose files or drag and drop'}
              </h3>
              <p className="text-neutral-600 mb-4">
                PDF files up to 50MB
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-neutral-500">
                <div className="flex items-center space-x-1">
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Uploaded Files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <div className="space-y-4">
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm"
                  >
                    <div className="flex items-start space-x-4">
                      {getFileIcon(file.file.name)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-neutral-900 truncate">
                            {file.file.name}
                          </h4>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-neutral-400 hover:text-neutral-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">
                          {formatFileSize(file.file.size)}
                        </p>
                        
                        {/* Progress Bar */}
                        {file.status === 'uploading' && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm text-neutral-600 mb-1">
                              <span>Uploading...</span>
                              <span>{file.progress}%</span>
                            </div>
                            <div className="w-full bg-neutral-200 rounded-full h-2">
                              <div 
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Processing Status */}
                        {file.status === 'processing' && (
                          <div className="mt-3 flex items-center space-x-2 text-sm text-neutral-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                            <span>Processing document...</span>
                          </div>
                        )}

                        {/* Completed Status */}
                        {file.status === 'completed' && (
                          <div className="mt-3">
                            <div className="flex items-center space-x-2 text-sm text-green-600 mb-3">
                              <CheckCircle className="w-4 h-4" />
                              <span>Processing complete</span>
                            </div>
                            
                            {/* Extracted Text Preview */}
                            <div className="bg-neutral-50 rounded-lg p-4 mb-3">
                              <h5 className="text-sm font-medium text-neutral-900 mb-2">Extracted Text Preview:</h5>
                              <p className="text-sm text-neutral-600 line-clamp-3">
                                {file.extractedText}
                              </p>
                            </div>

                            {/* Summary */}
                            <div className="bg-primary-50 rounded-lg p-4 mb-3">
                              <h5 className="text-sm font-medium text-primary-900 mb-2">AI Summary:</h5>
                              <p className="text-sm text-primary-700">
                                {file.summary}
                              </p>
                            </div>

                            {/* Action Button */}
                            <button 
                              onClick={() => handleStartQA(file)}
                              className="btn-primary inline-flex items-center space-x-2"
                            >
                              <span>Start Q&A Session</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {/* Error Status */}
                        {file.status === 'error' && (
                          <div className="mt-3 flex items-center space-x-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Processing failed. Please try again.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-12 text-center">
            <p className="text-neutral-600 mb-4">Need help getting started?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-secondary">
                View Sample Document
              </button>
              <button className="btn-secondary">
                Learn More About Upload
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadPage;
