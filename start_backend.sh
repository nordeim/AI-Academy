$ docker compose up --build -d
WARN[0000] /home/project/AI-Academy/docker-compose.yml: the attribute `version` is obsolete, it will be ignored, please remove it to avoid potential confusion 
[+] Running 7/7
 ✔ Network ai-academy_default       Created                                                                                                                                                                                            0.4s 
 ✔ Volume ai-academy_postgres_data  Created                                                                                                                                                                                            0.1s 
 ✔ Volume ai-academy_redis_data     Created                                                                                                                                                                                            0.1s 
 ✔ Volume ai-academy_minio_data     Created                                                                                                                                                                                            0.1s 
 ✔ Container ai-academy-minio       Started                                                                                                                                                                                            4.8s 
 ✔ Container ai-academy-redis       Started                                                                                                                                                                                            4.7s 
 ✔ Container ai-academy-postgres    Started                                                                                                                                                                                            5.4s 
(venv) pete@pop-os:/home/project/AI-Academy
$ docker ps
CONTAINER ID   IMAGE                                 COMMAND                  CREATED          STATUS                            PORTS                                                             NAMES
6f696682326c   postgres:16-alpine                    "docker-entrypoint.s…"   11 seconds ago   Up 7 seconds (health: starting)   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp                       ai-academy-postgres
57de97563ca4   minio/minio:latest                    "/usr/bin/docker-ent…"   11 seconds ago   Up 7 seconds (health: starting)   0.0.0.0:9000-9001->9000-9001/tcp, [::]:9000-9001->9000-9001/tcp   ai-academy-minio
bdb9dc6eab8a   redis:7-alpine                        "docker-entrypoint.s…"   11 seconds ago   Up 7 seconds                      0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp                       ai-academy-redis
(venv) pete@pop-os:/home/project/AI-Academy
$ grep DB backend/.env
DB_NAME=academy_db
DB_USER=academy_user
DB_PASSWORD=academy_secret
DB_HOST=localhost
DB_PORT=5432

$ source /opt/venv/bin/activate && cd /home/project/AI-Academy/backend && pip -V
pip 26.0.1 from /opt/venv/lib/python3.12/site-packages/pip (python 3.12)
(venv) pete@pop-os:/home/project/AI-Academy/backend
$ pip install Django djangorestframework django-cors-headers django-filter 
Requirement already satisfied: Django in /opt/venv/lib/python3.12/site-packages (6.0.3)
Requirement already satisfied: djangorestframework in /opt/venv/lib/python3.12/site-packages (3.16.1)
Requirement already satisfied: django-cors-headers in /opt/venv/lib/python3.12/site-packages (4.9.0)
Requirement already satisfied: django-filter in /opt/venv/lib/python3.12/site-packages (25.2)
Requirement already satisfied: asgiref>=3.9.1 in /opt/venv/lib/python3.12/site-packages (from Django) (3.11.0)
Requirement already satisfied: sqlparse>=0.5.0 in /opt/venv/lib/python3.12/site-packages (from Django) (0.5.4)
(venv) pete@pop-os:/home/project/AI-Academy/backend
$ pip install Pillow psycopg2-binary redis celery stripe python-dotenv whitenoise gunicorn dj-database-url
Requirement already satisfied: Pillow in /opt/venv/lib/python3.12/site-packages (12.1.1)
Requirement already satisfied: psycopg2-binary in /opt/venv/lib/python3.12/site-packages (2.9.10)
Requirement already satisfied: redis in /opt/venv/lib/python3.12/site-packages (6.4.0)
Requirement already satisfied: celery in /opt/venv/lib/python3.12/site-packages (5.6.2)
Collecting stripe
  Downloading stripe-14.4.1-py3-none-any.whl.metadata (18 kB)
Requirement already satisfied: python-dotenv in /opt/venv/lib/python3.12/site-packages (1.2.1)
Requirement already satisfied: whitenoise in /opt/venv/lib/python3.12/site-packages (6.11.0)
Requirement already satisfied: gunicorn in /opt/venv/lib/python3.12/site-packages (25.1.0)
Collecting dj-database-url
  Downloading dj_database_url-3.1.2-py3-none-any.whl.metadata (13 kB)
