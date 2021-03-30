---
title: JavaScript之工具函数
---

## JavaScript JavaScript 之工具函数

- 防抖(debounce)

```js
const debounce = (fn, delay = 1000) => {
  let timer;
  return () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, arguments);
    }, delay);
  };
};
```

- 节流(throttle)

```js
const throttle = (fn, dealy) => {
  let timer = null;
  return () => {
    if (!timer) {
      timer = setTimeout(() => {
        timer = null;
        fn.apply(this, arguments);
      }, dealy);
    }
  };
};
```
