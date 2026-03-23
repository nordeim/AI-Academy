#!/bin/bash
# AI Academy - Stable Server Startup Script
# Addresses issues from start_apps.md:
# - Server backgrounding instability
# - Port zombie state
# - Rendering race conditions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}AI Academy - Starting Development Servers${NC}"
echo "=========================================="

# Kill any existing processes on ports 8000 and 5173
echo -e "\n${YELLOW}Cleaning up existing processes...${NC}"
pkill -f "manage.py runserver" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Check if ports are free
check_port() {
    if ss -tlnp | grep -q ":$1 "; then
        echo -e "${RED}Port $1 is still in use. Force killing...${NC}"
        fuser -k $1/tcp 2>/dev/null || true
        sleep 2
    fi
}

check_port 8000
check_port 5173

# Start Backend Server
echo -e "\n${GREEN}Starting Backend Server (Django)...${NC}"
cd /home/project/AI-Academy/backend
nohup /opt/venv/bin/python manage.py runserver 0.0.0.0:8000 \
    < /dev/null > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..30}; do
    if curl -s http://localhost:8000/api/v1/courses/ -I | grep -q "200"; then
        echo -e "${GREEN}Backend is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Backend failed to start. Check /tmp/backend.log${NC}"
        exit 1
    fi
    sleep 1
done

# Start Frontend Server
echo -e "\n${GREEN}Starting Frontend Server (Vite)...${NC}"
cd /home/project/AI-Academy/frontend
nohup ./node_modules/.bin/vite --port 5173 --host 0.0.0.0 \
    < /dev/null > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to be ready
echo "Waiting for frontend to start..."
for i in {1..30}; do
    if curl -s http://localhost:5173/ -I | grep -q "200"; then
        echo -e "${GREEN}Frontend is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}Frontend failed to start. Check /tmp/frontend.log${NC}"
        exit 1
    fi
    sleep 1
done

# Verify servers are running
echo -e "\n${GREEN}Verifying servers...${NC}"
echo "Backend: http://localhost:8000/api/v1/courses/"
echo "Frontend: http://localhost:5173"

# Test API
echo -e "\n${YELLOW}Testing Backend API...${NC}"
curl -s http://localhost:8000/api/v1/courses/ | head -c 100
echo ""

# Test Frontend
echo -e "\n${YELLOW}Testing Frontend...${NC}"
curl -s http://localhost:5173/ | head -c 100
echo ""

echo -e "\n${GREEN}==========================================${NC}"
echo -e "${GREEN}All servers started successfully!${NC}"
echo -e "${GREEN}==========================================${NC}"
echo ""
echo "Backend Log: /tmp/backend.log"
echo "Frontend Log: /tmp/frontend.log"
echo ""
echo "To stop servers:"
echo "  pkill -f 'manage.py runserver'"
echo "  pkill -f 'vite'"
echo ""
echo -e "${GREEN}Ready for E2E testing!${NC}"
