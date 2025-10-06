# Knowledge Scout (Doc & Q&A)

An intelligent document analysis and Q&A platform that transforms documents into interactive, intelligent conversations.

## 🚀 Features

- **Document Upload & Analysis**: Support for PDF only files with AI-powered text extraction
- **Intelligent Q&A**: Natural language questions with contextual answers and source citations
- **Collaborative Workspace**: Team-based document sharing and real-time collaboration
- **History Dashboard**: Document library with search, filter, and usage analytics
- **Modern UI**: Responsive design with accessibility focus and smooth animations

## 🛠️ Tech Stack

### Frontend
- React 18+ with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management

### Backend
- Node.js with Express
- PostgreSQL database
- Redis for caching
- Gemini 2.0 for AI processing

### DevOps
- GitHub Actions for CI/CD
- Vercel for frontend hosting
- Railway for backend hosting

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Set up environment variables**:
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start development servers**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
knowledge-scout/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
├── docs/             # Documentation
└── README.md         # This file
```

## 🔧 Development

### Frontend Development
```bash
cd frontend
npm run dev
```

### Backend Development
```bash
cd backend
npm run dev
```

### Database Setup
```bash
cd backend
npm run db:migrate
npm run db:seed
```

## 📝 Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/knowledge_scout

# JWT
JWT_SECRET=your-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Redis
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_PATH=./uploads
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests
cd frontend && npm test

# Run backend tests
cd backend && npm test
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Frontend Components](./docs/components.md)
- [Database Schema](./docs/database.md)
- [Deployment Guide](./docs/deployment.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@knowledgescout.com
- 📖 Documentation: [docs.knowledgescout.com](https://docs.knowledgescout.com)
- 🐛 Issues: [GitHub Issues](https://github.com/knowledge-scout/issues)
