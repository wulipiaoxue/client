var config = require('../../config');
var util = require('../../utils/util.js');
Page({
  data:{
    currentTab:0,
    userIcon:'',
    mySendData:{},
    myGetData: {},
    userInfo:{},
  },
  onLoad: function (options) {
    console.log("Windowheight:=" + wx.getSystemInfoSync().windowHeight);
    console.log("Screenheight:=" + wx.getSystemInfoSync().screenHeight)
    var swiperH = wx.getSystemInfoSync().windowHeight -44;
    this.setData({
      swiperHeight: swiperH
    });

    /**
     * 从缓存中获取用户信息
     */
    console.log("icon =" + wx.getStorageSync("userinfo").avatarUrl);
    this.setData({
      userInfo: wx.getStorageSync("userinfo")
    });
    console.log("userinfo ：");
    console.log(this.data.userInfo);

    /**
     * 调用接口获取数据
     */
    this.getData();


  },

  getData:function(){
    var that = this;
    wx.showLoading({
      title: '请稍后',
    })
    console.log(wx.getStorageSync("wx3rdSession"));
    wx.request({
      url: config.service.getMyRecord,
      data:{
        hmac:"",
        params:{
          "wx3rdSession": wx.getStorageSync("wx3rdSession"),
          curPage: "1",// 当前页码 
          pageSize: "99999"//每页显示条数   
        }
      },
      method:'POST',
      header: {
        "x-requested-with": "XMLHttpRequest"
      },
      success:function(res){
        console.log(res.data.data);
        wx.hideLoading();
        var totalMoney=0;
        if(res.data.status == "0"){ //成功
          if (res.data.data.pageList && res.data.data.pageList.length!=0){
            for (var i=0; i < res.data.data.pageList.length;i++){
              totalMoney += parseFloat(res.data.data.pageList[i].amountYuan)
            }
          }
          res.data.data.pageItems.totalMoney = totalMoney.toFixed(2);
          that.setData({
            mySendData: res.data.data
          })
        }else{//失败
          util.showModel('提示',res.data)
        }
      },
      fail:function(res){
        console.log("获取我的记录数据失败");
        console.log(res)
      }
    })
    wx.request({
      url: config.service.grabUrl,
      data: {
        hmac: "",
        params: {
          "wx3rdSession": wx.getStorageSync("wx3rdSession"),
          curPage: "1",// 当前页码 
          pageSize: "99999"//每页显示条数   
        }
      },
      method: 'POST',
      header: {
        "x-requested-with": "XMLHttpRequest"
      },
      success: function (res) {
        console.log(res.data.data);
        var totalMoney = 0;
        if (res.data.status == "0") { //成功
          if (res.data.data.pageList && res.data.data.pageList.length != 0) {
            for (var i = 0; i < res.data.data.pageList.length; i++) {
              totalMoney += parseFloat(res.data.data.pageList[i].amountYuan)
            }
          }
          res.data.data.pageItems.totalMoney = totalMoney.toFixed(2);
          that.setData({
            myGetData: res.data.data
          })
        } else {//失败
          util.showModel('提示', res.data)
        }
      },
      fail: function () {
        console.log("获取我的记录数据失败");
      }
    })
  },




  bindChange:function(event){
    console.log("currentTAB =" + event.detail.current);
    this.setData({
      currentTab:event.detail.current
    });
  },
  onSendCurrent:function(event){
    var pos = event.currentTarget.dataset.pos;
    this.setData({
      currentTab: pos
    });
  },
  intoRedPacket:function(event){
    var id = event.currentTarget.dataset.id;
    wx.redirectTo({
      url: '/pages/redpacket/redpacket?id='+id,
    });
  },
  question:function(){
    wx.navigateTo({
      url: '/pages/question/question',
    })
  },
  intoQuestion: function () {
    wx.navigateTo({
      url: '/pages/question/question',
    })
  },
  intoHome: function (event) {
    wx.reLaunch({
      url: '/pages/home/home',
    })
  },
  intoRemaining: function (event) {
    wx.redirectTo({
      url: '/pages/oldremain/remaining',
    })
  }
})