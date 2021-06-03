/*
 * @Author: mokinzhao
 * @Date: 2021-05-26 10:10:49
 * @Description:
 */

//防抖
function debounce(fn, dealy) {
  let timer = null;
  return function (params) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, dealy);
  };
}
//防抖
const debounce = function (fn, dealy) {
  let timer = null;
  return function () {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, dealy);
  };
};

// 节流
function thottle(fn, dealy) {
  let timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, arguments);
        timer = null;
      }, dealy);
    }
  };
}

//节流
const thottle = function (fn, dealy) {
  let timer = null;
  return function () {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, arguments);
        timer = null;
      }, dealy);
    }
  };
};
