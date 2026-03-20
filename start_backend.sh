cd backend && pip install -r requirements/base.txt && python manage.py migrate && python manage.py collectstatic --noinput && python manage.py check 
