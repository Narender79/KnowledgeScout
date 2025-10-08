import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import { ChatSessionResponse } from '../types/api';
import { 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Star,
  MoreVertical,
  Grid,
  List,
  Download,
  Share,
  Eye
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadDate: string;
  lastAccessed: string;
  status: 'processed' | 'processing' | 'error';
  summary: string;
  tags: string[];
  isFavorite: boolean;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [startingSession, setStartingSession] = useState<string | null>(null);

  // Real documents from API
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch documents function
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocuments();
      console.log('Fetched documents:', response);
      
      // Transform API response to match Document interface
      const transformedDocs: Document[] = response.documents.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        type: doc.mimeType?.includes('pdf') ? 'PDF' : 
              doc.mimeType?.includes('docx') ? 'DOCX' : 
              doc.mimeType?.includes('txt') ? 'TXT' : 'Unknown',
        size: `${(doc.fileSize / 1024 / 1024).toFixed(1)} MB`,
        uploadDate: new Date(doc.createdAt).toISOString().split('T')[0],
        lastAccessed: 'Just now',
        status: doc.status === 'completed' ? 'processed' : 
                doc.status === 'processing' ? 'processing' : 'error',
        summary: doc.summary || 'No summary available',
        tags: [], // We can add tags later
        isFavorite: false
      }));
      
      setDocuments(transformedDocs);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch documents on component mount
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  // Refresh documents when page becomes visible (user returns from upload)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchDocuments();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const stats = {
    totalDocuments: 24,
    processedDocuments: 22,
    totalQueries: 156,
    averageResponseTime: '1.2s'
  };

  const recentActivity = [
    {
      id: '1',
      action: 'Uploaded document',
      document: 'Research Paper - AI in Healthcare',
      time: '2 hours ago',
      type: 'upload'
    },
    {
      id: '2',
      action: 'Asked question',
      document: 'Business Contract Template',
      time: '1 day ago',
      type: 'query'
    },
    {
      id: '3',
      action: 'Shared document',
      document: 'Meeting Notes - Q4 Planning',
      time: '2 days ago',
      type: 'share'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterType === 'all' || doc.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSelectDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    setSelectedDocuments(
      selectedDocuments.length === filteredDocuments.length 
        ? [] 
        : filteredDocuments.map(doc => doc.id)
    );
  };

  const handleStartQA = async (documentId: string) => {
    try {
      console.log('Starting Q&A for document ID:', documentId);
      console.log('Available documents:', documents.map(d => ({ id: d.id, title: d.title })));
      console.log('Document being clicked:', documents.find(d => d.id === documentId));
      
      if (!user) {
        alert('Please log in to start a Q&A session');
        return;
      }

      setStartingSession(documentId);

      // Create a new chat session
      const session = await apiService.createChatSession(
        documentId, 
        user.id, 
        `Chat about ${documents.find(d => d.id === documentId)?.title}`
      );

      // Navigate to the chat page
      const sessionData = session as ChatSessionResponse;
      navigate(`/chat/${sessionData.session.id}`);
    } catch (error) {
      console.error('Error starting Q&A session:', error);
      alert('Failed to start Q&A session. Please try again.');
    } finally {
      setStartingSession(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p className="text-neutral-600">
              Manage your documents and track your learning progress
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Documents</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalDocuments}</p>
                </div>
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Processed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.processedDocuments}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Total Queries</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.totalQueries}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">Avg Response</p>
                  <p className="text-2xl font-bold text-neutral-900">{stats.averageResponseTime}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg border border-neutral-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-neutral-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-neutral-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="txt">TXT</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-1 border border-neutral-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-neutral-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-neutral-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Documents List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Your Documents ({filteredDocuments.length})
                </h2>
              </div>

              {filteredDocuments.length > 0 && (
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedDocuments.length === filteredDocuments.length}
                      onChange={handleSelectAll}
                      className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-600">
                      Select all ({filteredDocuments.length})
                    </span>
                  </label>
                </div>
              )}

              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-neutral-600">Loading documents...</span>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <p className="text-neutral-600">No documents found</p>
                    <p className="text-sm text-neutral-500 mt-1">Upload your first document to get started</p>
                  </div>
                ) : (
                  filteredDocuments.map((doc) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow ${
                      selectedDocuments.includes(doc.id) ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => handleSelectDocument(doc.id)}
                        className="mt-1 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-medium text-neutral-900 truncate">
                                {doc.title}
                              </h3>
                              {doc.isFavorite && (
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-3">
                              <span className="flex items-center space-x-1">
                                <FileText className="w-4 h-4" />
                                <span>{doc.type}</span>
                              </span>
                              <span>{doc.size}</span>
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{doc.uploadDate}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{doc.lastAccessed}</span>
                              </span>
                            </div>

                            {doc.summary && (
                              <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                                {doc.summary}
                              </p>
                            )}

                            <div className="flex items-center space-x-2 mb-4">
                              {doc.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-neutral-100 text-neutral-600 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center space-x-2">
                              {doc.status === 'processed' ? (
                                <button 
                                  onClick={() => handleStartQA(doc.id)}
                                  disabled={startingSession === doc.id}
                                  className="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {startingSession === doc.id ? (
                                    <>
                                      <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                      Starting...
                                    </>
                                  ) : (
                                    <>
                                      <MessageSquare className="w-4 h-4 mr-1" />
                                      Start Q&A
                                    </>
                                  )}
                                </button>
                              ) : doc.status === 'processing' ? (
                                <button 
                                  disabled
                                  className="btn-secondary text-sm opacity-50 cursor-not-allowed"
                                >
                                  <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
                                  Processing...
                                </button>
                              ) : (
                                <button 
                                  disabled
                                  className="btn-secondary text-sm opacity-50 cursor-not-allowed"
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  Processing Error
                                </button>
                              )}
                              <button className="btn-secondary text-sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </button>
                              <button className="btn-secondary text-sm">
                                <Share className="w-4 h-4 mr-1" />
                                Share
                              </button>
                              <button className="btn-secondary text-sm">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            </div>
                          </div>
                          
                          <button className="text-neutral-400 hover:text-neutral-600">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-neutral-600 truncate">
                          {activity.document}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
