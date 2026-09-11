const fs = require('fs');
const path = require('path');

const REVIEW_PENDING_DIR = path.join(__dirname, '..', 'vault', 'Review', 'Pending');
const DOCS_DIR = path.join(__dirname, '..', 'vault', 'Docs');

function promoteFile(filename) {
  const filePath = path.join(REVIEW_PENDING_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const catMatch = raw.match(/category:\s*"([^"]+)"/);
  const titleMatch = raw.match(/title:\s*"([^"]+)"/);
  const urlMatch = raw.match(/source_url:\s*"([^"]+)"/);
  const scoreMatch = raw.match(/score:\s*([0-9]+)/);

  const category = catMatch ? catMatch[1] : 'General_AI';
  const title = titleMatch ? titleMatch[1] : filename.replace('.md', '');
  const url = urlMatch ? urlMatch[1] : '';
  const score = scoreMatch ? scoreMatch[1] : '8';

  const targetDir = path.join(DOCS_DIR, category);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const cleanName = title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40) + '.md';
  const targetPath = path.join(targetDir, cleanName);

  fs.writeFileSync(targetPath, raw, 'utf8');
  console.log(`[PROMOTED] ${filename} -> vault/Docs/${category}/${cleanName}`);

  // Mark as approved
  const approvedDir = path.join(__dirname, '..', 'vault', 'Review', 'Approved');
  if (!fs.existsSync(approvedDir)) fs.mkdirSync(approvedDir, { recursive: true });
  fs.renameSync(filePath, path.join(approvedDir, filename));
}

// Accepts filename passed from CLI: node tools/promote_to_docs.js <filename>
const targetFile = process.argv[2];
if (targetFile) {
  promoteFile(targetFile);
} else {
  console.log("Usage: node tools/promote_to_docs.js <filename_in_vault_Review_Pending>");
}

module.exports = { promoteFile };