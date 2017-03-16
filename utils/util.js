function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatDate(time, format) {

  var str = '';
  var dateObj = new Date(time);
  var date = dateObj.getDate();
  var month = dateObj.getMonth() + 1;
  var year = dateObj.getFullYear();
  if (format === 'YYYY-mm-dd') {
    if (String(month).length === 1) month = '0' + month;
    if (String(date).length === 1) date = '0' + date;
    str = '' + year + '-' + month + '-' + date;
  } else if (format === 'simple') {
    if (date === 1) {
      if (month === 1) {
        str = ('' + year).substr(2, 2) + '/1/1'
      } else {
        str = '' + month + '/1';
      }
    } else {
      str = '' + date;
    }
  }
  return str;
}

function getWindowWidth() {
  var width = 375;
  try {
    var res = wx.getSystemInfoSync();
    width = res.windowWidth;
  } catch (e) {
    console.log(e);
  }
  return width;
}

function formatRestsToArray(rests) {
  var storesId = [];
  var storesName = [];

  for (var i = 0, len = rests.length; i < len; i++) {
    storesId.push(rests[i].rest_id);
    storesName.push(rests[i].name);
  }

  return {
    id: storesId,
    name: storesName
  };
}

module.exports = {
  formatTime: formatTime,
  formatDate: formatDate,
  getWindowWidth: getWindowWidth,
  formatRestsToArray: formatRestsToArray
}
