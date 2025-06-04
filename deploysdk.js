
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Arweave from 'arweave';
import { TurboFactory, ArweaveSigner } from '@ardrive/turbo-sdk';

// Calculate size of a directory
function getDirectorySize(dirPath) {
  let totalSize = 0;

  function readDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        readDir(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  }

  readDir(dirPath);
  return totalSize;
}

async function deploy({ folderPath = 'dist', projectName = path.basename(process.cwd()) } = {}) {
  try {
    // Resolve deployment path
    const deployPath = path.resolve(process.cwd(), folderPath);
    
    if (!fs.existsSync(deployPath)) {
      throw new Error(`Folder does not exist: ${deployPath}`);
    }

    // Check deployment size
    const folderSize = getDirectorySize(deployPath);
    const TURBO_FREE_LIMIT = 100 * 1024; // 100KB
    if (folderSize > TURBO_FREE_LIMIT) {
      throw new Error('Deployment unsuccessful: Folder size exceeds 100KB free limit');
    }

    // Generate new wallet
    const permawebDir = path.join(process.env.HOME || process.env.USERPROFILE, '.permaweb');
    const projectDir = path.join(permawebDir, projectName);
    const walletPath = path.join(projectDir, 'wallet.json');

    if (!fs.existsSync(permawebDir)) {
      fs.mkdirSync(permawebDir);
    }
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir);
    }

    const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });
    const wallet = await arweave.wallets.generate();
    fs.writeFileSync(walletPath, JSON.stringify(wallet, null, 2));

    // Initialize signer and Turbo
    const signer = new ArweaveSigner(wallet);
    const turbo = TurboFactory.authenticated({
      signer: signer,
      token: 'arweave',
    });

    // Perform the upload
    const uploadResult = await turbo.uploadFolder({
      folderPath: deployPath,
      dataItemOpts: {
        tags: [
          { name: 'App-Name', value: 'PermaBegin' },
          { name: 'Content-Type', value: 'text/html' },
          { name: 'Deploy-Date', value: new Date().toISOString() },
          { name: 'anchor', value: new Date().toISOString() },
        ],
      },
    });

    const manifestId = uploadResult.manifestResponse.id;
    return {
      success: true,
      links: [
        `https://arweave.net/${manifestId}`,
        `https://arweave.ar.io/${manifestId}`,
      ],
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export default deploy

// Run deployment if script is executed directly
// if (require.main === module) {
//   deploy().then(result => {
//     if (result.success) {
//       console.log('Deployment successful!');
//       console.log('Links:', result.links.join('\n'));
//     } else {
//       console.error('Deployment failed:', result.error);
//       process.exit(1);
//     }
//   });
// }