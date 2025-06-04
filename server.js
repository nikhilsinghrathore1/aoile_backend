import express from "express"
import cors from "cors"
import bodyParser from'body-parser';
import fs from 'fs';
import path from 'path';
import  deploy  from "./deploysdk.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

app.post('/deploy', async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ success: false, error: 'Missing HTML content' });
    }

    // Write HTML to deploy/index.html
    const deployDir = path.join(process.cwd(), 'deploy');
    const indexPath = path.join(deployDir, 'index.html');

    if (!fs.existsSync(deployDir)) fs.mkdirSync(deployDir);
    fs.writeFileSync(indexPath, html, 'utf-8');

    // Call the deploy function
    const result = await deploy({ folderPath: 'deploy' });

    return res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/', (_, res) => {
  res.send('Arweave deploy server is running.');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
