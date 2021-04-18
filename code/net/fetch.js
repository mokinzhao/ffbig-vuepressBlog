/*
 * @Author: mokinzhao
 * @Date: 2021-04-18 21:52:28
 * @Description: Fetch 二次封装
 */

let baseURL = "http://127.0.0.1:9999";
inital = {
  method: "GET",
  params: null,
  body: null,
  headers: {
    "Content-tyoe": "applaction/x-www-urlencoded",
  },
};

export default function request(url, config) {
  if (typeof url !== "string") {
    throw new TypeError("");
  }
}
