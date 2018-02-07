var config = require('../../config');
var util = require('../../utils/util.js');
var checkBankNo = require('../../utils/bankcard.js');
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
    array: ["中国工商银行", "中国农业银行", "中国银行", "中国建设银行", "招商银行", "中国邮政储蓄银行", "中国交通银行", "浦发银行", "中国民生银行", "兴业银行", "平安银行", "中信银行", "华夏银行", "广发银行", "光大银行", "北京银行", "宁波银行"],
    bankName:"",
    bankfate:"0.00",
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
        })
      } else if (parseFloat(num) > that.data.balance){
        that.setData({
          tipTxt: "提现金额不能大于余额",
        })
      } else{
        if (parseFloat(num) > 1000 && parseFloat(num) < 25000){
          that.setData({
            tipTxt: "",
            fate: (parseFloat(num) / that.data.rateAfter).toFixed(2),
            bankfate: (parseFloat(num) / 1000).toFixed(2),
            getMoney: (parseFloat(num) - (parseFloat(num) / that.data.rateAfter).toFixed(2) - (parseFloat(num) / 1000).toFixed(2)).toFixed(2),
            money: num,
          })
        } else if (parseFloat(num) <= 1000){
          that.setData({
            tipTxt: "",
            fate: (parseFloat(num) / that.data.rateAfter).toFixed(2),
            bankfate: "1.00",
            getMoney: (parseFloat(num) - (parseFloat(num) / that.data.rateAfter).toFixed(2) - 1).toFixed(2),
            money: num,
          })
        } else if (parseFloat(num) >= 25000){
          that.setData({
            tipTxt: "",
            fate: (parseFloat(num) / that.data.rateAfter).toFixed(2),
            bankfate: "25.00",
            getMoney: (parseFloat(num) - (parseFloat(num) / that.data.rateAfter).toFixed(2) - 25).toFixed(2),
            money: num,
          })
        }
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
        bankfate:"0.00",
        getMoney:"0.00",
        money:"",
      })
    }
  },
  formSubmit:function(e){
    var that=this;
    console.log(e);
    if (!that.data.money){
      util.showTip('请输入提现金额');
      return
    }
    if (parseFloat(that.data.money) < 2) {
      util.showTip('每次提现不少于2元');
      return
    } else if (parseFloat(that.data.money) > that.data.balance) {
      util.showTip('提现金额不能大于余额');
      return
    }
    if(!e.detail.value['bank']){
      util.showTip('请选择所属银行');
      return
    }
    if (!checkBankNo(e.detail.value['bankNo'])){
      return
    }
    if (!e.detail.value['username']){
      util.showTip('请输入银行卡对应户名');
      return
    }
    if (!e.detail.value['phone']) {
      util.showTip('请输入11位手机号码');
      return
    }
    if (e.detail.value['phone'].length<11) {
      util.showTip('请输入正确的手机号码');
      return
    }
    wx.showModal({
      title: '提示',
      content: '请确认填写信息准确？',
      showCancel:false,
      cancelText:'返回核实',
      confirmText:'确认提现',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          //todo,发起提现申请，发送参数
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  // all:function(){
  //   var that=this;
  //   var balance = parseFloat(that.data.balance)
  //   if (balance>2){
  //     that.setData({
  //       money: balance,
  //       fate: (balance / that.data.rateAfter).toFixed(2),
  //       getMoney: (balance - (balance / that.data.rateAfter).toFixed(2)).toFixed(2),
  //       disabled:false
  //     })
  //   }else{
  //     util.showTip("每次提现不少于2元");
  //     that.setData({
  //       disabled: true
  //     })
  //     return
  //   }
  // },
  bindPickerChange:function(e){
    this.setData({
      bankName:this.data.array[e.detail.value]
    })
  },
  sendCmd:function(){
    var that=this;
    if(that.data.disabled){
      return
    }else{
      wx.navigateTo({
        url: '/pages/mytip/mytip',
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
  // onShareAppMessage: function (res) {
  //   if (res.from === 'button') {
  //     console.log(res.target);
  //   }
  //   return {
  //     title: '这是转发红包,有本事别打开',
  //     path: '/pages/redpacket/redpacket?id=' + this.data.id,
  //     success: function (res) {
  //       console.log("转发成功");
  //       for (var key in res.shareTickets) {
  //         console.log("key =" + key + "  value =" + res.shareTickets[key])
  //       }
  //       util.showSuccess("转发成功");
  //     },
  //     fail: function (res) {
  //       console.log("转发失败")
  //     }
  //   }
  // },
  question:function(){
    wx.navigateTo({
      url: "/pages/question/question",
    })
  },
  // intoChtfund:function(){
  //   wx.navigateTo({
  //     url: '/pages/chtfund/chtfund',
  //   })
  // }
})