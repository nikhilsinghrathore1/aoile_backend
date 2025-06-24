// main.js
// const fs = require('fs').promises;
// const fsSync = require('fs');
// const path = require('path');
// const { glob } = require('glob');

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OUTPUT_FILE = 'codebase.md';

// Tree class equivalent
class Tree {
               constructor(value) {
                              this.value = value;
                              this.leaves = [];
               }

               push(child) {
                              this.leaves.push(child);
               }

               static new(value) {
                              return new Tree(value);
               }

               withLeaves(leaves) {
                              this.leaves = leaves;
                              return this;
               }

               toString() {
                              return this.render('', true);
               }

               render(prefix = '', isLast = true) {
                              let result = '';
                              const connector = isLast ? '└── ' : '├── ';
                              result += prefix + connector + this.value + '\n';

                              const newPrefix = prefix + (isLast ? '    ' : '│   ');

                              for (let i = 0; i < this.leaves.length; i++) {
                                             const isLastChild = i === this.leaves.length - 1;
                                             result += this.leaves[i].render(newPrefix, isLastChild);
                              }

                              return result;
               }
}

async function main() {
               try {
                              await run();
               } catch (error) {
                              console.error(`Error: ${error.message}`);
                              process.exit(1);
               }
}

async function run() {
               const startTime = new Date();
               console.log(`Starting script at ${formatDateTime(startTime)}`);

               const outputPath = path.resolve(OUTPUT_FILE);

               // Get all files while respecting .gitignore
               const allPaths = await getAllPaths(outputPath);

               // Remove existing output file if it exists
               if (fsSync.existsSync(OUTPUT_FILE)) {
                              await fs.unlink(OUTPUT_FILE);
                              console.log(`Removed existing ${OUTPUT_FILE}`);
               }

               // Create output file
               let content = '<codebase>\n';

               console.log('Generating tree structure for app folder...');
               content += '<project_structure>\n';
               const { tree, dirCount, fileCount } = buildFileTree(allPaths);
               content += tree.toString();
               content += `\n${dirCount} directories, ${fileCount} files\n`;
               content += '</project_structure>\n\n';

               console.log('Processing files...');
               let totalLines = 0;
               const maxLines = 2000;

               for (const filePath of allPaths) {
                              try {
                                             const stats = await fs.stat(filePath);
                                             if (!stats.isFile()) {
                                                            continue;
                                             }

                                             const fileContent = await fs.readFile(filePath, 'utf8');
                                             const relativePath = path.relative('.', filePath);

                                             // Count lines in current file
                                             const fileLines = fileContent.split('\n').length;

                                             // Skip if adding this file would exceed limit
                                             if (totalLines + fileLines > maxLines) {
                                                            console.log(`Skipping ${relativePath} (would exceed ${maxLines} line limit)`);
                                                            continue;
                                             }

                                             console.log(`Adding ${relativePath} (${fileLines} lines)`);

                                             content += `<file src="${escapeXml(relativePath)}">\n`;
                                             content += `${escapeXml(fileContent)}\n`;
                                             content += '</file>\n\n';

                                             totalLines += fileLines;
                              } catch (error) {
                                             console.error(`Skipping ${filePath}: ${error.message}`);
                              }
               }

               console.log(`Total lines processed: ${totalLines}/${maxLines}`);

               content += '</codebase>\n';

               await fs.writeFile(OUTPUT_FILE, content);

               const endTime = new Date();
               console.log(`File processing completed at ${formatDateTime(endTime)}`);
               console.log(`Codebase conversion complete. Output saved to ${OUTPUT_FILE}`);

               try {
                              const stats = await fs.stat(OUTPUT_FILE);
                              console.log(`File size: ${formatFileSize(stats.size)}`);
               } catch (error) {
                              console.error(`Warning: Could not get file metadata: ${error.message}`);
               }

               console.log(`Script finished at ${formatDateTime(new Date())}`);
}

