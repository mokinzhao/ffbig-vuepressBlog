/*
 * @Author: mokinzhao
 * @Date: 2021-03-30 20:40:11
 * @Description:缓存算法
 */

//LRU最近最少使用原则，使用就更新，不使用往队列后面排
class LRU {
  constructor(max) {
    this.cache = new Map();
    this.max = max;
  }
  get(key) {
    if (this.cache.has(key)) {
      //存在即更新
      let temp = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key);
      return temp;
    }
    return -1;
  }

  put(key, value) {
    if (this.cache.has(key)) {
      //存在即删除
      this.cache.delete(key);
    } else if (this.cache.size >= this.max) {
      //缓存超过最大阀值,删除最后一位
      this.cache.delete(this.cache.keys().next().value);
    }
    //更新
    this.cache.set(key, value);
  }
}

const cache = new LRU(2 /* 缓存容量 */);
cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1)); // 返回  1
cache.put(3, 3); // 该操作会使得密钥 2 作废
console.log(cache.get(2)); // 返回 -1 (未找到)
cache.put(4, 4); // 该操作会使得密钥 1 作废
console.log(cache.get(1)); // 返回 -1 (未找到)
console.log(cache.get(3)); // 返回  3
console.log(cache.get(4)); // 返回  4
