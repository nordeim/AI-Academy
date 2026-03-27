/bin/bash -c "cd /home/project/AI-Academy/frontend && nohup ./node_modules/.bin/vite --port 5173 --host 0.0.0.0 < /dev/null > /tmp/frontend.log 2>&1 & "
sleep 8 && echo "Vite server started with PID: $!"
# node ./node_modules/.bin/vite --port 5173 --host 0.0.0.0
# /opt/venv/bin/python manage.py runserver 0.0.0.0:8000

