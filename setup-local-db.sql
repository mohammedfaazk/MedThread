-- Create database and user for MedThread
CREATE USER medthread WITH PASSWORD 'medthread_dev';
CREATE DATABASE medthread OWNER medthread;
GRANT ALL PRIVILEGES ON DATABASE medthread TO medthread;

-- Connect to the medthread database
\c medthread

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO medthread;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO medthread;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO medthread;
