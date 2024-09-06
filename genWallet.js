import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exit } from 'process';

const wallet = ethers.Wallet.createRandom();
// For debug output:
console.log(`Address: ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);

const __filename = fileURLToPath(import.meta?.url);
const __dirname = dirname(__filename);

const envPath = path.join(__dirname, '.env');
const envWalletKey = 'ETH_WALLET';
const envVarKey = 'ETH_PRIVATE_KEY';

// Check if .env file exists, create if not
if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, '');
}

// Append the environment vars (key and infura)
fs.appendFileSync(envPath, `\n${envWalletKey}=${wallet.address}`);
fs.appendFileSync(envPath, `\n${envVarKey}=${wallet.privateKey}`);

console.log(`Appended local ENV Key's`);

exit(1);