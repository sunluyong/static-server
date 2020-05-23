// 静态资源服务器默认配置

module.exports = {
  port: 9527,
  root: process.cwd(), // 默认使用启动 node 的目录做为根目录
  maxAge: 60 * 1000, // 本地缓存时间，默认 60s
  enableEtag: true,
  enableLastModified: true,
};
