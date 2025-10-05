#!/bin/bash

echo "🚀 Starting Knowledge Scout Application..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file and add your GEMINI_API_KEY"
    echo "   Then run this script again."
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=your-gemini-api-key-here" .env; then
    echo "✅ Environment configured"
else
    echo "⚠️  Please set your GEMINI_API_KEY in .env file"
    exit 1
fi

# Start the application
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "✅ Knowledge Scout is running!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "👤 Demo Account:"
echo "   Email: admin@mail.com"
echo "   Password: admin123"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop app: docker-compose down"
