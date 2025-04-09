/**
 * Development Server Starter Script
 * 
 * This script helps to:
 * 1. Check for necessary directories and create them if missing
 * 2. Check environment variable file and create template if missing
 * 3. Start nodemon server with proper configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk'); // You may need to install this: npm install chalk

// Configuration
const rootDir = path.join(__dirname, '..');
const requiredDirs = [
  'logs',
  'public/uploads',
  'public/images/profiles',
  'public/images/trips',
  'public/images/auth',
  'public/images/destinations'
];

const envTemplatePath = path.join(__dirname, '../.env.example');
const envPath = path.join(__dirname, '../.env');

// ANSI color codes for basic highlighting without chalk
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function ensureDirectoriesExist() {
  requiredDirs.forEach(dir => {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`Created directory: ${dir}`, colors.green);
    }
  });
}

function ensureEnvFileExists() {
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envTemplatePath)) {
      fs.copyFileSync(envTemplatePath, envPath);
      log('Created .env file from template. Please update it with your configuration.', colors.yellow);
    } else {
      // Create a basic .env file
      const basicEnvContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://witoonp:KzwFbGf4qF67GLPw@cluster0.jzvgfrf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=mixtrip_summer_db

# JWT Secret
JWT_SECRET=mixtrip_summer_secret_key_2025
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=mixtrip_summer_session_secret_2025

# Google Maps API (เพิ่มในอนาคต)
# GOOGLE_MAPS_API_KEY=your_google_maps_api_key
`;
      fs.writeFileSync(envPath, basicEnvContent);
      log('Created basic .env file. Please update it with your configuration.', colors.yellow);
    }
  }
}

function checkNodeModules() {
  const nodeModulesPath = path.join(rootDir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('node_modules not found. Installing dependencies...', colors.yellow);
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    log('Dependencies installed.', colors.green);
  }
}

function startServer() {
  log('Starting development server...', colors.blue);
  
  const server = spawn('npx', ['nodemon', 'src/server.js'], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });
  
  server.on('error', (error) => {
    log(`Server error: ${error.message}`, colors.red);
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      log(`Server process exited with code ${code}`, colors.red);
    }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    log('Stopping development server...', colors.yellow);
    server.kill('SIGINT');
    process.exit(0);
  });
}

// Main execution
function main() {
  log('=== MixTrip Summer Development Server ===', colors.bright + colors.cyan);
  
  // Perform checks
  ensureDirectoriesExist();
  ensureEnvFileExists();
  checkNodeModules();
  
  // Start server
  startServer();
}

main();
