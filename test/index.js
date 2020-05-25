// const StaticServer = require('../src/index');

// const staticServer = new StaticServer({
// 	port: 9527,
// });

// staticServer.start();

// staticServer.close();

const compose = require('../src/util/compose');
const middleware = [];

middleware.push(async (ctx, next) => {
	console.log('第 1 个中间件 next 前');
	await next();
	console.log('第 1 个中间件 next 后');
});

middleware.push(async (ctx, next) => {
	console.log('第 2 个中间件 next 前');
	// await next(); // 不调用 next()
	console.log('第 2 个中间件 next 后');
});

middleware.push(async (ctx, next) => {
	console.log('第 3 个中间件 next 前');
	await next();
	console.log('第 3 个中间件 next 后');
});

const ctx = {};
compose(middleware)(ctx);
