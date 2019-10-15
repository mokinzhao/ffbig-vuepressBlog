/*
 * @Author: mokinzhao
 * @Date: 2019-09-24 15:02:43
 * @Description:
 * @LastEditTime: 2019-09-29 18:52:19
 */
module.exports = {
  title: "全栈大前端",
  description: "mokinzhao 的前端世界",
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }] // 增加一个自定义的 favicon(网页标签的图标)
  ],
  base: "/", // 这是部署到github相关的配置 下面会讲
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  plugins: ["autobar"],
  themeConfig: {
    sidebarDepth: 2, // e'b将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: "Last Updated", // 文档更新时间：每个文件git最后提交的时间
    // sidebar: "auto",
    nav: [
      // { text: "Vue", link: "/20-VUE/" }, // 内部链接 以docs为根目录
      // { text: "React", link: "/30-React/" },
      { text: "大纲", link: "/docs/README" },
      { text: "算法", link: "https://facebook.github.io/react-native/" },
      { text: "安全", link: "https://nervjs.github.io/taro/" },
      { text: "面试", link: "https://uniapp.dcloud.io/" },
      {
        text: "跨端综合",
        items: [
          {
            text: "ReactNative",
            link: "https://facebook.github.io/react-native/"
          },
          {
            text: "Flutter",
            link: "https://flutter.dev/"
          },
          {
            text: "Taro",
            link: "https://nervjs.github.io/taro/"
          },
          {
            text: "Uni-app",
            link: "https://uniapp.dcloud.io/"
          }
        ]
      },
      {
        text: "基础综合",
        items: [
          {
            text: "网络协议",
            link: "https://juejin.im/post/5c93ba526fb9a070ca103898"
          },
          {
            text: "数据结构",
            link: "https://mp.weixin.qq.com/s/EFil0A_ylv_PCreVj-SebA"
          },
          {
            text: "设计模式",
            link: "https://juejin.im/post/5c2e10a76fb9a049c0432697"
          }
        ]
      },
      { text: "博客", link: "https://blog.csdn.net/z4909801" }, // 外部链接
      // 下拉列表
      {
        text: "他山之石",
        items: [
          { text: "木易杨前端进阶", link: "https://www.muyiy.cn/" },
          {
            text: "数据结构与算法",
            link: "http://www.conardli.top/docs/"
          },
          {
            text: "前端面试与进阶指南",
            link: "https://www.cxymsg.com/"
          },
          {
            text: "前端进阶之道",
            link: "https://yuchengkai.cn/"
          }
        ]
      }
    ]
  }
};
