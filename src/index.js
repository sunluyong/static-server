const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const defaultConf = require('./config');

class StaticServer {
  constructor(options = {}) {
    this.config = Object.assign(defaultConf, options);
  }

  start() {
    const { port, root } = this.config;

    this.server = http.createServer((req, res) => {
      const { url, method } = req;
      if (method !== 'GET') {
        res.writeHead(404, {
          'content-type': 'text/html',
        });
        res.end('请使用 GET 方法访问文件！');
        return false;
      }

      const filePath = path.join(root, url);
      fs.access(filePath, fs.constants.R_OK, err => {
        if (err) {
          res.writeHead(404, {
            'content-type': 'text/html',
          });
          res.end('文件不存在！');

        } else {
          res.writeHead(200, {
            'content-type': mime.contentType(path.extname(url)),
          });
          fs.createReadStream(filePath).pipe(res);
        }
      });
    }).listen(port, () => {
      console.log(`Static server started at port ${port}`);
    });
  }

  stop() {
    this.server.close(() => {
      console.log(`Static server closed.`);
    });
  }
}

module.exports = StaticServer;
