/*
 * @Author: mokinzhao
 * @Date: 2019-09-24 15:02:43
 * @Description:
 * @LastEditTime: 2019-09-24 16:34:59
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
  themeConfig: {
    sidebarDepth: 2, // e'b将同时提取markdown中h2 和 h3 标题，显示在侧边栏上。
    lastUpdated: "Last Updated", // 文档更新时间：每个文件git最后提交的时间
    sidebar: {
      // docs文件夹下面的accumulate文件夹 文档中md文件 书写的位置(命名随意)
      "/accumulate/": [
        "/accumulate/", // accumulate文件夹的README.md 不是下拉框形式
        {
          title: "内容待定",
          children: [
            "/accumulate/JS/test" // 以docs为根目录来查找文件
            // 上面地址查找的是：docs>accumulate>JS>test.md 文件
            // 自动加.md 每个子选项的标题 是该md文件中的第一个h1/h2/h3标题
          ]
        }
      ],
      // docs文件夹下面的algorithm文件夹 这是第二组侧边栏 跟第一组侧边栏没关系
      "/algorithm/": [
        "/algorithm/",
        {
          title: "内容待定2",
          children: ["/accumulate/JS/test"]
        }
      ]
    },
    nav: [
      { text: "vue", link: "/algorithm/" }, // 内部链接 以docs为根目录
      { text: "react", link: "/accumulate/" }, // 内部链接 以docs为根目录
      { text: "node", link: "/accumulate/" }, // 内部链接 以docs为根目录
      { text: "算法", link: "/accumulate/" }, // 内部链接 以docs为根目录
      { text: "安全", link: "/accumulate/" }, // 内部链接 以docs为根目录
      { text: "跨端综合", link: "/accumulate/" }, // 内部链接 以docs为根目录
      {
        text: "基础综合",
        items: [
          { text: "网络协议", link: "/accumulate/" },
          {
            text: "数据结构",
            link: "/accumulate/"
          },
          {
            text: "设计模式",
            link: "/accumulate/"
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
