/**
 * 1 获取用户的收货地址
 *   1 绑定点击事件
 *   2 调用小程序内置的 api 获取用户的收货地址 wx.chooseAddress
 * 
 * 2 获取 用户 对小程序 所授予 获取地址 权限状态 scope
 *   1 假设 用户点击获取地址的提示框 确定 authSetting scope.address
 *     scope为true 直接调用 获取收货地址
 *    
 *   2 假设 用户从来没有调用过收货地址的api 
 *     scope为undefined 直接调用 获取收货地址
 * 
 *   3 假设 用户点击获取地址的提示框 取消 
 *     scope为false 
 *     1 引导用户打开 授权设置页面 当用户重新给予 获取地址权限的时候
 *     2 获取收货地址
 * 3 页面加载完毕
 *   0 onLoad onShow
 *   1 获取本地存储中的地址数据
 *   2 把数据设置给 data 中的 一个变量
 * 
 * 4 onShow
 *   1 获取缓存中的购物车数据
 *   2 把购物车数据填充到data中  
 * 
 * 5 全选的实现
 *   1 onShow中获取缓存中的购物车数组
 *   2 根据购物车中的商品数据进行计算   所以商品都被选中 checked = true 全选就被选中
 * 
 * 6 总价格和总数量
 *   1 都需要商品被选中 才计算
 *   2 获取购物车数据 
 *   3 遍历
 *   4 判断商品是否被选中
 *   5 总价格 += 商品的单价 * 商品的数量
 *   6 总数量 += 商品的数量
 *   7 把计算后的结果 和 数量 都设置回 data中
 * 
 * 7 商品的选中
 *   1 绑定change事件
 *   2 获取到被修改的商品对象
 *   3 商品对象的选中状态 取反
 *   4 重新填回带data中 和 缓存中
 *   5 重新计算全选 总价格 总数量
 * 
 * 8 全选 反选
 *   1 绑定change事件
 *   2 获取data中的全选变量 allChecked
 *   3 直接取反 allChecked = !allChecked
 *   4 遍历购物车数组 让里面商品的选中状态 跟随着 allChecked 的改变而改变
 *   5 把购物车数组 和 allChecked 都重新设置回data中 把购物车重新设置回缓存中
 * 
 * 9 商品数量的编辑
 *   1 "+" "-" 按钮 绑定同一个点击事件 区分的关键在于 自定义属性
 *     1 "+" "+1"
 *     2 "-" "-1"
 *   2 传递被点击的商品id  goods_id
 *   3 获取到data中的购物车数组  根据goods_id 来获取要修改的商品对象
 *   4 当 购物车中商品的数量 = 1 同时用户点击 “-” 
 *     1 弹窗提示 用户是否删除当前商品 wx.showModal
 *       1 确定 直接删除
 *       2 取消 什么都不做  
 *   5 直接修改当前商品对象的数量 num
 *   6 把购物车数据重填回到data和 缓存中 this.setCart()
 * 
 * 10 结算按钮
 *   1 判断有木有收货地址信息
 *   2 判断用户有木有选购商品
 *   3 经过以上的验证 跳转到 支付页面
 */
import {
  getSetting,
  chooseAddress,
  openSetting,
  showModal,
  showToast,
} from "../../utils/asyncWx.js";
import regeneratorRuntime from "../../lib/runtime/runtime";

Page({
  data: {
    address: {},
    cart: [],
    allChecked: false,
    totalPrice: 0,
    totalNum: 0,
  },
  onShow() {
    // 1 获取缓存中的收货地址信息
    const address = wx.getStorageSync("address");
    // 获取缓存中的购物车数据
    const cart = wx.getStorageSync("cart") || [];
    // 计算全选
    // every()数组方法 会遍历 会接收一个回调函数  每一个回调函数都返回true 那么every方法的返回值就为true
    // 只要有一个回调函数返回false  那么不再循环执行， 直接返回false
    // 空数组 调用every方法，那么返回值就是true
    // const allChecked = cart.length ? cart.every(v => v.checked) : false;
    this.setData({
      address,
    });
    this.setCart(cart);
  },

  // 点击收货地址
  async hanleChooseAddress() {
    try {
      // 1 获取 权限状态
      const res1 = await getSetting();
      const scopeAddress = res1.authSetting["scope.address"];
      // 2 判断 权限状态
      if (scopeAddress === false) {
        // 3 先引导用户打开授权页面
        await openSetting();
      }
      // 4 直接调用 获取收货地址代码
      let address = await chooseAddress();
      address.all =
        address.provinceName +
        address.cityName +
        address.countyName +
        address.detailInfo;
      // 5 存入到缓存中
      wx.setStorageSync("address", address);
    } catch (error) {
      console.log(error);
    }
  },

  // 商品的选中
  handleItemChange(e) {
    // 1 获取被修改的商品的id
    const goods_id = e.currentTarget.dataset.id;
    console.log(goods_id);
    // 2 获取购物车数组
    let { cart } = this.data;
    // 3 找到被修改的商品对象
    let index = cart.findIndex((v) => v.goods_id === goods_id);
    // 4 选中状态取反
    cart[index].checked = !cart[index].checked;

    this.setCart(cart);
  },

  // 商品的全选
  handleItemAllChecked() {
    // 1 获取data中的数据
    let { cart, allChecked } = this.data;
    // 2 修改值
    allChecked = !allChecked;
    // 3 循环修改cart数组中的商品选中状态
    cart.forEach((v) => (v.checked = allChecked));
    // 4 把修改后的值 填回到data或者缓存中
    this.setCart(cart);
  },

  // 设置购物车状态同时 重新计算 底部工具栏的数据
  setCart(cart) {
    let allChecked = true;
    // 总价格 总数量
    let totalPrice = 0;
    let totalNum = 0;
    cart.forEach((v) => {
      if (v.checked) {
        totalPrice += v.goods_price * v.num;
        totalNum += v.num;
      } else {
        allChecked = false;
      }
    });
    // 判断数组是否为空
    allChecked = cart.length != 0 ? allChecked : false;
    this.setData({
      cart,
      totalPrice,
      totalNum,
      allChecked,
    });
    wx.setStorageSync("cart", cart);
  },

  // 商品数量的编辑
  async handleItemNumEdit(e) {
    // 1 获取传递过来的参数
    const { operation, id } = e.currentTarget.dataset;
    // 2 获取购物车数组
    let { cart } = this.data;
    // 3 先找到需要修改的商品的索引
    const index = cart.findIndex((v) => v.goods_id === id);
    // 判断商品数量是否为0  当为1的时候用户再点击 “-”， 提示用户是否删除该商品
    if (cart[index].num === 1 && operation === -1) {
      const res = await showModal({ content: "是否删除该商品？" });
      if (res.confirm) {
        cart.splice(index, 1);
        this.setCart(cart);
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    } else {
      // 4 修改数量
      cart[index].num += operation;
      // 5 把购物车数据填回到 data和缓存中
      this.setCart(cart);
    }
  },

  // 支付
  async handlePay() {
    // 1 判断收货地址
    const { address,totalNum } = this.data;
    if (!address.userName) {
      const res = await showToast({ title: "您还未添加收货地址！" });
      return;
    }
    // 2 判断用户有木有选购商品
    if (totalNum === 0) {
      const res = await showToast({ title: "您还未选购商品！" });
      return;
    }
    // 3 跳转到 支付页面
    wx.navigateTo({
      url: '/pages/pay/pay'
    });
      
  },
});