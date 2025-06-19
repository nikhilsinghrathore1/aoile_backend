import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import deploy from "./deploysdk.js";
import { ANT, ArweaveSigner } from '@ar.io/sdk';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Load configuration from config file
function loadConfig() {
  const configPath = path.join(process.cwd(), 'config.json');
  if (fs.existsSync(configPath)) {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  }
  throw new Error('Config file not found at ' + configPath);
}

// Function to update ANT record
async function updateANTRecord(txId, undername) {
  // Validate transaction ID
  if (!txId || typeof txId !== 'string' || txId.length !== 43) {
    throw new Error('Invalid Arweave transaction ID');
  }

  // Load configuration
  const config = loadConfig();
  const { antProcess, arnsName, walletPath } = config;

  // Validate configuration
  if (!antProcess || !arnsName || !walletPath) {
    throw new Error('Missing required configuration');
  }

  // Load wallet key
  const resolvedWalletPath = path.resolve(walletPath);
  if (!fs.existsSync(resolvedWalletPath)) {
    throw new Error('Wallet file does not exist');
  }
  const walletKey = JSON.parse(fs.readFileSync(resolvedWalletPath, 'utf-8'));

  // Initialize signer
  let signer;
  if (walletKey.n && walletKey.d) {
    signer = new ArweaveSigner(walletKey);
  } else {
    throw new Error('Invalid Arweave wallet JSON');
  }

  // Update ANT record
  const ant = ANT.init({ processId: antProcess, signer });
  await ant.setUndernameRecord(
    {
      undername: undername || '@',
      transactionId: txId,
      ttlSeconds: 3600,
    },
    {
      tags: [
        { name: 'App-Name', value: 'ARNS-CLI' },
        { name: 'anchor', value: new Date().toISOString() },
      ],
    }
  );

  // Generate URLs
  const arweaveUrl = `https://arweave.net/${txId}`;
  const arnsUrl = (undername === '@' || !undername) 
    ? `https://${arnsName}.ar.io`
    : `https://${undername}_${arnsName}.ar.io`;

  return { arweaveUrl, arnsUrl };
}

// Function to perform the deployment process
async function performDeployment(html, undername) {
  // Write HTML to deploy/index.html
  const deployDir = path.join(process.cwd(), 'deploy');
  const indexPath = path.join(deployDir, 'index.html');

  if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir);
  fs.writeFileSync(indexPath, html, 'utf-8');

  // Call the deploy function
  const deployResult = await deploy({ folderPath: 'deploy' });
  console.log('Deploy result:', deployResult);
  
  if (!deployResult.success) {
    throw new Error(`Deployment failed: ${deployResult.error || 'Unknown error'}`);
  }

  const txId = deployResult.links[0].split('/').pop();
  console.log('Transaction ID:', txId);

  if (!txId) {
    throw new Error('Deploy successful but no transaction ID returned');
  }

  // Update ANT record
  const antResult = await updateANTRecord(txId, undername);

  return {
    success: true,
    message: 'Deployment and ANT update successful',
    txId: txId,
    arweaveUrl: antResult.arweaveUrl,
    arnsUrl: antResult.arnsUrl,
    deployResult: deployResult
  };
}

app.post('/deploy', async (req, res) => {
  try {
    const { html, undername } = req.body;

    if (!html) {
      return res.status(400).json({ success: false, error: 'Missing HTML content' });
    }
    if (!undername) {
      return res.status(400).json({ success: false, error: 'Missing undername' });
    }

    let lastError = null;
    let attempt = 1;
    const maxAttempts = 2;

    while (attempt <= maxAttempts) {
      try {
        console.log(`Deployment attempt ${attempt}/${maxAttempts}`);
        
        const result = await performDeployment(html, undername);
        
        // If we get here, deployment was successful
        return res.status(200).json(result);
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error.message);
        lastError = error;

        // Check if it's a connection timeout error and we haven't reached max attempts
        const isTimeoutError = error.message.includes('ConnectTimeoutError') || 
                              error.message.includes('UND_ERR_CONNECT_TIMEOUT') ||
                              error.message.includes('Connect Timeout Error');
        
        if (isTimeoutError && attempt < maxAttempts) {
          console.log(`Connection timeout detected, retrying in 2 seconds...`);
          // Wait 2 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempt++;
          continue;
        } else {
          // Either not a timeout error, or we've exhausted retries
          break;
        }
      }
    }

    // If we get here, all attempts failed
    console.error('All deployment attempts failed. Last error:', lastError);
    return res.status(500).json({ 
      success: false, 
      error: lastError.message,
      attempts: maxAttempts
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/', (_, res) => {
  res.send('Arweave deploy server is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});