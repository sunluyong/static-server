const fs = require('fs');
const path = require('path');
const etag = require('etag');

const { root, maxAge, enableEtag, enableLastModified } = require('./config');

function handleCache(req, res) {
  if(maxAge) {
    res.setHeader('Cache-Control', `max-age=${maxAge}`);
  }

  if (!enableEtag & !enableLastModified) {
    res.statusCode = 200;
  }

  const { url, headers } = req;
  const filePath = path.join(root, url);

  if (enableEtag) {
    const reqEtag = headers['etag'];
    // 为了方便演示，使用同步方法读取响应内容，计算 etag，正常逻辑不会这么处理
    const resEtag = etag(fs.readFileSync(filePath));
    res.setHeader('ETag', resEtag);
    res.statusCode = reqEtag === resEtag ? 304 : 200;
  }

  if (enableLastModified) {
    const lastModified = headers['if-modified-since'];
    const mtime = fs.statSync(filePath).mtime.toUTCString();
    res.setHeader('Last-Modified', mtime);
    res.statusCode = lastModified === mtime ? 304 : 200;
  }
}

module.exports = handleCache;
