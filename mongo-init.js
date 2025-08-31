// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

print('Starting MongoDB initialization...');

// Create database and user
db = db.getSiblingDB('ag-db');

// Create a user for the application
db.createUser({
  user: 'ag-db-user',
  pwd: 'ag-db-password',
  roles: [
    {
      role: 'readWrite',
      db: 'ag-db'
    }
  ]
});

print('MongoDB initialization completed!');
print('Database: ag-db');
print('User: ag-db-user');
print('Password: ag-db-password'); 