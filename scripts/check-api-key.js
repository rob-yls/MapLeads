/**
 * Script to check Google Maps API key configuration
 * Run with: node scripts/check-api-key.js
 */

const fs = require('fs');
const path = require('path');

console.log('Checking Google Maps API key configuration...');

// Read .env.local file
const envFilePath = path.resolve(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envFilePath, 'utf8');
} catch (error) {
  console.error(`❌ Could not read .env.local file: ${error.message}`);
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
      
      // Remove quotes if present
      if (envVars[key.trim()].startsWith('"') && envVars[key.trim()].endsWith('"')) {
        envVars[key.trim()] = envVars[key.trim()].slice(1, -1);
      }
      if (envVars[key.trim()].startsWith("'") && envVars[key.trim()].endsWith("'")) {
        envVars[key.trim()] = envVars[key.trim()].slice(1, -1);
      }
    }
  }
});

// Check if the API keys are set
const apiKey = envVars.GOOGLE_MAPS_API_KEY;
const publicApiKey = envVars.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (!apiKey) {
  console.error('❌ GOOGLE_MAPS_API_KEY is not set in .env.local');
} else {
  console.log('✅ GOOGLE_MAPS_API_KEY is set');
  console.log(`   Value: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
}

if (!publicApiKey) {
  console.error('❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set in .env.local');
} else {
  console.log('✅ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set');
  console.log(`   Value: ${publicApiKey.substring(0, 4)}...${publicApiKey.substring(publicApiKey.length - 4)}`);
}

// Check if the keys match (they should be the same value)
if (apiKey && publicApiKey && apiKey !== publicApiKey) {
  console.warn('⚠️ GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY have different values');
}

console.log('\nTo fix API key issues:');
console.log('1. Make sure both GOOGLE_MAPS_API_KEY and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY are set in .env.local');
console.log('2. Verify that your API key is valid and has the necessary permissions');
console.log('3. Check if your API key has any restrictions (HTTP referrers, IP addresses, etc.)');
console.log('4. For development, consider removing API key restrictions temporarily');
