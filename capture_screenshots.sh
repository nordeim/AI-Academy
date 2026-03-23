#!/bin/bash
# AI Academy - Screenshot Capture Script
# Captures diverse screenshots for QA review

set -e

echo "Capturing screenshots..."

# Homepage
echo "1. Capturing homepage..."
agent-browser open http://localhost:5173/ && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/01-homepage.png

# Courses page
echo "2. Capturing courses page..."
agent-browser open http://localhost:5173/courses && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/02-courses.png

# Course detail page
echo "3. Capturing course detail..."
agent-browser open http://localhost:5173/courses/ai-engineering && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/03-course-detail.png

# Login page
echo "4. Capturing login page..."
agent-browser open http://localhost:5173/login && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/04-login.png

# Register page
echo "5. Capturing register page..."
agent-browser open http://localhost:5173/register && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/05-register.png

# Enrollment page (requires navigation)
echo "6. Capturing enrollment page..."
agent-browser open http://localhost:5173/courses/ai-engineering && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/06-course-before-enroll.png

# Mobile viewport
echo "7. Capturing mobile view..."
agent-browser set viewport 375 667 && \
    agent-browser open http://localhost:5173/ && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/07-mobile-homepage.png

# Reset viewport and capture another view
echo "8. Capturing courses mobile view..."
agent-browser set viewport 375 667 && \
    agent-browser open http://localhost:5173/courses && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/08-mobile-courses.png

# Reset to desktop
echo "9. Resetting to desktop viewport..."
agent-browser set viewport 1280 720 && \
    agent-browser open http://localhost:5173/ && \
    agent-browser wait --load networkidle && \
    agent-browser screenshot --annotate /home/project/AI-Academy/screenshots/09-desktop-final.png

echo "Screenshots captured successfully!"
ls -la /home/project/AI-Academy/screenshots/
