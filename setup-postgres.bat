@echo off
echo Setting up local PostgreSQL database...
echo.

set PGPASSWORD=postgres
set PGBIN=C:\Program Files\PostgreSQL\17\bin

echo Creating user and database...
"%PGBIN%\psql.exe" -U postgres -h localhost -c "DROP DATABASE IF EXISTS medthread;"
"%PGBIN%\psql.exe" -U postgres -h localhost -c "DROP USER IF EXISTS medthread;"
"%PGBIN%\psql.exe" -U postgres -h localhost -c "CREATE USER medthread WITH PASSWORD 'medthread_dev';"
"%PGBIN%\psql.exe" -U postgres -h localhost -c "CREATE DATABASE medthread OWNER medthread;"
"%PGBIN%\psql.exe" -U postgres -h localhost -c "GRANT ALL PRIVILEGES ON DATABASE medthread TO medthread;"

echo.
echo Connecting to medthread database to set permissions...
"%PGBIN%\psql.exe" -U postgres -h localhost -d medthread -c "GRANT ALL ON SCHEMA public TO medthread;"
"%PGBIN%\psql.exe" -U postgres -h localhost -d medthread -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO medthread;"
"%PGBIN%\psql.exe" -U postgres -h localhost -d medthread -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO medthread;"

echo.
echo Database setup complete!
echo.
pause
