/**
 * 1 用户上滑页面 滚动条触底 开始加载下一页数据
 *   1 找到滚动条触底事件
 *   2 判断还有没有下一页数据
 *     1 获取到总页数
 *       总页数 = Math.ceil(总条数 / 页容量pagesize)
 *     2 获取当前的页码
 *     3 判断一下 当前的页码是否大于等于 总页数
 *       是则 表示满意下一页数据
 *
 *   3 假如没有下一页数据弹出一个提示
 *   4 假如还有下一页数据来加载下一页数据
 *     1 当前页码 ++
 *     2 重新发送请求
 *     3 数据请求回来 要对data中的数组进行 拼接 而不是全部替换
 * 2 下拉刷新页面
 *   1 触发下拉刷新事件
 *   2 重置 数据 数组
 *   3 重置页码 设置为1
 *   4 重新发送请求
 */
import { request } from "../../request/index.js";
import regeneratorRuntime from "../../lib/runtime/runtime";
Page({
  data: {
    tabs: [
      { id: 0, name: "综合", isActive: true },
      { id: 1, name: "销量", isActive: false },
      { id: 2, name: "价格", isActive: false },
    ],
    goodsList: [],
    // 触底提示
    isShowMore: false,
  },
  QueryParams: {
    query: "",
    cid: "",
    pagenum: 1,
    pagesize: 10,
  },
  // 总页数
  totalPages: 1,
  onLoad: function (options) {
    this.QueryParams.cid = options.cid;
    this.getGoodsList();
  },
  // 点击标题事件 用来接收子组件传递的数据
  handleItemChange: function (e) {
    // 获取被点击的标题索引
    const { index } = e.detail;
    // 修改原数组
    let { tabs } = this.data;
    tabs.forEach((v, i) =>
      i === index ? (v.isActive = true) : (v.isActive = false)
    );
    // 赋值到data中
    this.setData({
      tabs: tabs,
    });
  },

  // 获取商品列表数据
  async getGoodsList() {
    const res = await request({ url: "/goods/search", data: this.QueryParams });
    // 获取总条数
    const total = res.total;
    // 计算总页数
    this.totalPages = Math.ceil(total / this.QueryParams.pagesize);

    this.setData({
      goodsList: [...this.data.goodsList, ...res.goods],
    });

    // 关闭下拉刷新窗口
    wx.stopPullDownRefresh(); 
  },

  //页面上滑 滚动条触底事件
  onReachBottom() {
    // 判断还有没有下一页数据
    if (this.QueryParams.pagenum >= this.totalPages) {
      // 没有下一页
      this.setData({
        isShowMore: true,
      });
    } else {
      this.QueryParams.pagenum++;
      this.getGoodsList();
    }
  },

  // 下拉刷新，重新获取数据
  onPullDownRefresh() {
    // 重置数组
    this.setData({
      goodsList: [],
      isShowMore:false
    });
    // 重置页码
    this.QueryParams.pagenum = 1;
    // 重新发送请求
    this.getGoodsList(); 
    
  }
});
