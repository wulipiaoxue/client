var qcloud = require('../../vendor/wafer2-client-sdk/index');
var config = require('../../config');
var util = require('../../utils/util.js');
var app = getApp();
var timer = null;
Page({
  data:{
    userInfo: {},
    logged: false, //此处初始为false
    takeSession: false,
    requestResult: '',
    formdefault:'',
    cmdConfig:'',
    tip: '请设置口令',
    show:false,
    balance:"0.00", //优先使用的余额
    account:"0.00", //账户余额
    btnTxt:"生成语音口令",
    paying:false,
  },
  onLoad:function(options){
    var that=this;
    this.config();
    /**
     * 通过全局来判断是否登录，避免每次进入时重复登录
     */
    if (app.globalData.logged){
      this.setData({
        userInfo: wx.getStorageSync("userinfo")
      })
      this.getData();
    }else{
      this.login();
    }
  },
  getData:function(){  //获取用户信息接口
    var that=this;
    wx.showLoading({
      title: '请稍后',
    })
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
        if(res.data.status=="1"){
          if (res.data.code == "CF0004") {
            qcloud.login({
              method: 'POST',
              success: that.getData,
            })
          } else {
            util.showModel("提示", res.data);
          }
        }else{
          that.setData({
            account: util.recNum(res.data.data.balance),
            balance: util.recNum(res.data.data.balance)
          })
          wx.hideLoading();
        }
      },
      fail: function (e) {
        util.showModel("失败",e);
      }
    })
  },
  config:function(){
    var that=this;
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
            cmdConfig: res.data.data.commond
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
  // 用户登录示例
  login: function () {
    if (this.data.logged) return

    wx.showLoading({
      title: '正在登录',
    })
    var that = this
    // 调用登录接口
    qcloud.login({
      method: 'POST',
      success(result) {
        console.log(result)
        if (result) {
          wx.hideLoading();
          that.setData({
            userInfo: wx.getStorageSync("userinfo")
          })
          app.globalData.logged = true;
          that.getData();
        } 
      },

      fail(error) {
        util.showModel('登录失败', error)
        console.log('登录失败', error)
      }
    })
  },

  /**
   * 用来打印用户信息,并保存用户信息
   */
  log:function(){
    for (var key in this.data.userInfo) {
      console.log("key =" + key+" value ="+this.data.userInfo[key]);
    }
    /**
    * 将用户信息保存到缓存里面
    */
    wx.setStorageSync("userinfo", this.data.userInfo);
    app.globalData.logged=true;
  },
  //页面处理函数
  commandFnc:function(e){
    var that=this;
    var command = e.detail.value;
    var rep = /^[\u4E00-\u9FA5]+$/;
    if (rep.test(command)){
      return
    }else{
      this.setData({
        tip: "请输入中文字符",
        show: true,
        command:""
      })
      clearTimeout(timer);
      function hideTip() {
        that.setData({
          show: false
        })
      }
      timer = setTimeout(function () {
        hideTip();
      }, 5000);
    }
  },
  moneyFnc:function(e){
    let that=this;
    let num = e.detail.value;
    num = num.replace(/[^\d.]/g, "").replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^[0.]/g, "").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    if (!!num) {
      that.setData({
        money: num
      })
      if (!this.repTest(num, this.data.num)){
        clearTimeout(timer);
        function hideTip(){
          that.setData({
            show: false
          })
        }
        timer = setTimeout(function () {
          hideTip();
        }, 5000);
      }
      if (num <= parseFloat(that.data.account)) {
        that.setData({
          btnTxt: "生成语音口令",
        })
      } else {
        that.setData({
          btnTxt: "还需支付" + (num - that.data.account).toFixed(2) + "元",
        })
      }
    } else {
      that.setData({
        btnTxt: "生成语音口令",
        money: "",
      })
    }
  }, 
  numFnc: function (e) {
    var that=this;
    let num = e.detail.value;
    num = num.replace(/[^\d]/g, "")
    num = Number(num);
    if (!!num) {
      that.setData({
        num: num
      })
      that.repTest(that.data.money, num);
      if (!that.repTest(that.data.money, num)) {
        clearTimeout(timer);
        function hideTip() {
          that.setData({
            show: false
          })
        }
        timer = setTimeout(function () {
          hideTip();
        }, 5000);
      }
    } else {
      that.setData({
        num: ""
      })
    }
  },
  repTest: function (money, num) {
    if (parseInt(money / num) < 1 || money < 1) {
      this.setData({
        tip: "每人获得的打赏不能低于1元",
        show: true
      })
      return false
    }
    if ( money>10000) {
      this.setData({
        tip: "打赏金额不能超过10000",
        show: true
      })
      return false
    }
    if (num > 10000) {
      this.setData({
        tip: "数量最多10000个",
        show: true
      })
      return false
    }
    this.setData({
      show: false
    })
    return true
  },
  transMoney:function(money){
    if (money.indexOf('.') < 0) {
      return money+".00"
    } else {
      if (money.split('.')[1].length == 1) {
        return money + "0"
      } else if (money.split('.')[1].length == 0){
        return money + "00"
      }
      return money 
    }
  },
  /**
   * 提交语音口令
   */
  formSubmit:function(e){
    var that =this;
    if(that.data.paying){
      return
    }else{
      that.setData({
        paying:true
      })
    }
    var rep = /^[\u4E00-\u9FA5]+$/;
    console.log(e.detail);
    if (!e.detail.value["command"]){
      e.detail.value["command"] = that.data.cmdConfig;
    }
    if (!rep.test(e.detail.value["command"])) {
      util.showTip('请输入中文字符')
      that.setData({
        paying: false
      })
      return
    }
    if (!e.detail.value["reward"]){
      util.showTip('请输入赏金金额')
      that.setData({
        paying: false
      })
      return
    }
    if (!e.detail.value["qty"]){
      util.showTip('请输入1-10000的数量')
      that.setData({
        paying: false
      })
      return
    }
    if (parseInt(that.data.money / that.data.num) < 1){
      util.showTip('每人获得的打赏不能低于1元')
      that.setData({
        paying: false
      })
      return
    }
    if (that.data.money>10000){
      util.showTip('打赏金额不能超过10000元')
      that.setData({
        paying: false
      })
      return
    }
    if (that.data.num > 10000) {
      util.showTip('数量最多10000个')
      that.setData({
        paying: false
      })
      return
    }
    // e.detail.value["open_id"] = this.data.userInfo.openId;
    // e.detail.value["commission"] = parseFloat(e.detail.value.reward)*0.02;
    console.log(e.detail.value);
    util.showBusy('请稍后');
    console.log(wx.getStorageSync("wx3rdSession"))
    wx.request({
      url: config.service.createVoiceComment,
      data:{
        "hmac":"",
        "params":{
          "wx3rdSession": wx.getStorageSync("wx3rdSession"),
          "commond": e.detail.value.command,
          "total": util.sendNum(e.detail.value.reward),
          "number": e.detail.value.qty,
        }
      },
      header: {
        'content-type': 'application/json;charset=utf-8',
        "x-requested-with":"XMLHttpRequest"
      },
      method:'POST',
      success:function(res){
        console.log(res);
        console.log(that.data.account)
        console.log(e.detail.value.reward)
        if(res.data.status == "0"){
          var id = res.data.data.folderid; //红包id
          wx.hideToast();
          if (res.data.data.needPay=="1"){
            var options = res.data.data
            wx.requestPayment({
              'timeStamp': options.timeStamp,
              'nonceStr': options.nonceStr,
              'package': options.package,
              'signType': 'MD5',
              'paySign': options.paySign,
              'success': function (res) {
                that.setData({
                  account:0.00,
                  command:"",
                  money:"",
                  num:"",
                  paying: false,
                  balance:0.00
                })
                wx.showLoading({
                  title: '请稍后',
                })
                wx.request({
                  url: config.service.notifyUrl,
                  data: {
                    "hmac": "",
                    "params": {
                      "msg": util.MD5(options.paySign+"redpacket2018"),
                      "id": id,
                      "wx3rdSession": wx.getStorageSync("wx3rdSession"),
                    },
                  },
                  method: "POST",
                  header: {
                    'content-type': 'application/json',
                    "x-requested-with": "XMLHttpRequest"
                  },
                  success: function (res) {
                    console.log(res);
                    wx.hideLoading();
                    //进去到红包分享页面
                    wx.navigateTo({
                      url: '/pages/share/share?avatar=' + that.data.userInfo.avatarUrl + '&command=' + e.detail.value.command + '&id=' + id,
                    })
                  }
                })
              },
              'fail': function (res) {
                that.setData({
                  paying: false
                })
                util.showModel('提示', res);
              }
            })
          }else{
            that.setData({
              paying: false,
              command: "",
              money: "",
              num: "",
              account: (that.data.account - e.detail.value.reward).toFixed(2),
              balance: (that.data.account - e.detail.value.reward).toFixed(2)
            })
            wx.navigateTo({
              url: '/pages/share/share?avatar=' + that.data.userInfo.avatarUrl + '&command=' + e.detail.value.command + '&id=' + id,
            })
          }
        }else{
          that.setData({
            paying: false
          })
          util.showModel("失败",res.data);
        }
      },
      fail:function(e){
        that.setData({
          paying: false
        })
        util.showModel("失败");
      }     
    })
  },

  
  // formReset: function () {
  //   console.log('form发生了reset事件')
  // },

  /**
   * 清除缓存
   */
  intoQuestion:function(){
    wx.navigateTo({
      url: '/pages/question/question',
    })
  },
  intoMyRecord:function(event){
    wx.navigateTo({
      url: '/pages/myrecords/myrecord',
    })
  },
  intoRemaining:function(event){
    wx.navigateTo({
      url: '/pages/remaining/remaining',
    })
  },
  submit_voice:function(event){
    wx.navigateTo({
      url: '/pages/redpacket/redpacket',
    })
  },
  // intoChtfund:function(){
  //   wx.navigateTo({
  //     url: '/pages/chtfund/chtfund',
  //   })
  // }
})