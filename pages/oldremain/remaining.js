var config = require('../../config');
var util = require('../../utils/util.js');
var timer = null;
Page({
  data: {
    balance:"0.00",
    fate:"0.00",
    getMoney:"0.00",
    tipTxt:"",
    money:"",
    isbegin:false,
    rateAfter:false, //费率
    disabled:true,
    showPage:false
  },
  onLoad: function (options) {
    var that=this;
    wx.showLoading({
      title: '请稍后',
    })
    this.getData();
    wx.request({
      url: config.service.commandUrl,
      data: {
        hmac: "",
        params: {
        }
      },
      method: 'POST',
      header: {
        "x-requested-with": "XMLHttpRequest"
      },
      success: function (res) {
        if (res.data.status == "0") {
          that.setData({
            rateAfter: (res.data.data.rateAfter*100).toFixed(0) 
          })
        } else {
          util.showModel('提示', res.data);
        }
      }
    })
    wx.request({
      url: 'https://wap.chtfund.com/apis/wap/index/banners/findBannerByPosition.action',
      data: {
        hmac: '',
        params: {
          adPosition: "wxCreateFolderBanner",
          limitCount: 1
        }
      },
      method: 'POST',
      header: {
        "x-requested-with": "XMLHttpRequest"
      },
      success: function (res) {
        if (res.data.status == "0") {
          that.setData({
            imgUrl: res.data.data[0].imgUrl
          })
        } else {
          util.showModel('提示', res.data);
        }
      }
    })
  },
  getData:function(){
    var that=this;
    wx.request({
      url: config.service.userinfoUrl,
      data: {
        "hmac": "",
        "params": {
          "wx3rdSession": wx.getStorageSync("wx3rdSession"),
        }
      },
      method: 'POST',
      header: {
        'content-type': 'application/json',
        "x-requested-with": "XMLHttpRequest"
      },
      success: function (res) {
        console.log(res);
        wx.hideLoading();
        that.setData({
          balance: util.recNum(res.data.data.balance)
        })
      },
      fail: function (e) {
        console.log(e)
        util.showModel("失败",e);
      }
    })
  },
  meyInput:function(e){
    var that=this;
    let num=e.detail.value;
    num = num.replace(/[^\d.]/g, "").replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^[0.]/g, "").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    if(!!num){
      if (parseFloat(num) < 2) {
        that.setData({
          tipTxt: "每次提现不少于2元",
          money: num,
          disabled: true
        })
      } else if (parseFloat(num) > that.data.balance){
        that.setData({
          tipTxt: "提现金额不能大于余额",
          disabled: true
        })
      } else{
        that.setData({
          tipTxt: "",
          fate: (parseFloat(num) / that.data.rateAfter).toFixed(2),
          getMoney: (parseFloat(num) - (parseFloat(num) / that.data.rateAfter).toFixed(2)).toFixed(2),
          money:num,
          disabled:false
        })
      }
      clearTimeout(timer);
      function hideTip() {
        that.setData({
          tipTxt: ""
        })
      }
      timer = setTimeout(function () {
        hideTip();
      }, 5000);
    }else{
      that.setData({
        fate: "0.00",
        getMoney:"0.00",
        money:"",
        disabled: true
      })
    }
  },
  all:function(){
    var that=this;
    var balance = parseFloat(that.data.balance)
    if (balance>2){
      that.setData({
        money: balance,
        fate: (balance / that.data.rateAfter).toFixed(2),
        getMoney: (balance - (balance / that.data.rateAfter).toFixed(2)).toFixed(2),
        disabled:false
      })
    }else{
      util.showTip("每次提现不少于2元");
      that.setData({
        disabled: true
      })
      return
    }
  },
  sendCmd:function(){
    var that=this;
    if(that.data.disabled){
      return
    }else{
      that.setData({
        showPage:true
      })
    }
    // wx.showLoading({
    //   title: '请稍后',
    // })
    // if (that.data.isBegin) {
    //   return
    // } else {
    //   that.setData({
    //     isBegin: true
    //   })
    // }
    // wx.request({
    //   url: config.service.cashUrl,
    //   data:{
    //     "hmac": "",
    //     "params": {
    //       "wx3rdSession": wx.getStorageSync("wx3rdSession"),
    //       amount: util.sendNum(money)
    //     }
    //   },
    //   method: 'POST',
    //   header: {
    //     'content-type': 'application/json',
    //     "x-requested-with": "XMLHttpRequest"
    //   },
    //   success:function(res){
    //     if(res.data.status == "0"){
    //       wx.hideLoading();
    //       that.setData({
    //         balance: (that.data.balance-that.data.money).toFixed(2),
    //         money:"",
    //         isBegin:false
    //       })
    //       wx.navigateTo({
    //         url: '/pages/mytip/mytip',
    //       })
    //     }else{
    //       that.setData({
    //         isBegin: false
    //       })
    //       wx.hideLoading();
    //       util.showModel("提示", "服务器忙，请稍后再试");
    //     }
    //   }
    //})
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target);
    }
    return {
      title: '这是转发红包,有本事别打开',
      path: '/pages/redpacket/redpacket?id=' + this.data.id,
      success: function (res) {
        console.log("转发成功");
        for (var key in res.shareTickets) {
          console.log("key =" + key + "  value =" + res.shareTickets[key])
        }
        util.showSuccess("转发成功");
      },
      fail: function (res) {
        console.log("转发失败")
      }
    }
  },
  intoQuestion: function () {
    wx.navigateTo({
      url: '/pages/question/question',
    })
  },
  intoMyRecord: function (event) {
    wx.redirectTo({
      url: '/pages/myrecords/myrecord',
    })
  },
  intoHome: function (event) {
    wx.reLaunch({
      url: '/pages/home/home',
    })
  },
  intoHome:function(){
    wx.redirectTo({
      url: '/pages/home/home',
    })
  },
  intoBack:function(){
    this.setData({
      showPage: false
    })
  },
  // intoChtfund:function(){
  //   wx.navigateTo({
  //     url: '/pages/chtfund/chtfund',
  //   })
  // }
})