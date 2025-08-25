-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `${DB_DATABASE}`;

-- Create user if it doesn't exist and grant privileges
CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'%' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON `${DB_DATABASE}`.* TO '${DB_USERNAME}'@'%';

-- Create user if it doesn't exist and grant privileges for PHP container access
CREATE USER IF NOT EXISTS '${DB_USERNAME}'@'172.%' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON `${DB_DATABASE}`.* TO '${DB_USERNAME}'@'172.%';

-- Required for user creation to take effect
FLUSH PRIVILEGES;
