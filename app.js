//app.js
//kizi
//lijun
//123
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

App({
    globalData:{
      logged:true
    },

    onLaunch: function () {
      qcloud.setLoginUrl(config.service.loginUrl, config.service.userMsg);
      if (wx.getStorageSync("userinfo") && wx.getStorageSync("wx3rdSession")){
        this.globalData.logged=true;
        console.log("APP 已经登录");
      }else{
        this.globalData.logged = false;
        console.log("APP 还未登录");
      }
    },
    globalData: {
      userInfo: null
    }
})