Requirement already satisfied: billiard<5.0,>=4.2.1 in /opt/venv/lib/python3.12/site-packages (from celery) (4.2.1)
Requirement already satisfied: kombu>=5.6.0 in /opt/venv/lib/python3.12/site-packages (from celery) (5.6.2)
Requirement already satisfied: vine<6.0,>=5.1.0 in /opt/venv/lib/python3.12/site-packages (from celery) (5.1.0)
Requirement already satisfied: click<9.0,>=8.1.2 in /opt/venv/lib/python3.12/site-packages (from celery) (8.3.1)
Requirement already satisfied: click-didyoumean>=0.3.0 in /opt/venv/lib/python3.12/site-packages (from celery) (0.3.1)
Requirement already satisfied: click-repl>=0.2.0 in /opt/venv/lib/python3.12/site-packages (from celery) (0.3.0)
Requirement already satisfied: click-plugins>=1.1.1 in /opt/venv/lib/python3.12/site-packages (from celery) (1.1.1.2)
Requirement already satisfied: python-dateutil>=2.8.2 in /opt/venv/lib/python3.12/site-packages (from celery) (2.9.0.post0)
Requirement already satisfied: tzlocal in /opt/venv/lib/python3.12/site-packages (from celery) (5.3.1)
Requirement already satisfied: typing_extensions>=4.5.0 in /opt/venv/lib/python3.12/site-packages (from stripe) (4.15.0)
Requirement already satisfied: requests>=2.20 in /opt/venv/lib/python3.12/site-packages (from stripe) (2.32.5)
Requirement already satisfied: packaging in /opt/venv/lib/python3.12/site-packages (from gunicorn) (26.0)
Requirement already satisfied: django>=4.2 in /opt/venv/lib/python3.12/site-packages (from dj-database-url) (6.0.3)
Requirement already satisfied: prompt-toolkit>=3.0.36 in /opt/venv/lib/python3.12/site-packages (from click-repl>=0.2.0->celery) (3.0.52)
Requirement already satisfied: asgiref>=3.9.1 in /opt/venv/lib/python3.12/site-packages (from django>=4.2->dj-database-url) (3.11.0)
Requirement already satisfied: sqlparse>=0.5.0 in /opt/venv/lib/python3.12/site-packages (from django>=4.2->dj-database-url) (0.5.4)
Requirement already satisfied: amqp<6.0.0,>=5.1.1 in /opt/venv/lib/python3.12/site-packages (from kombu>=5.6.0->celery) (5.3.1)
Requirement already satisfied: tzdata>=2025.2 in /opt/venv/lib/python3.12/site-packages (from kombu>=5.6.0->celery) (2025.3)
Requirement already satisfied: wcwidth in /opt/venv/lib/python3.12/site-packages (from prompt-toolkit>=3.0.36->click-repl>=0.2.0->celery) (0.2.14)
Requirement already satisfied: six>=1.5 in /opt/venv/lib/python3.12/site-packages (from python-dateutil>=2.8.2->celery) (1.17.0)
Requirement already satisfied: charset_normalizer<4,>=2 in /opt/venv/lib/python3.12/site-packages (from requests>=2.20->stripe) (3.4.4)
Requirement already satisfied: idna<4,>=2.5 in /opt/venv/lib/python3.12/site-packages (from requests>=2.20->stripe) (3.11)
Requirement already satisfied: urllib3<3,>=1.21.1 in /opt/venv/lib/python3.12/site-packages (from requests>=2.20->stripe) (2.6.3)
Requirement already satisfied: certifi>=2017.4.17 in /opt/venv/lib/python3.12/site-packages (from requests>=2.20->stripe) (2026.1.4)
Downloading stripe-14.4.1-py3-none-any.whl (2.1 MB)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.1/2.1 MB 9.7 MB/s  0:00:00
Downloading dj_database_url-3.1.2-py3-none-any.whl (9.0 kB)
Installing collected packages: stripe, dj-database-url
Successfully installed dj-database-url-3.1.2 stripe-14.4.1
$ pip install pytest pytest-django factory-boy black flake8 mypy django-debug-toolbar
Requirement already satisfied: pytest in /opt/venv/lib/python3.12/site-packages (9.0.2)
Requirement already satisfied: pytest-django in /opt/venv/lib/python3.12/site-packages (4.12.0)
Requirement already satisfied: factory-boy in /opt/venv/lib/python3.12/site-packages (3.3.3)
Requirement already satisfied: black in /opt/venv/lib/python3.12/site-packages (23.12.1)
Requirement already satisfied: flake8 in /opt/venv/lib/python3.12/site-packages (6.1.0)
Requirement already satisfied: mypy in /opt/venv/lib/python3.12/site-packages (1.19.1)
Requirement already satisfied: django-debug-toolbar in /opt/venv/lib/python3.12/site-packages (6.2.0)
Requirement already satisfied: iniconfig>=1.0.1 in /opt/venv/lib/python3.12/site-packages (from pytest) (2.3.0)
Requirement already satisfied: packaging>=22 in /opt/venv/lib/python3.12/site-packages (from pytest) (26.0)
Requirement already satisfied: pluggy<2,>=1.5 in /opt/venv/lib/python3.12/site-packages (from pytest) (1.6.0)
Requirement already satisfied: pygments>=2.7.2 in /opt/venv/lib/python3.12/site-packages (from pytest) (2.19.2)
Requirement already satisfied: Faker>=0.7.0 in /opt/venv/lib/python3.12/site-packages (from factory-boy) (40.5.1)
Requirement already satisfied: click>=8.0.0 in /opt/venv/lib/python3.12/site-packages (from black) (8.3.1)
Requirement already satisfied: mypy-extensions>=0.4.3 in /opt/venv/lib/python3.12/site-packages (from black) (1.1.0)
Requirement already satisfied: pathspec>=0.9.0 in /opt/venv/lib/python3.12/site-packages (from black) (1.0.4)
Requirement already satisfied: platformdirs>=2 in /opt/venv/lib/python3.12/site-packages (from black) (4.9.1)
Requirement already satisfied: mccabe<0.8.0,>=0.7.0 in /opt/venv/lib/python3.12/site-packages (from flake8) (0.7.0)
Requirement already satisfied: pycodestyle<2.12.0,>=2.11.0 in /opt/venv/lib/python3.12/site-packages (from flake8) (2.11.1)
Requirement already satisfied: pyflakes<3.2.0,>=3.1.0 in /opt/venv/lib/python3.12/site-packages (from flake8) (3.1.0)
Requirement already satisfied: typing_extensions>=4.6.0 in /opt/venv/lib/python3.12/site-packages (from mypy) (4.15.0)
Requirement already satisfied: librt>=0.6.2 in /opt/venv/lib/python3.12/site-packages (from mypy) (0.8.0)
Requirement already satisfied: django>=4.2.9 in /opt/venv/lib/python3.12/site-packages (from django-debug-toolbar) (6.0.3)
Requirement already satisfied: sqlparse>=0.2 in /opt/venv/lib/python3.12/site-packages (from django-debug-toolbar) (0.5.4)
Requirement already satisfied: asgiref>=3.9.1 in /opt/venv/lib/python3.12/site-packages (from django>=4.2.9->django-debug-toolbar) (3.11.0)

