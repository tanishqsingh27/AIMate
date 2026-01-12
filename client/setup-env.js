import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

const envTemplate = `# API Configuration
VITE_API_URL=http://localhost:5000/api
`;

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ Created .env file in client/ directory');
} else {
  console.log('⚠️  .env file already exists in client/ directory');
}

