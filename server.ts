// server.ts - Place in your Next.js project root
import { createServer } from 'https';
import { parse } from 'url';
import next from 'next';
import fs from 'fs';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Read SSL certificates
const httpsOptions = {
  key: fs.readFileSync(path.join(process.cwd(), '.cert', 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(process.cwd(), '.cert', 'localhost.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, () => {
    console.log(`✅ Ready on https://${hostname}:${port}`);
    console.log('🔒 HTTPS development server is running');
  });
});