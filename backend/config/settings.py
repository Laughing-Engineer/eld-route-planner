import os
from pathlib import Path
from urllib.parse import urlsplit
import mongoengine
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / '.env')

# Security settings
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-eld-route-planner-key-change-in-prod')
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't')

if DEBUG:
    ALLOWED_HOSTS = ['*']
else:
    allowed_hosts_env = os.getenv('ALLOWED_HOSTS', '*')
    if allowed_hosts_env == '*':
        ALLOWED_HOSTS = ['*']
    else:
        ALLOWED_HOSTS = [h.strip() for h in allowed_hosts_env.split(',') if h.strip()]
if 'testserver' not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append('testserver')

# Application definition
INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'trips.apps.TripsConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Dummy sqlite3 for django internals if needed
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# MongoDB Atlas Integration via MongoEngine
MONGODB_URI = os.getenv('MONGODB_URI', '').strip()
MONGO_CONNECTED = False
MONGO_CLIENT = None

if MONGODB_URI:
    try:
        MONGO_CLIENT = mongoengine.connect(
            host=MONGODB_URI,
            alias='default',
            serverSelectionTimeoutMS=3000,
            connect=False
        )
        MONGO_CLIENT.admin.command('ping')
        MONGO_CONNECTED = True
        print("[MongoDB] Configured connection to MongoDB Atlas.")
    except Exception as e:
        print(f"[MongoDB WARNING] Could not connect to MongoDB Atlas: {e}")
        MONGO_CONNECTED = False
else:
    print("[MongoDB NOTICE] MONGODB_URI not provided. Utilizing resilient in-memory/fallback persistence.")

# Password validation
AUTH_PASSWORD_VALIDATORS = []

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ],
}

# CORS configuration
cors_origins = []
for configured_origin in os.getenv('CORS_ALLOWED_ORIGINS', '').split(','):
    configured_origin = configured_origin.strip()
    if not configured_origin:
        continue
    parsed_origin = urlsplit(configured_origin)
    if parsed_origin.scheme and parsed_origin.netloc:
        cors_origins.append(f'{parsed_origin.scheme}://{parsed_origin.netloc}')
if cors_origins:
    CORS_ALLOWED_ORIGINS = cors_origins
else:
    CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOW_CREDENTIALS = True

# External APIs
NOMINATIM_USER_AGENT = os.getenv('NOMINATIM_USER_AGENT', 'ELDRoutePlanner/1.0 (support@eldplanner.local)')
OSRM_BASE_URL = os.getenv('OSRM_BASE_URL', 'http://router.project-osrm.org')
