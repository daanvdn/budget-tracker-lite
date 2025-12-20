#!/bin/bash

# Budget Tracker Lite - Development Helper Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Budget Tracker Lite - Development Helper${NC}"
echo "==========================================="
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists python3; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${YELLOW}Warning: Docker is not installed (only needed for Docker deployment)${NC}"
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Menu
echo "What would you like to do?"
echo "1) Setup backend"
echo "2) Setup frontend"
echo "3) Setup both"
echo "4) Start backend (development)"
echo "5) Start frontend (development)"
echo "6) Build Docker images"
echo "7) Start with Docker Compose"
echo "8) Stop Docker Compose"
echo "9) View logs"
echo "0) Exit"
echo ""
read -p "Enter your choice [0-9]: " choice

case $choice in
    1)
        echo -e "${GREEN}Setting up backend...${NC}"
        cd backend
        
        if [ ! -d "venv" ]; then
            echo "Creating virtual environment..."
            python3 -m venv venv
        fi
        
        echo "Activating virtual environment..."
        source venv/bin/activate
        
        echo "Installing uv..."
        pip install -q uv
        
        echo "Installing dependencies..."
        uv pip install -r pyproject.toml
        
        echo "Creating data directory..."
        mkdir -p ../data/uploads
        
        echo -e "${GREEN}✓ Backend setup complete!${NC}"
        echo "To start the backend:"
        echo "  cd backend"
        echo "  source venv/bin/activate"
        echo "  uvicorn src.app.main:app --reload"
        ;;
        
    2)
        echo -e "${GREEN}Setting up frontend...${NC}"
        cd frontend
        
        echo "Installing dependencies..."
        npm install
        
        echo -e "${GREEN}✓ Frontend setup complete!${NC}"
        echo "To start the frontend:"
        echo "  cd frontend"
        echo "  npm start"
        ;;
        
    3)
        echo -e "${GREEN}Setting up both backend and frontend...${NC}"
        
        # Backend
        cd backend
        if [ ! -d "venv" ]; then
            python3 -m venv venv
        fi
        source venv/bin/activate
        pip install -q uv
        uv pip install -r pyproject.toml
        mkdir -p ../data/uploads
        cd ..
        
        # Frontend
        cd frontend
        npm install
        cd ..
        
        echo -e "${GREEN}✓ Setup complete!${NC}"
        ;;
        
    4)
        echo -e "${GREEN}Starting backend...${NC}"
        cd backend
        
        if [ ! -d "venv" ]; then
            echo -e "${RED}Error: Backend not set up. Run option 1 first.${NC}"
            exit 1
        fi
        
        source venv/bin/activate
        mkdir -p ../data/uploads
        uvicorn src.app.main:app --reload
        ;;
        
    5)
        echo -e "${GREEN}Starting frontend...${NC}"
        cd frontend
        
        if [ ! -d "node_modules" ]; then
            echo -e "${RED}Error: Frontend not set up. Run option 2 first.${NC}"
            exit 1
        fi
        
        npm start
        ;;
        
    6)
        echo -e "${GREEN}Building Docker images...${NC}"
        docker compose build
        echo -e "${GREEN}✓ Docker images built!${NC}"
        ;;
        
    7)
        echo -e "${GREEN}Starting with Docker Compose...${NC}"
        docker compose up -d
        echo -e "${GREEN}✓ Services started!${NC}"
        echo "Frontend: http://localhost"
        echo "Backend API: http://localhost:8000"
        echo "API Docs: http://localhost:8000/docs"
        ;;
        
    8)
        echo -e "${YELLOW}Stopping Docker Compose...${NC}"
        docker compose down
        echo -e "${GREEN}✓ Services stopped!${NC}"
        ;;
        
    9)
        echo -e "${GREEN}Viewing logs...${NC}"
        docker compose logs -f
        ;;
        
    0)
        echo "Goodbye!"
        exit 0
        ;;
        
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac
