var app = getApp();
var utils = require('../../utils/util.js');
var requireData = require('../data/data.js');

Page({
  data: {
    currentStore: '0',
    userStorage: {},
    today: '',
    ifDateFinished: true,
    dataByDay: {
      turnover: '0',
      orderNum: '0',
      customNum: '0',
      prepaid: '0'
    },
    pageFormData: {},
    canvasData: {
      width: 355,
      max: 1,
      avg: 0.5,
      gridWidth: 50,
      val: 0,
      valShow: false,
      valTop: 0,
      valLeft: 0,
      valArr: [],
      heightArr: []
    }
  },
  toLoginPage: function () {
    wx.navigateTo({
      url: '../login/login'
    })
  },
  linkToPage: function (event) {
    wx.navigateTo({
      url: event.currentTarget.dataset.url
    })
  },
  bindPickerChange: function (e) {
    if (e.detail.value === this.data.currentStore) {
      return;
    }

    var obj = app.globalData.formDataObj;
    obj.rest_id = this.data.storesData.id[e.detail.value];
    this.setData({
      currentStore: e.detail.value,
      pageFormData: obj
    });
    app.globalData.formDataObj = obj;

    // 发送数据请求，更新页面数据
    this.refreshPageData();
  },
  bindStartDateChange: function (event) {

    var obj = app.globalData.formDataObj;
    obj.time_begin = event.detail.value;
    this.setData({
      ifDateFinished: false,
      pageFormData: obj
    });
    app.globalData.formDataObj = obj;
  },
  bindEndDateChange: function (event) {

    var obj = app.globalData.formDataObj;
    obj.time_end = event.detail.value;
    this.setData({
      ifDateFinished: true,
      pageFormData: obj
    });
    app.globalData.formDataObj = obj;

    // 发送数据请求更新页面数据
    this.refreshPageData();
  },
  tapCanvas: function (e) {
    console.log('tapCanvas');
    console.log(e);
    var canvasData = this.data.canvasData;
    var x = parseInt(e.touches[0].clientX);
    var val = '' + canvasData.val;
    var idx = canvasData.idx;
    var gridWidth = canvasData.gridWidth;
    var paddingLeft = canvasData.paddingLeft;
    var cvsLeft = canvasData.touchX - x;
    var idxLeft = idx * gridWidth + gridWidth / 2;
    var valLeft = idxLeft - cvsLeft;
    valLeft = valLeft < 0 ? 0 : valLeft;
    // 根据数据长度调整left
    var sWidth = 5;
    var valPadding = 6;
    valLeft = valLeft - val.length / 2 * sWidth - valPadding;
    canvasData.valLeft = valLeft;
    canvasData.valShow = true;
    this.setData({
      canvasData: canvasData
    });
  },
  touchCanvas: function (e) {
    console.log('touchCanvas');
    console.log(e);
    var canvasData = this.data.canvasData;
    var gridWidth = canvasData.gridWidth;
    var valArr = canvasData.valArr;
    var touchX = parseInt(e.touches[0].x);
    var x = parseInt(touchX / gridWidth);
    x = x > valArr.length ? valArr.length : x;
    var heightArr = canvasData.heightArr;
    canvasData.idx = x;
    canvasData.touchX = touchX;
    canvasData.val = valArr[x];
    canvasData.valTop = 175 - heightArr[x] - 20 - 2;
    this.setData({
      canvasData: canvasData
    });
  },
  touchmoveCanvas: function (e) {
    console.log('touchmoveCanvas');
    console.log(e);
    var canvasData = this.data.canvasData;
    canvasData.valShow = false;
    this.setData({
      canvasData: canvasData
    });
  },
  touchendCanvas: function(e) {
    console.log('touchendCanvas');
    console.log(e);
  },
  drawAxisX: function (ctx, axisXArr, gridWidth, barWidth) {
    var initWidth = gridWidth / 2 - 5;
    ctx.beginPath();
    ctx.setFontSize(10);
    ctx.setFillStyle('#353535');
    for (var i = 0, len = axisXArr.length; i < len; i++) {
      ctx.fillText(axisXArr[i], initWidth + gridWidth * i, 195);
    }
  },
  drawAxisY: function (ctx, axisYArr, gridWidth, barWidth) {
    var initWidth = (gridWidth - 10) / 2;
    ctx.setLineCap('round');
    ctx.setLineWidth(10);
    for (var i = 0, len = axisYArr.length; i < len; i++) {
      var x = initWidth + gridWidth * i;
      var y = 175 - axisYArr[i];
      ctx.beginPath();
      if (axisYArr[i] > 6) {
        var grd = ctx.createLinearGradient(x, 175, x, y);
        grd.addColorStop(0, 'rgba(235,0,0,1)');
        grd.addColorStop(1, 'rgba(253, 112, 100, 1)');
        ctx.setStrokeStyle(grd);
      } else {
        ctx.setStrokeStyle('rgba(235,0,0,0.8)');
      }
      ctx.moveTo(x, 175)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
  },
  drawAxisYRect: function (ctx, axisYArr, gridWidth, barWidth) {
    var barWidth = 10;
    var initWidth = gridWidth / 2;
    for (var i = 0, len = axisYArr.length; i < len; i++) {
      var x = initWidth + gridWidth * i;
      var y = 175 - axisYArr[i];
      var h = axisYArr[i] + 5;
      ctx.beginPath();
      if (axisYArr[i] > 6) {
        var grd = ctx.createLinearGradient(x, 175, x, y);
        grd.addColorStop(0, 'rgba(235, 0, 0, 1)');
        grd.addColorStop(1, 'rgba(253, 112, 100, 1)');
        ctx.setFillStyle(grd);
        ctx.fillRect(x - barWidth / 2, y, barWidth, h);
        ctx.setFillStyle('rgba(253, 112, 100, 1)');
      } else {
        ctx.setFillStyle('rgba(235, 0, 0, 1)');
        ctx.fillRect(x - barWidth / 2, y, barWidth, h);
      }
      ctx.arc(x, y, barWidth / 2, 1 * Math.PI, 2 * Math.PI);
      ctx.fill();
    }
  },
  caculateAxisY: function (arr) {
    var arrMess = {};
    var max = parseInt(Math.max.apply(null, arr));
    var num = 0;
    var sum = 0;
    var hArr = [];
    var len = arr.length
    for (var i = 0; i < len; i++) {
      arr[i] !== 0 ? num++ : '';
      sum += arr[i];
    }
    var avg = num === 0 ? 0 : parseInt(sum / num);
    // 每一格的高度
    var gridHeight = 80;
    var maxLength = ('' + max).length - 1;
    max = parseInt(max / Math.pow(10, maxLength) + 1) * Math.pow(10, maxLength);
    var avgLength = ('' + avg).length - 2;
    avg = avgLength < 0 ? max / 2 : (parseInt(avg / Math.pow(10, avgLength) + 1) * Math.pow(10, avgLength));
    var minus = max - avg;
    for (var i = 0; i < len; i++) {
      if (arr[i] <= avg) {
        hArr.push(parseInt(gridHeight * arr[i] / avg));
      } else {
        hArr.push(parseInt(gridHeight + gridHeight * ((arr[i] - avg) / minus)));
      }
    }
    return {
      max: max,
      avg: avg,
      arr: hArr
    }
  },
  drawGridLine: function (ctx, width) {
    ctx.setLineWidth(0.04);
    ctx.moveTo(0, 180);
    ctx.lineTo(width, 180);
    ctx.moveTo(0, 90);
    ctx.lineTo(width, 90);
    ctx.moveTo(0, 1);
    ctx.lineTo(width, 1);
    ctx.stroke();
  },
  login: function () {
    var that = this;
    wx.login({
      success: function (res) {
        if (res.code) {
          wx.request({
            url: app.globalData.URL + app.globalData.loginUrl,
            data: {
              code: res.code
            },
            method: 'POST',
            success: function (response) {
              if (response.statusCode === 200) {
                var data = response.data;
                if (data.errorCode === 200) {
                  var sessionId = data.data.APPID_SESSION;
                  wx.setStorageSync('SESSIONID', sessionId);
                  var userStorage = that.data.userStorage;
                  userStorage.userName = data.data.username;
                  userStorage.restsList = utils.formatRestsToArray(data.data.rests);
                  wx.setStorageSync('MESSAGE', userStorage);
                  // 获取用户数据
                  that.getUserData();
                } else if (data.errorCode === 401) {
                  // 未绑定,跳转到绑定页面
                  wx.navigateTo({
                    url: '../login/login',
                  });
                } else {
                  console.log(data.errorMessage);
                }
              } else {
                console.log(response.errMsg);
              }
            },
            fail: function (res) {
              console.log(res);
            }
          });
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  onPullDownRefresh: function () {
    // 发送数据请求更新页面数据
    this.refreshPageData();
    wx.stopPullDownRefresh();
  },

///////////

  drawData: function (data) {
    var clientWidth = utils.getWindowWidth();
    var ctx = wx.createCanvasContext('salesData');
    // 计算每一格的宽度
    var gridWidth = 50;
    var barWidth = 10;
    // canvas占屏幕宽度
    var ratio = 0.95;
    // test data
    var axisXArr = ['2/1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'];
    var axisYData = [4000, 1000, 1200, 11357, 3878, 3232, 2343, 2323, 23033, 2323, 32212, 333, 567, 20230];
    // var axisXArr = data.xArr;
    // var axisYData = data.yArr;
    var axisXArrLen = axisXArr.length;
    gridWidth = parseInt((clientWidth * 0.95) / axisXArrLen);
    gridWidth = gridWidth < 30 ? 30 : gridWidth;
    var canvasData = this.data.canvasData;
    var width = gridWidth * axisXArrLen;
    width = width < (clientWidth * 0.95) ? (clientWidth * 0.95).toFixed(3) : width;
    var paddingLeft = parseInt(clientWidth * 0.025);
    canvasData.paddingLeft = paddingLeft;
    canvasData.width = width;
    canvasData.gridWidth = gridWidth;
    this.setData({
      canvasData: canvasData
    });
    this.drawGridLine(ctx, width);
    var axisYObj = this.caculateAxisY(axisYData);
    var axisYArr = axisYObj.arr;
    // 绘制横坐标
    this.drawAxisX(ctx, axisXArr, gridWidth, barWidth);
    // 绘制纵坐标
    this.drawAxisYRect(ctx, axisYArr, gridWidth, barWidth);
    //  添加数据描述
    canvasData.max = axisYObj.max;
    canvasData.avg = axisYObj.avg;
    canvasData.valArr = axisYData;
    canvasData.heightArr = axisYArr;
    this.setData({
      canvasData: canvasData
    });
    ctx.draw();
  },

  getDayData: function (data) {
    var dayData = {
      xArr: [],
      yArr: []
    };
    var len = data.length;
    var arrLen = len < 7 ? 7 : len;
    var xArr = [];
    var yArr = [];
    var date = data[len - 1].day;
    for (var i = arrLen - 1; i >= 0; i--) {
      var time = new Date(date).getTime() - i * 1000 * 60 * 60 * 24;
      var day = utils.formatDate(time, 'simple');
      xArr.push(day);
    }
    var zeroNum = arrLen - len;
    zeroNum = zeroNum < 0 ? 0 : zeroNum;
    for (var i = 0; i < arrLen; i++) {
      if (zeroNum > 0) {
        yArr.push(0);
        zeroNum--;
      } else {
        var yVal = data.shift().turnover;
        yVal = isNaN(yVal) ? 0 : Math.round(yVal);
        yArr.push(yVal);
      }
    }
    dayData.xArr = xArr;
    dayData.yArr = yArr;
    return dayData;
  },
  
  refreshPageData: function () {
    var data = requireData.data;
    var dataByDay = {
      dayData: data
    }
    this.setData({
      dataByDay: dataByDay
    });
    // 画图
    var saa = data;
    var dayData = this.getDayData(saa);
    this.drawData(dayData);
  },

  onLoad: function () {
    this.refreshPageData();
  }
});
