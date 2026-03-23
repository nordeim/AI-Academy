# Check server and capture screenshot
tail -10 /tmp/frontend.log && agent-browser open http://localhost:5173/ && agent-browser wait --load networkidle && agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/logo-click-fix.png && echo "Screenshot captured"

# The server seems to be crashing after the HMR update. Let me restart it and try again.
# Start server and capture final screenshot

$ cd /home/project/AI-Academy/frontend && nohup ./node_modules/.bin/vite --port 5173 --host 0.0.0.0 < /dev/null > /tmp/frontend.log 2>&1 & sleep 20 && agent-browser open http://localhost:5173/ && agent-browser wait --load networkidle && agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/logo-click-fix.png && echo "Screenshot captured"
