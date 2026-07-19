const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PDF_PATH = path.join(__dirname, '13 x 19 Notes Pedia Vol 3 (1).pdf');
const OUTPUT_PATH = path.join(__dirname, 'cover_page.png');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    let htmlPath = path.join(__dirname, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      htmlPath = path.join(__dirname, 'scrolly_book.html');
    }
    res.end(fs.readFileSync(htmlPath));
  } else if (req.method === 'GET' && req.url === '/extract') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fs.readFileSync(path.join(__dirname, 'extract.html')));
  } else if (req.method === 'GET' && req.url.startsWith('/images/')) {
    const imageName = req.url.split('/').pop();
    let imagePath = path.join(__dirname, 'images', imageName);
    if (!fs.existsSync(imagePath)) {
      imagePath = path.join(__dirname, 'extracted_pages', imageName);
    }
    if (fs.existsSync(imagePath)) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(fs.readFileSync(imagePath));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Image Not Found');
    }
  } else if (req.method === 'GET' && req.url === '/pdf') {
    res.writeHead(200, { 'Content-Type': 'application/pdf' });
    res.end(fs.readFileSync(PDF_PATH));
  } else if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const base64Data = payload.image.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync(OUTPUT_PATH, base64Data, 'base64');
        console.log('Cover page saved successfully to ' + OUTPUT_PATH);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success' }));
      } catch (err) {
        console.error('Error saving image:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error saving image: ' + err.message);
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Extractor server running at http://localhost:${PORT}/`);
});
