const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const compare = require('natural-compare');
const mime = require('mime-types');
const stream = require('stream');

const htmlTpl = fs.readFileSync(path.join(__dirname, '../tpl/directory.hbs'));
const template = handlebars.compile(htmlTpl.toString());

async function serve(ctx, next) {
  const { req, res, filePath } = ctx;
  const { url } = req;

  await next();

  if(res.statusCode === 304) {
    res.end('');
  }

  const list = [];
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) {
    // 如果是文件夹则遍历文件夹，生成改文件夹内的文件树
    const dir = fs.opendirSync(filePath);
    let dirent = dir.readSync();
    while (dirent) {
      list.push({
        name: dirent.name,
        path: path.join(url, dirent.name),
        type: dirent.isDirectory() ? 'folder' : 'file',
      });
      dirent = dir.readSync();
    }
    dir.close();

    res.writeHead(200, {
      'Content-Type': 'text/html',
    });

    // 对文件顺序重排，文件夹在文件前面，相同类型按字母排序，不区分大小写
    list.sort((x, y) => {
      if (x.type > y.type) {
        // 'folder' > 'file'， 返回 -1，folder 在 file 之前
        return -1;
      } else if (x.type == y.type) {
        return compare(x.name.toLowerCase(), y.name.toLowerCase());
      } else {
        return 1;
      }
    });

    // 使用 handlebars 模板引擎，生成目录页面 html
    const html = template({ list });
    res.end(html);

  } else {
    const contentType = mime.contentType(path.extname(url));
    res.setHeader('Content-Type', contentType);
    if (typeof ctx.body === 'string') {
      res.end(ctx.body);
    } else {
      ctx.body.pipe(res);
    }
  }
}

module.exports = serve;