async function getAllPaths(outputPath) {
               // Check if app folder exists
               const appFolder = path.resolve('app');
               try {
                              const stats = await fs.stat(appFolder);
                              if (!stats.isDirectory()) {
                                             throw new Error('app is not a directory');
                              }
               } catch (error) {
                              throw new Error('app folder not found in root directory');
               }

               // Only include important file types for README generation
               const importantExtensions = new Set([
                              '.js', '.jsx', '.ts', '.tsx',           // JavaScript/TypeScript
                              '.py', '.java', '.cs', '.cpp', '.c',    // Backend languages
                              '.html', '.css', '.scss', '.less',      // Web files
                              '.json', '.yaml', '.yml', '.toml',      // Config files
                              '.md', '.txt',                          // Documentation
                              '.sql', '.prisma',                      // Database
                              '.env.example', '.gitignore',           // Environment
                              '.dockerfile', 'Dockerfile'             // Docker
               ]);

               // Files to always include (even without extension)
               const importantFiles = new Set([
                              'package.json', 'composer.json', 'requirements.txt', 'Gemfile',
                              'Cargo.toml', 'go.mod', 'pom.xml', 'build.gradle',
                              'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
                              '.env.example', '.gitignore', 'README.md', 'LICENSE',
                              'tsconfig.json', 'webpack.config.js', 'vite.config.js',
                              'next.config.js', 'nuxt.config.js', 'tailwind.config.js'
               ]);

               // Folders to skip entirely
               const skipFolders = new Set([
                              'node_modules', 'vendor', 'build', 'dist', 'out',
                              '.next', '.nuxt', '.cache', 'coverage', '__pycache__',
                              '.git', '.svn', '.vscode', '.idea', 'logs', 'tmp', 'temp'
               ]);

               // Get all files in app folder
               const files = await glob('app/**/*', {
                              dot: false,
                              absolute: false,
                              followSymbolicLinks: true
               });

               return files
                              .map(file => path.resolve(file))
                              .filter(file => {
                                             const relativePath = path.relative('.', file);
                                             const fileName = path.basename(file);
                                             const ext = path.extname(file).toLowerCase();

                                             // Skip if it's the output file
                                             if (file === outputPath) return false;

                                             // Skip folders we don't want
                                             const pathParts = relativePath.split(path.sep);
                                             if (pathParts.some(part => skipFolders.has(part))) return false;

                                             try {
                                                            const stats = fsSync.statSync(file);
                                                            // Skip directories (we only want files)
                                                            if (stats.isDirectory()) return false;

                                                            // Skip large files (over 100KB unless they're important)
                                                            if (stats.size > 100 * 1024 && !importantFiles.has(fileName)) return false;
                                             } catch (error) {
                                                            return false;
                                             }

                                             // Include if it's an important file
                                             if (importantFiles.has(fileName)) return true;

                                             // Include if it has an important extension
                                             if (importantExtensions.has(ext)) return true;

                                             // Skip everything else
                                             return false;
                              })
                              .sort();
}

function buildFileTree(paths) {
               const childrenMap = new Map();
               let dirCount = 0;
               let fileCount = 0;

               // Build parent-child relationships
               for (const fullPath of paths) {
                              const relativePath = path.relative('.', fullPath);
                              const parentPath = path.dirname(relativePath);

                              if (parentPath !== '.') {
                                             if (!childrenMap.has(parentPath)) {
                                                            childrenMap.set(parentPath, []);
                                             }
                                             childrenMap.get(parentPath).push(relativePath);
                              } else {
                                             // Root level files/directories
                                             if (!childrenMap.has('')) {
                                                            childrenMap.set('', []);
                                             }
                                             childrenMap.get('').push(relativePath);
                              }

                              try {
                                             const stats = fsSync.statSync(fullPath);
                                             if (stats.isDirectory()) {
                                                            dirCount++;
                                             } else if (stats.isFile()) {
                                                            fileCount++;
                                             }
                              } catch (error) {
                                             // Handle case where file might have been deleted or is inaccessible
                              }
               }

               // Sort children
               for (const children of childrenMap.values()) {
                              children.sort();
               }

               function buildRecursive(currentPath) {
                              const filename = currentPath === '' ? '.' : path.basename(currentPath);
                              const tree = new Tree(filename);

                              if (childrenMap.has(currentPath)) {
                                             for (const childPath of childrenMap.get(currentPath)) {
                                                            tree.push(buildRecursive(childPath));
                                             }
                              }

                              return tree;
               }

               const tree = buildRecursive('');
               return { tree, dirCount, fileCount };
}

function escapeXml(str) {
               return str
                              .replace(/&/g, '&amp;')
                              .replace(/</g, '&lt;')
                              .replace(/>/g, '&gt;');
}

function formatFileSize(size) {
               const KB = 1024;
               const MB = KB * 1024;
               const GB = MB * 1024;

               if (size < KB) {
                              return `${size} bytes`;
               } else if (size < MB) {
                              return `${(size / KB).toFixed(3)} KB`;
               } else if (size < GB) {
                              return `${(size / MB).toFixed(3)} MB`;
               } else {
                              return `${(size / GB).toFixed(3)} GB`;
               }
}

function formatDateTime(date) {
               return date.toLocaleString('sv-SE', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
               }).replace('T', ' ');
}

// Run if this file is executed directly


// Equivalent to: if (require.main === module)
if (process.argv[1] === __filename) {
               main();
}

console.log("teating docify")
console.log("testing again")

export {
               Tree,
               run,
               getAllPaths,
               buildFileTree,
               escapeXml,
               formatFileSize,
               formatDateTime
};
