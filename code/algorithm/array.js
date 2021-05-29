/*
 * @Author: mokinzhao
 * @Date: 2021-03-30 20:36:16
 * @Description:数组
 */
//#20.有效的括号
/* 
给定一个只包括 '('，')'，'{'，'}'，'['，']' 的字符串 s ，判断字符串是否有效。
有效字符串需满足：
左括号必须用相同类型的右括号闭合。
左括号必须以正确的顺序闭合。
*/
const isValid = function (string) {
  const mapper = {
    "{": "}",
    "[": "]",
    "(": ")",
  };
  const stack = [];
  for (const i in string) {
    const v = string[i];
    if (["{", "[", "("].indexOf(v) > -1) {
      stack.push(v);
    } else {
      const peak = stack.pop();
      if (v !== mapper[peak]) {
        return false;
      }
    }
  }
  if (stack.length > 0) {
    return false;
  }
  return true;
};
