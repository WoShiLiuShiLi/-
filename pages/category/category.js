// pages/category/category.js
import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({
  data: {
    //左侧菜单数据
    leftMenuList: [],
    //右侧的商品数据
    rightContent: [],
    //被点击的左侧菜单
    currentIndex: 0,
    //内容滚动条距离顶部的距离
    scrollTop: 0,
  },
  //接口的返回数据
  Cates: [],

  onLoad: function (options) {
    /**
     *  web中的本地存储和小程序中的本地存储的区别
     *  1 写代码的方式不一样了
     *    web: localstorage.setItem("key" , "value") localStorage.getItem("key")
     *    小程序中: wx.setStorageSync("key" , "value" ); wx.getstorageSync("key" );
     *  2:存的时候有没有做类型转换
     *    web:不管存入的是什么类型的数据，最终都会先调用以下toString(),把数据变成了字符串 再存入进去
     *    小程序:不存在类型转换的这个操作存什么类似的数据进去，获取的时候就是什么类型
     */

    //1 先判断一下本地存储中有没有旧的数据: {time:Date.now(), data:[...]}
    //2 没有旧数据直接发送新请求
    //3 有旧的数据同时旧的数据也没有过期就使用本地存储中的旧数据即可
    // this.getCates();

      
    //1获取本地存储中的数据 （小程序中也是存在本地存储 技术）
    const Cates = wx.getStorageSync("cates");
    //2判断
    if (!Cates) {
      //不存在 发送请求获取数据
      this.getCates();  
    } else {
      //有旧数据 定义过期时间
      if (Date.now() - Cates.time > 1000 * 300) {
        //重新发送请求
        this.getCates();
      } else {
        //可以使用旧的数据
        this.Cates = Cates.data;
        let leftMenuList = this.Cates.map((val) => val.cat_name);
        let rightContent = this.Cates[0].children;
        this.setData({
          leftMenuList: leftMenuList,
          rightContent: rightContent,
        });
      }
    }
  },
  //获取 分类数据
  async getCates() {
    // request({
    //   url: "/categories",
    // }).then((res) => {
    //   this.Cates = res.data.message;

    //   //把接口的数据存入到本地存储中
    //   wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });

    //   //构造左侧的大菜单数据
    //   let leftMenuList = this.Cates.map((val) => val.cat_name);
    //   //构造右侧的内容数据
    //   let rightContent = this.Cates[this.data.currentIndex].children;
    //   this.setData({
    //     leftMenuList: leftMenuList,
    //     rightContent: rightContent,
    //   });
    // });

    //使用es7的async await来发送请求
    const res = await request({ url: "/categories" });
    // this.Cates = res.data.message;
    this.Cates = res;
    //把接口的数据存入到本地存储中
    wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });

    //构造左侧的大菜单数据
    let leftMenuList = this.Cates.map((val) => val.cat_name);
    //构造右侧的内容数据
    let rightContent = this.Cates[0].children;
    this.setData({
      leftMenuList: leftMenuList,
      rightContent: rightContent,
    });
  },
  //左侧菜单的点击事件
  handleItemTap(e) {
    //1 获取被点击的标题身上的索引
    const { index } = e.currentTarget.dataset;
    //2 给data中的currentIndex赋值
    //3 根据不同的索引来渲染页面右侧的商品内容
    
    let rightContent = this.Cates[index].children;
    console.log(rightContent);
    // 重新设置右侧内容scroll-view距离顶部的距离
    this.setData({
      currentIndex: index,
      rightContent: rightContent,
      scrollTop: 0,
    });
    
  },
});
