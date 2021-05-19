/*
 * @Author: mokinzhao
 * @Date: 2021-04-07 17:26:08
 * @Description: 常用工具函数
 */

//防抖
const debounce = (fn, dealy) => {
  let timer = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, dealy);
  };
};
const debounce = (fn, dealy) => {
  let timer = null;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, dealy);
  };
};
//节流
const thottle = (fn, dealy) => {
  let timer = null;
  return () => {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, arguments);
        timer = null;
      }, dealy);
    }
  };
};

const thottle = (fn, dealy) => {
  let timer = null;
  return () => {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, arguments);
        timer = null;
      }, dealy);
    }
  };
};