# source /opt/venv/bin/activate && cd /home/project/AI-Academy/backend && python manage.py migrate && python manage.py collectstatic --noinput && python manage.py check 

# Check existing tables in academy_db
$ docker exec ai-academy-postgres psql -U academy_user -d academy_db -c "\dt"
Did not find any relations.
# Verify user exists in PostgreSQL
$ docker exec ai-academy-postgres psql -U academy_user -d academy_db -c "SELECT usename FROM pg_user;"
usename
--------------
 academy_user
(1 row)
# Check PostgreSQL authentication config
$ docker exec ai-academy-postgres cat /var/lib/postgresql/data/pg_hba.conf 2>/dev/null || docker exec ai-academy-postgres cat /etc/postgresql/pg_hba.conf 2>/dev/null || docker exec ai-academy-postgres find /var/lib/postgresql -name "pg_hba.conf" -exec cat {} \;
# PostgreSQL Client Authentication Configuration File
# ===================================================
#
# Refer to the "Client Authentication" section in the PostgreSQL
# documentation for a complete description of this file.  A short
# synopsis follows.
#
# ----------------------
# Authentication Records
# ----------------------
…
Click to expand
# Reset user password in PostgreSQL
$ docker exec ai-academy-postgres psql -U academy_user -d academy_db -c "ALTER USER academy_user WITH PASSWORD 'academy_secret';"
ALTER ROLE
# Reload PostgreSQL configuration
$ docker exec ai-academy-postgres psql -U academy_user -d academy_db -c "SELECT pg_reload_conf();"
pg_reload_conf
----------------
 t
(1 row)
# Test Django connection after password reset
$ cd /home/project/AI-Academy/backend && python manage.py check --settings=academy.settings.development 2>&1 | head -20
System check identified no issues (0 silenced).

# Test PostgreSQL connection from host
$ PGPASSWORD=academy_secret psql -h localhost -U academy_user -d academy_db -c "SELECT 1;" 2>&1
?column?
----------
        1
(1 row)
→ Read backend/academy/settings/development.py
# Check environment variable loading in /home/project/AI-Academy/backend
$ python -c "import os; print('DB_PASSWORD from env:', os.environ.get('DB_PASSWORD', 'NOT SET')); print('DB_PASSWORD from .env file:', open('.env').read().split('DB_PASSWORD=')[1].split('\n')[0] if 'DB_PASSWORD=' in open('.env').read() else 'NOT FOUND')"
DB_PASSWORD from env: NOT SET
DB_PASSWORD from .env file: academy_secret
→ Read backend/manage.py
✱ Glob "**/settings/__init__.py" in backend (1 match)
# Test python-dotenv loading in /home/project/AI-Academy/backend
$ python -c "
from dotenv import load_dotenv
import os
load_dotenv()
print('After load_dotenv:')
print('  DB_PASSWORD:', os.environ.get('DB_PASSWORD', 'NOT SET'))
print('  DB_USER:', os.environ.get('DB_USER', 'NOT SET'))
print('  DB_HOST:', os.environ.get('DB_HOST', 'NOT SET'))
"
After load_dotenv:
  DB_PASSWORD: academy_secret
  DB_USER: academy_user
  DB_HOST: localhost

  # Verify Django settings loaded correctly in /home/project/AI-Academy/backend
