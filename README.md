```markdown
# 🎨 aoile_backend 🚀

```ascii
  _.--""--._
 .'          `.
/   O      O   \
|    \  ^  /    |  Automating Deployments to Arweave
\   `-----'   /
 `. _______ .'
   //_____\\
  (( ____ ))
   `-----'
```

**Tagline:** Streamlining Arweave deployments with a powerful Node.js backend.


[![GitHub](https://img.shields.io/github/license/nikhilsinghrathore1/aoile_backend?style=flat-square)](https://github.com/nikhilsinghrathore1/aoile_backend/blob/main/LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg?style=flat-square)](https://expressjs.com/)
[![Arweave](https://img.shields.io/badge/Arweave-1.15.0-orange.svg?style=flat-square)](https://www.arweave.org/)
[![npm](https://img.shields.io/npm/dm/aoile_backend.svg?style=flat-square)](https://www.npmjs.com/)


---

## 🌟 Feature Highlights ✨

*   🚀 **Automated Deployments:** Effortlessly deploy your static websites and applications to Arweave.
*   🔥 **ANT Record Updates:**  Automatically update your Arweave Name Service (ARNS) records.
*   ✨ **Simple API:**  A clean RESTful API makes integration a breeze.
*   💫 **Robust Error Handling:**  Built-in error handling ensures reliable deployments.
*   🎨 **Customizable:** Easily adjust settings through a configuration file.
*   🛠️ **Retry Mechanism:** Handles transient network issues with automatic retries.


---

## 🛠️ Tech Stack 📦

| Technology      | Version          | Badge                                                              |
|-----------------|-------------------|----------------------------------------------------------------------|
| Node.js         | >=18.0.0         | [![Node.js](https://img.shields.io/badge/Node.js-v18+-brightgreen.svg?style=flat-square)](https://nodejs.org/) |
| Express.js      | ^5.x           | [![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg?style=flat-square)](https://expressjs.com/)      |
| Arweave SDK     | ^1.15.0          | [![Arweave](https://img.shields.io/badge/Arweave-1.15.0-orange.svg?style=flat-square)](https://www.arweave.org/)     |
| @ar.io/sdk     | ^3.13.0          | [![npm](https://img.shields.io/npm/v/@ar.io/sdk?style=flat-square)](https://www.npmjs.com/package/@ar.io/sdk) |
| @ardrive/turbo-sdk | ^1.8.0          | [![npm](https://img.shields.io/npm/v/@ardrive/turbo-sdk?style=flat-square)](https://www.npmjs.com/package/@ardrive/turbo-sdk) |
| Axios           | ^1.9.0           | [![npm](https://img.shields.io/npm/v/axios?style=flat-square)](https://www.npmjs.com/package/axios)           |
| Body-Parser    | ^2.2.0           | [![npm](https://img.shields.io/npm/v/body-parser?style=flat-square)](https://www.npmjs.com/package/body-parser)    |
| Cors            | ^2.8.5           | [![npm](https://img.shields.io/npm/v/cors?style=flat-square)](https://www.npmjs.com/package/cors)            |


---

## 🚀 Quick Start ⚡

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/nikhilsinghrathore1/aoile_backend.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd aoile_backend
    ```

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Create `config.json`:**  (See Configuration section below for details)

5.  **Start the server:**

    ```bash
    npm start
    ```

---

## 📖 Detailed Usage 📚

The aoile_backend exposes a single endpoint: `/deploy`.  This endpoint accepts a `POST` request with the following JSON payload:


```json
{
  "html": "<html>Your HTML content here</html>",
  "undername": "@your-arweave-name" 
}
```

**Example using `curl`:**

```bash
curl -X POST -H "Content-Type: application/json" -d '{"html": "<html><h1>Hello from Arweave!</h1></html>", "undername": "@mysite"}' http://localhost:3000/deploy
```

The server will respond with a JSON object containing:

*   `success`: A boolean indicating success or failure.
*   `txId`: The transaction ID of the deployed content (if successful).
*   `arweaveUrl`: The Arweave URL of the deployed content.
*   `arnsUrl`: The ARNS URL (if successful and `undername` is provided).
*   `error` (optional): An error message if deployment fails.
*   `attempts` (optional, only on failure): Number of deployment attempts made.

> **Important:**  Error responses will include detailed information to help you troubleshoot issues.


---

## 🏗️ Project Structure 📁

```
aoile_backend/
├── app/             // Application logic
│   ├── server.js    // Main server file
│   └── deploysdk.js // Arweave deployment functions
├── deploy/          // Temporary directory for deployment files
├── config.json      // Configuration file
└── package.json     // Project metadata and dependencies
```

---

## 🎯 API Documentation 📊

| Endpoint    | Method | Description                                      | Request Body                               | Response Body                                                                     |
|-------------|--------|--------------------------------------------------|-------------------------------------------|------------------------------------------------------------------------------------|
| `/deploy`   | POST    | Deploys HTML content to Arweave and updates ANT | `{ "html": "<html>...</html>", "undername": "your-undername" }` | `{ "success": true/false, "txId": "...", "arweaveUrl": "...", "arnsUrl": "...", "error": "...", "attempts": ... }` |


---

## 🔧 Configuration Options ⚙️

Create a file named `config.json` in the root directory with the following structure:

| Option        | Description                                                              | Type    | Required | Example                                    |
|----------------|--------------------------------------------------------------------------|---------|----------|---------------------------------------------|
| `antProcess`  | Your ANT process ID.                                                    | String  | Yes      | `"f0HhRa_7JdC36GpNRxKmzMFUxlxIF_gn7LGxzevPnLY"` |
| `arnsName`    | Your ARNS name.                                                           | String  | Yes      | `"communis"`                               |
| `walletPath`  | Path to your Arweave wallet key file (JSON).                             | String  | Yes      | `"path/to/your/wallet.json"`                 |


---

## 📸 Screenshots/Demo 📱

**(Add screenshots here.  Use markdown image syntax: `![Screenshot](screenshot.png)`)**


---

## 🤝 Contributing Guidelines 🛠️

1.  Fork the repository.
2.  Create a new branch: `git checkout -b feature/your-feature`
3.  Make your changes and commit them: `git commit -m "Your commit message"`
4.  Push to your fork: `git push origin feature/your-feature`
5.  Create a pull request.


---

## 📜 License and Acknowledgments 🌟

This project is licensed under the [AGPL-3.0-only](https://github.com/nikhilsinghrathore1/aoile_backend/blob/main/LICENSE) license.  Thanks to the Arweave team and the creators of the various Node.js packages used in this project!


---

## 👥 Contributors 💻

**(Add contributor avatars and links here)**


---

## 📞 Support and Contact 🌐

[![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Fgithub.com%2Fnikhilsinghrathore1%2Faoile_backend&style=social)](https://twitter.com/intent/tweet?text=Check%20out%20this%20awesome%20project%3A%20https%3A%2F%2Fgithub.com%2Fnikhilsinghrathore1%2Faoile_backend)

<details><summary><b>FAQ</b></summary>
  <p><b>Q: What is the size limit for deployments?</b></p>
  <p>A: The free tier of the Turbo SDK has size limitations.  Consider a paid plan for larger deployments.</p>
  <p><b>Q: How do I handle deployment failures?</b></p>
  <p>A: The API response includes detailed error messages. Check the logs for more information. The retry mechanism will automatically handle some network errors.</p>
  <p><b>Q:  Where can I find the deployed content?</b></p>
  <p>A:  The API response provides both Arweave and ARNS URLs (if configured).</p>
</details>

```mermaid
graph TD
    A[User] --> B{POST /deploy};
    B --> C[Server receives request];
    C --> D{Validate Request};
    D -- Valid --> E[Deploy to Arweave];
    D -- Invalid --> F[Return Error];
    E --> G[Update ANT (if configured)];
    G --> H[Return Success];
    F --> H;
    H --> A;
```
```

