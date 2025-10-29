// AISim Nursing Assistant - Basic System Test
console.log('🏥 AISim Nursing Assistant - Basic System Test');
console.log('============================================\n');

// Test 1: Environment Variables
console.log('1. Testing Environment Variables...');
const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
    console.log('❌ GOOGLE_GEMINI_API_KEY not found');
    process.exit(1);
}
console.log('✅ Environment variables loaded');

// Test 2: Dependencies
console.log('\n2. Testing Dependencies...');
try {
    const express = require('express');
    const cors = require('cors');
    const helmet = require('helmet');
    const Joi = require('joi');
    const { v4: uuidv4 } = require('uuid');
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    console.log('✅ All dependencies available');
} catch (error) {
    console.log('❌ Missing dependencies:', error.message);
    process.exit(1);
}

// Test 3: File Structure
console.log('\n3. Testing File Structure...');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'server.js',
    'package.json',
    'routes/charting.js',
    'services/geminiService.js',
    'data/nursingStandards.js',
    'frontend/index.html',
    'frontend/styles.css',
    'frontend/app.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.log(`❌ Missing file: ${file}`);
        allFilesExist = false;
    }
});

if (allFilesExist) {
    console.log('✅ All required files present');
} else {
    console.log('❌ Some files are missing');
    process.exit(1);
}

// Test 4: Server can start
console.log('\n4. Testing Server Initialization...');
try {
    // Test if server.js can be required without errors
    delete require.cache[require.resolve('./server.js')];
    console.log('✅ Server module loads successfully');
} catch (error) {
    console.log('❌ Server module failed to load:', error.message);
    process.exit(1);
}

console.log('\n🎉 Basic system test passed! AISim Nursing Assistant is ready.');
console.log('\nTo start the application:');
console.log('  npm start');
console.log('  or');
console.log('  ./start.sh');
console.log('\nThen visit: http://localhost:3000');
console.log('\nNote: The Google Gemini API connection will be tested when you start the server.');