$ python -c "
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'academy.settings.development')
import django
django.setup()
from django.conf import settings
print('DB_NAME:', settings.DATABASES['default']['NAME'])
print('DB_USER:', settings.DATABASES['default']['USER'])
print('DB_PASSWORD:', settings.DATABASES['default']['PASSWORD'])
print('DB_HOST:', settings.DATABASES['default']['HOST'])
"
DB_NAME: academy_db
DB_USER: academy_user
DB_PASSWORD: academy_secret
DB_HOST: localhost
Now run the migrations:
# Run Django database migrations in /home/project/AI-Academy/backend
$ python manage.py migrate 2>&1
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying admin.0001_initial...Traceback (most recent call last):
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/utils.py", line 103, in _execute
    return self.cursor.execute(sql)
           ^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/psycopg/cursor.py", line 117, in execute
    raise ex.with_traceback(None)
…

$ source /opt/venv/bin/activate && cd /home/project/AI-Academy/backend && python manage.py migrate && python manage.py collectstatic --noinput && python manage.py check
Traceback (most recent call last):
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/base/base.py", line 279, in ensure_connection
    self.connect()
  File "/opt/venv/lib/python3.12/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/base/base.py", line 256, in connect
    self.connection = self.get_new_connection(conn_params)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/postgresql/base.py", line 333, in get_new_connection
    connection = self.Database.connect(**conn_params)
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/psycopg/connection.py", line 122, in connect
    raise last_ex.with_traceback(None)
psycopg.OperationalError: connection failed: connection to server at "127.0.0.1", port 5432 failed: FATAL:  password authentication failed for user "academy_user"

The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "/home/project/AI-Academy/backend/manage.py", line 22, in <module>
    main()
  File "/home/project/AI-Academy/backend/manage.py", line 18, in main
    execute_from_command_line(sys.argv)
  File "/opt/venv/lib/python3.12/site-packages/django/core/management/__init__.py", line 443, in execute_from_command_line
    utility.execute()
  File "/opt/venv/lib/python3.12/site-packages/django/core/management/__init__.py", line 437, in execute
    self.fetch_command(subcommand).run_from_argv(self.argv)
  File "/opt/venv/lib/python3.12/site-packages/django/core/management/base.py", line 420, in run_from_argv
    self.execute(*args, **cmd_options)
  File "/opt/venv/lib/python3.12/site-packages/django/core/management/base.py", line 464, in execute
    output = self.handle(*args, **options)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/core/management/base.py", line 111, in wrapper
    res = handle_func(*args, **kwargs)
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/core/management/commands/migrate.py", line 114, in handle
    executor = MigrationExecutor(connection, self.migration_progress_callback)
               ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/migrations/executor.py", line 18, in __init__
    self.loader = MigrationLoader(self.connection)
                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/migrations/loader.py", line 59, in __init__
    self.build_graph()
  File "/opt/venv/lib/python3.12/site-packages/django/db/migrations/loader.py", line 288, in build_graph
    self.applied_migrations = recorder.applied_migrations()
                              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/migrations/recorder.py", line 89, in applied_migrations
    if self.has_table():
       ^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/migrations/recorder.py", line 63, in has_table
    with self.connection.cursor() as cursor:
         ^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/base/base.py", line 320, in cursor
    return self._cursor()
           ^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/base/base.py", line 296, in _cursor
    self.ensure_connection()
  File "/opt/venv/lib/python3.12/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/base/base.py", line 278, in ensure_connection
    with self.wrap_database_errors:
  File "/opt/venv/lib/python3.12/site-packages/django/db/utils.py", line 94, in __exit__
    raise dj_exc_value.with_traceback(traceback) from exc_value
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/base/base.py", line 279, in ensure_connection
    self.connect()
  File "/opt/venv/lib/python3.12/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/base/base.py", line 256, in connect
    self.connection = self.get_new_connection(conn_params)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/utils/asyncio.py", line 26, in inner
    return func(*args, **kwargs)
           ^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/django/db/backends/postgresql/base.py", line 333, in get_new_connection
    connection = self.Database.connect(**conn_params)
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/opt/venv/lib/python3.12/site-packages/psycopg/connection.py", line 122, in connect
    raise last_ex.with_traceback(None)
django.db.utils.OperationalError: connection failed: connection to server at "127.0.0.1", port 5432 failed: FATAL:  password authentication failed for user "academy_user"

