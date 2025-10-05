# Knowledge Scout - Docker Setup

This Docker setup allows you to run the entire Knowledge Scout application with a single command.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Gemini API key

### 1. Clone and Setup
```bash
# Copy the project to your new laptop
git clone <your-repo> knowledge-scout
cd knowledge-scout

# Copy environment file
cp env.example .env
```

### 2. Configure Environment
Edit `.env` file and add your Gemini API key:
```bash
GEMINI_API_KEY=your-actual-gemini-api-key-here
```

### 3. Run the Application
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Access the Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Database:** localhost:5432

## 📋 Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | React application |
| Backend | 5000 | Node.js API |
| Database | 5432 | PostgreSQL |

## 🔧 Management Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up --build -d

# Clean up (removes volumes)
docker-compose down -v
```

## 🎯 Demo Account

Once running, use these credentials to test:
- **Email:** admin@mail.com
- **Password:** admin123

## 📁 File Structure

```
knowledge-scout/
├── docker-compose.yml          # Main orchestration
├── backend/
│   ├── Dockerfile             # Backend container
│   └── ...
├── frontend/
│   ├── Dockerfile             # Frontend container
│   ├── nginx.conf             # Nginx configuration
│   └── ...
└── env.example                # Environment template
```

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d knowledge_scout
```

### Backend Issues
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend
```

### Frontend Issues
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

## 🗑️ Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (deletes database data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## 📝 Notes

- The database data persists in Docker volumes
- Uploaded files are stored in `./backend/uploads`
- All services restart automatically on failure
- The demo user is created automatically on first run
