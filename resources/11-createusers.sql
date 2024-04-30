CREATE USER 'testuser'@'127.0.0.1' identified by 'testpassword';
GRANT SELECT ON testdb.* TO 'testuser'@'127.0.0.1';
GRANT SELECT ON mysql.* TO 'testuser'@'127.0.0.1';
FLUSH PRIVILEGES;
