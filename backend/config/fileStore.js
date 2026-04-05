const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
function initializeFiles() {
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}, null, 2));
  }
}

initializeFiles();

// Read transactions from file
function readTransactions() {
  try {
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading transactions file:', err);
    return [];
  }
}

// Write transactions to file
function writeTransactions(transactions) {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing transactions file:', err);
    return false;
  }
}

// Read user data from file
function readUsers() {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading users file:', err);
    return {};
  }
}

// Write user data to file
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing users file:', err);
    return false;
  }
}

// Get user preferences for a specific user
function getUserData(userId) {
  const users = readUsers();
  if (!users[userId]) {
    users[userId] = {
      deletedMockIds: [],
      editedMockIds: {}
    };
  }
  return users[userId];
}

// Save user preferences
function saveUserData(userId, userData) {
  const users = readUsers();
  users[userId] = userData;
  return writeUsers(users);
}

module.exports = {
  readTransactions,
  writeTransactions,
  readUsers,
  writeUsers,
  getUserData,
  saveUserData
};
