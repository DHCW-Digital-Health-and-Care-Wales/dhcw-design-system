'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { build, OUT } = require('./build-preview-site');

const PORT = Number(process.argv[2]) || Number(process.env.PREVIEW_SITE_PORT) || 4173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.map': 'application/json',
};

function serveFile(res, filePath) {
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

async function main() {
  await build();

  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(OUT, urlPath);

    if (!filePath.startsWith(OUT)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      fs.access(filePath, fs.constants.R_OK, (accessErr) => {
        if (!accessErr) {
          serveFile(res, filePath);
          return;
        }
        const htmlPath = `${filePath}.html`;
        fs.access(htmlPath, fs.constants.R_OK, (htmlErr) => {
          if (htmlErr || path.extname(filePath)) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not found: ' + urlPath);
            return;
          }
          serveFile(res, htmlPath);
        });
      });
    });
  });

  server.listen(PORT, () => {
    console.log(`Preview site serving at http://localhost:${PORT}`);
  });
}

main();
