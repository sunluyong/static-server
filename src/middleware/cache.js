const fs = require('fs/promises'); // 需要 Node.js V14 以上版本
const etag = require('etag');

async function cache(ctx, next) {
  const { res, req, filePath } = ctx;
  const { headers } = req;
  const { maxAge, enableEtag, enableLastModified } = ctx.config;

  await next();

  const stats = require('fs').statSync(filePath);
  if (!stats.isFile()) {
    return;
  }

  if (maxAge) {
    res.setHeader('Cache-Control', `max-age=${maxAge}`);
  }

  if (enableEtag) {
    const reqEtag = headers['etag'];
    // 可以改成异步读取文件内容了，但实际应用同样不会这么做，一般有离线任务计算
    const content = await fs.readFile(filePath);
    const resEtag = etag(content);
    res.setHeader('ETag', resEtag);
    res.statusCode = reqEtag === resEtag ? 304 : 200;
  }

  if (enableLastModified) {
    const lastModified = headers['if-modified-since'];
    const stat = await fs.stat(filePath);
    const mtime = stat.mtime.toUTCString();
    res.setHeader('Last-Modified', mtime);
    res.statusCode = lastModified === mtime ? 304 : 200;
  }
}

module.exports = cache;
