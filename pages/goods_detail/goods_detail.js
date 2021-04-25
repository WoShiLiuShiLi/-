/**
 * 1 点击轮播图 预览大图
 *   1 给轮播图绑定点击事件
 *   2 调用小程序的api previewImg
 * 
 * 2 点击加入购物车
 *   1 先绑定点击事件
 *   2 获取 缓存中的 购物车数据 数组格式
 *   3 先判断 当前商品是否已存在 购物车中
 *     1 已存在 修改商品数据 执行商品数量++ 重新把购物车数组 填充回缓存中
 *     2 不存在购物车数组中 直接给购物车数组添加一个新元素 新元素带上 购物数量属性num 重新把购物车数组 填充回缓存中
 *   4 弹出用户提示
 */
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    goodsObj: {},
  },
  //商品对象
  GoodsInfo:{},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { goods_id } = options;
    this.getGoodsDetail(goods_id);
  },

  //获取商品详情
  async getGoodsDetail(goods_id) {
    //请求接口数据
    const res = await request({ url: "/goods/detail", data: { goods_id } });
    this.GoodsInfo = res;
    // console.log(res);
    console.log(this.GoodsInfo);
    this.setData({
      goodsObj: {
        goods_name: res.goods_name,
        goods_price: res.goods_price,
        // iphone部分手机 不识别 webp图片格式
        goods_introduce: res.goods_introduce.replace(/\.webp/g, ".jpg"),
        pics: res.pics,
      },
    });
  },

  //预览轮播图大图
  handlePreviewImage(e) {
    // 1 构造要预览的图片数组
    const urls = this.GoodsInfo.pics.map((v) => v.pics_mid);
    // 2 接收传递过来的图片url
    const current = e.currentTarget.dataset.url;
    console.log(urls);
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: urls, // 需要预览的图片http链接列表
    });
  },

  // 加入购物车
  handleCartAdd: function () {
    console.log("go");
    // 1 获取缓存中的购物车 数组
    let cart = wx.getStorageSync("cart")||[];
    // 2 判断商品对象是否存在于购物车数组中
    let index = cart.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
    if (index === -1) {
      // 3 表示不存在 第一次添加
      this.GoodsInfo.num = 1;
      this.GoodsInfo.checked = true;
      cart.push(this.GoodsInfo);
    } else {
      // 4 表示已存在于购物车数据中，执行num++
      cart[index].num++;
    }
    // 5 把购物车数据重新添加回缓存中
    wx.setStorageSync("cart", cart);
    // 6 弹窗提示
    wx.showToast({
      title: '加入成功！',
      icon: 'success',
      // 防止用户疯狂点击 加入购物车按钮
      mask: true,
     
    });
      
  }
});