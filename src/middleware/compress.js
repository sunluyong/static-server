const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const compressible = require('compressible');
const accepts = require('accepts');
const mime = require('mime-types');

function getPreferEncoding(encodings, contentType) {
  const serverCompatibleCompressions = [
    { method: 'gzip', stream: zlib.createGzip() },
    { method: 'deflate', stream: zlib.createDeflate() },
    { method: 'br', stream: zlib.createBrotliCompress() },
  ];

  let compression;
  if (compressible(contentType)) {
    // 按照浏览器指定优先级在服务器选择压缩方式
    for (let i = 0; i < encodings.length; i++) {
      compression = serverCompatibleCompressions.find(com => com.method === encodings[i]);
      if (compression) {
        break;
      }
    }
  }
  return compression;
}

async function compression(ctx, next) {
  const { res, req, filePath} = ctx;
  const { url } = req;
  const contentType = mime.contentType(path.extname(url));
  const encodings = accepts(ctx.req).encodings();
  const compression = getPreferEncoding(encodings, contentType);

  await next();

  const stats = fs.statSync(filePath);
  if (!stats.isFile()) {
    return;
  }

  if (compression) {
    // 指定服务器使用的压缩方式，浏览器使用对应的解压方式
    res.setHeader('Content-Encoding', compression.method);
    res.removeHeader('Content-Length');

    ctx.body = fs.createReadStream(ctx.filePath).pipe(compression.stream);
  } else {
    ctx.body = fs.createReadStream(ctx.filePath);
  }
}

module.exports = compression;
