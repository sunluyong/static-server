function compose(middleware) {
  return function (context) {
    // 从第一个中间件开始调用
    return dispatch(0);

    /**
     * 调用指定 index 的中间件，为其传入 next 参数为下一个中间件的 dispatch
     * @param {Number} i 中间件 index
     * @return {Promise} resolve 后意味着上一个中间件 next() 后的代码可以继续执行
     */
    function dispatch(i) {
      // 当前中间件函数
      let fn = middleware[i];

      // 中间件都被调用后
      if (i === middleware.length) {
        return Promise.resolve();
      }

      try {
        // 调用当前中间件，next 参数设置为下一个中间件的 dispatch
        // 程序执行到 await next() 时进入下一个中间件调用
        const ret = fn(context, dispatch.bind(null, i + 1));

        // 将本次调用结果返回给上一个中间件，也就是 await next()
        return Promise.resolve(ret);
      } catch (ex) {
        return Promise.reject(ex);
      }
    }
  }
}

module.exports = compose;
