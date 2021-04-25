// components/Tabs/Tabs.js
Component({
  /**
   * 组件的属性列表
   * 里面存放的是 要从父组件中接收的数据
   */
  properties: {
    // 要接收的数据的名称
    tabs: {
      // type 要接收的数据的类型
      type: Array,
      // value 默认值
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleItemTap: function (e) { 
      // 1 获取被点击的索引
      const { index } = e.currentTarget.dataset;

      // 2 触发父组件中的自定义事件 同时传递数据给 父组件
      this.triggerEvent("itemChange", {index});
    }
  }
})
