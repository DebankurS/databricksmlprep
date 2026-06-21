const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3002;
const ROOT = path.join(__dirname, 'public');
const PROGRESS_FILE = path.join(__dirname, 'data', 'progress.json');
const POST_BODY_MAX = 1_000_000; // 1MB

fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.sql': 'text/plain',
  '.py': 'text/plain',
};

http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url.includes('..')) {
    res.writeHead(403); res.end(); return;
  }

  if (url.pathname === '/api/progress') {
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'GET') {
      const data = fs.existsSync(PROGRESS_FILE)
        ? fs.readFileSync(PROGRESS_FILE, 'utf8')
        : '{"associate":{"tracker":{},"scheduler":null},"professional":{"tracker":{},"scheduler":null}}';
      res.writeHead(200);
      res.end(data);
    } else if (req.method === 'POST') {
      let body = '';
      let size = 0;
      req.on('data', chunk => {
        if (res.writableEnded) return;
        size += chunk.length;
        if (size > POST_BODY_MAX) {
          res.writeHead(413);
          res.end('{"error":"payload too large"}');
          req.destroy();
          return;
        }
        body += chunk;
      });
      req.on('end', () => {
        if (res.writableEnded) return;
        try {
          const parsed = JSON.parse(body);
          fs.writeFileSync(PROGRESS_FILE, JSON.stringify(parsed));
          res.writeHead(200);
          res.end('{"ok":true}');
        } catch {
          res.writeHead(400);
          res.end('{"error":"invalid json"}');
        }
      });
    } else {
      res.writeHead(405);
      res.end();
    }
    return;
  }

  const filePath = path.join(ROOT, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403); res.end(); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`));
