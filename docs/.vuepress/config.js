/*
 * @Author: mokinzhao
 * @Date: 2019-09-24 15:02:43
 * @Description:
 * @LastEditTime : 2019-12-20 11:00:28
 */
module.exports = {
  title: "全栈大前端",
  description: "mokinzhao 的前端世界",
  serviceWorker: true,
  // 注入到当前页面的 HTML <head> 中的标签
  head: [
    ["link", { rel: "icon", href: "/favicon.ico" }], // 增加一个自定义的 favicon(网页标签的图标)
    //增加manifest.json
    ["link", { rel: "manifest", href: "/manifest.json" }],
    [
      "script",
      {},
      `
    var _hmt = _hmt || [];
    (function() {
      var hm = document.createElement("script");
      hm.src = "https://hm.baidu.com/hm.js?89be3d514ec18b88f3530b7ecf868937";
      var s = document.getElementsByTagName("script")[0]; 
      s.parentNode.insertBefore(hm, s);
    })();
`
    ]
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
      // { text: "安全", link: "https://juejin.im/post/5c137f37f265da6133567735" },
      // {
      //   text: "面试",
      //   items: [
      //     {
      //       text: "大厂面试题",
      //       link: "/面试/大厂面试题"
      //     },
      //     {
      //       text: "大厂内推",
      //       link: "/面试/大厂内推"
      //     },
      //     {
      //       text: "面试资料",
      //       link: "/面试/面试资料"
      //     }
      //   ]
      // },
      {
        text: "架构分析与设计",
        items: [
          {
            text: "框架设计：PC 端单页多页框架如何设计与落地 ",
            link: "https://mp.weixin.qq.com/s/m519w-RtdslHHrcbi_VLBA"
          },
          {
            text: "框架设计：RN 端的框架如何设计与落地",
            link: "https://mp.weixin.qq.com/s/Vtczty5i8awo3p7qspjhmg"
          },
          {
            text: "透彻分析：常见的前端架构风格和案例",
            link: "https://mp.weixin.qq.com/s/x4KcDPrV2aqtjkRdow_JVg"
          },

          {
            text: "领域驱动设计在前端中的应用",
            link: "https://mp.weixin.qq.com/s/1kl8SV28GDt_40FF_6CuhA"
          }
        ]
      },
      {
        text: "数据结构与算法",
        items: [
          {
            text: "一文概览数据结构与算法",
            link: "https://mp.weixin.qq.com/s/EFil0A_ylv_PCreVj-SebA"
          },
          {
            text: "数据结构与算法系列",
            link: "http://www.conardli.top/docs/dataStructure/"
          },
          {
            text: "十大经典排序",
            link: "https://segmentfault.com/a/1190000019916376"
          }
        ]
      },

      {
        text: "网络与浏览器缓存",
        items: [
          {
            text: "HTTP协议基础概述",
            link: "/网络/Http"
          },
          {
            text: "TCP协议与OSI 七层模型",
            link: "/网络/Tcp"
          },
          {
            text: "解读HTTP/2与HTTP/3 的新特性",
            link: "https://mp.weixin.qq.com/s/zhYWDhsqrBO5MB4Hw2XkDA"
          },
          {
            text: "从URL输入到页面展现到底发生什么",
            link: "https://mp.weixin.qq.com/s/mzckXvsqW99xe_t-uUYy4w"
          }
        ]
      },

      {
        text: "面向对象与设计模式",
        items: [
          {
            text: "面向对象之三个基本特征（javaScript）",
            link: "https://segmentfault.com/a/1190000018239556"
          },
          {
            text: "面向对象之七大基本原则（javaScript）",
            link: "https://segmentfault.com/a/1190000020319171"
          },
          {
            text: "设计模式",
            link: "https://juejin.im/post/5c2e10a76fb9a049c0432697"
          }
        ]
      },
      {
        text: "跨端融合",
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
          },
          {
            text: "PWA",
            link:
              "https://developer.mozilla.org/zh-CN/docs/Web/Progressive_web_apps"
          }
        ]
      },
      { text: "博客", link: "https://blog.csdn.net/z4909801" } // 外部链接
      // 下拉列表
      // {
      //   text: "他山之石",
      //   items: [
      //     { text: "木易杨前端进阶", link: "https://www.muyiy.cn/" },
      //     {
      //       text: "数据结构与算法",
      //       link: "http://www.conardli.top/docs/"
      //     },
      //     {
      //       text: "前端面试与进阶指南",
      //       link: "https://www.cxymsg.com/"
      //     },
      //     {
      //       text: "前端进阶之道",
      //       link: "https://yuchengkai.cn/"
      //     }
      //   ]
      // }
    ]
  }
};
