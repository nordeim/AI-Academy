# Check server and capture screenshot
tail -10 /tmp/frontend.log && agent-browser open http://localhost:5173/ && agent-browser wait --load networkidle && agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/logo-click-fix.png && echo "Screenshot captured"

# The server seems to be crashing after the HMR update. Let me restart it and try again.
# Start server and capture final screenshot

cd /home/project/AI-Academy/frontend && nohup ./node_modules/.bin/vite --port 5173 --host 0.0.0.0 < /dev/null > /tmp/frontend.log 2>&1 & sleep 20 && agent-browser open http://localhost:5173/ && agent-browser wait --load networkidle && agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/logo-click-fix.png && echo "Screenshot captured"

# Now let me restart the frontend service. I'll kill the existing process and start it fresh to ensure the latest changes take effect.
# Kill existing Vite process
pkill -f "vite" && sleep 3 && echo "Vite process killed"

# The process was killed. Now let me start the frontend service with the latest changes.
# Start frontend service
cd /home/project/AI-Academy/frontend && nohup ./node_modules/.bin/vite --port 5173 --host 0.0.0.0 < /dev/null > /tmp/frontend.log 2>&1 & sleep 10 && echo "Vite server started"

# The server has started. Now let me verify it's running and responding correctly.
# Verify server is running
ss -tlnp | grep 5173 && curl -s http://localhost:5173/ | head -c 100
