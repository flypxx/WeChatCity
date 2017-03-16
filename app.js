//app.js
App({
  globalData: {
    URL: '',
    loginUrl: '',
    exitUrl: '',
    dataByDayUrl: '',
  },
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    this.globalData.URL = 'https://wifidc.com';
    this.globalData.loginUrl = '/api/onLogin';
    this.globalData.onStorage = '/api/onStorage';
    this.globalData.exitUrl = '/api/exit';
    this.globalData.dataByDayUrl = '/api/data/today';
    this.globalData.todayRepertoryUrl = '/api/data/repertory/today';
    this.globalData.salesUrl = '/api/data/soldout/';
    this.globalData.payDataUrl = '/api/data/payment';
    this.globalData.discountUrl = '/api/data/business';
    this.globalData.staffDataUrl = '/api/data/waitercheck';
    this.globalData.formDataObj = {
      rest_id: '',
      time_begin: '2017-01-02',
      time_end: '2017-01-09',
      isWechat: '1'
    };
  },
  getUserInfo: function (cb) {
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      var that = this;
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  }
})