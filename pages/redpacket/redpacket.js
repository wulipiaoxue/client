var commentData = require("../../data/data.js");
var config = require('../../config');
var util = require('../../utils/util.js');
var qcloud = require('../../vendor/wafer2-client-sdk/index');
var app = getApp();

const dateformat = require('../../utils/dateformat');

// 处理录音逻辑
const recorderManager = wx.getRecorderManager();
const innerAudioContext = wx.createInnerAudioContext();

// 是否有文件正在播放
let isPlayingVoice = false;
// 正在播放的文件索引
let playingVoiceIndex = 0;
Page({
  data: {
    userInfo: {},
    detail_info: {},
    packet_id: '',
    isPlayidx:null,
    introTxt:"",
    isBegin:false,
    flag:false,  //判断是否当前可以录音
    select:wx.getStorageSync("select") || false,
    none:false,     //红包已抢完
    state:null, //红包状态
    grab: false,  //可否抢的条件之一
    hasney:true,  //是否已抢过
    error:false, // 口令是否正确
  },
  onLoad: function (options) {
    //将该红包id保存在data里面
    this.setData({
      packet_id: options.id ||3
    });
    /**
     * 判断用户是否登录，避免在从红包转发入口进入时，领取红包缺少此用户的登录信息openid等
     */
    if (app.globalData.logged) {
      //添加用户信息
      this.setData({
        userInfo: wx.getStorageSync("userinfo")
      });
      //获取数据
      this.getData(options.id);
    } else {
      //未登录
      this.login(options.id);
    }
  },
  login:function(id){
    if (this.data.logged) return
    wx.showLoading({
      title: '正在登录',
    })
    var that = this
    qcloud.login({
      method: 'POST',
      success(result) {
        console.log(result)
        if (result) {
          that.setData({
            userInfo: wx.getStorageSync("userinfo")
          })
          app.globalData.logged = true;
          that.getData();
        } 
      },

      fail(error) {
        util.showModel('登录失败', error)
      }
    })
  },
  getData: function () {
    var that = this;
    console.log(wx.getStorageSync("wx3rdSession"))
    wx.showLoading({
      title: '请稍后',
    })
    wx.request({
      url: config.service.getVoiceDetail,
      data: {
        hmac:"",
        params:{
          "id": that.data.packet_id,
          "wx3rdSession": wx.getStorageSync("wx3rdSession"), 
        }
      },
      method: 'POST',
      header: {
        "x-requested-with": "XMLHttpRequest",
      },
      success: function (res) {
        console.log(res);
        var foldObject=res.data.data;
        if (res.data.status == "1") {
          if (res.data.code == "CF0004"){
            qcloud.login({
              method: 'POST',
              success: that.getData,
            })
          }else{
            wx.hideLoading();
            util.showModel("获取信息失败",res.data);
          }
        }else{
          //绑定数据
          if (foldObject.list && foldObject.list.length != 0) {
            for (var i = 0; i < foldObject.list.length; i++) {
              foldObject.list[i].duration = foldObject.list[i].passCommond.split("_")[0].substr(11);
            }
          }
          foldObject.amount = (foldObject.amount / 100).toFixed(2);
          foldObject.amountLeft = (foldObject.amountLeft / 100).toFixed(2);
          that.setData({
            detail_info: foldObject,
            state: foldObject.state
          })
          wx.request({
            url: config.service.grabUrl,
            data: {
              hmac: "",
              params: {
                "folderid": that.data.packet_id,
                curPage: "1",// 当前页码 
                pageSize: "2",//每页显示条数    
                "wx3rdSession": wx.getStorageSync("wx3rdSession"),
              }
            },
            method: 'POST',
            header: {
              "x-requested-with": "XMLHttpRequest",
            },
            success: function (res) {
              console.log(res);
              wx.hideLoading();
              if (res.data.status == "1") {
                util.showModel("获取个人抢取信息失败", res.data);
              } else {
                if (res.data.data.pageList && res.data.data.pageList.length != 0) {
                  that.setData({
                    introTxt: util.recNum(res.data.data.pageList[0].amount),
                    hasney: true,
                  })
                }else{
                  that.setData({
                    hasney: false,
                  })
                  if (foldObject.numberLeft == "0") { //红包已经领完了
                    that.setData({
                      none: true,
                    })
                  }else{
                    that.setData({
                      grab: true,
                    })
                  }
                }
              }
            },
            fail: function () {
              util.showModel("服务器错误", res.data);
            }
          })
        }
      },
      fail: function () {
        wx.hideLoading();
        console.log("redpacket fail");
      }
    });
  },

  ToShare: function (event) {
    var avatar = this.data.detail_info.ownerAvatarUrl;
    //var name = this.detail_info.packet.user_info.nickName;
    var command = this.data.detail_info.commond;
    var id = this.data.detail_info.folderId;
    wx.navigateTo({
      url: '/pages/share/share?avatar=' + avatar + '&command=' + command + '&id=' + id,
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '恭喜发财，我们为您准备了礼物！',
      path: '/pages/redpacket/redpacket?id=' + this.data.packet_id,
      success: function (res) {
        for (var key in res.shareTickets) {
          console.log("key =" + key + "  value =" + res.shareTickets[key])
        }
        util.showSuccess("转发成功");
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


  /**
   * 用来打印用户信息,并保存用户信息
   */
  // log: function (id) {
  //   for (var key in this.data.userInfo) {
  //     //console.log("key =" + key + " value =" + this.data.userInfo[key]);
  //   }
  //   /**
  //   * 将用户信息保存到缓存里面
  //   */
  //   wx.setStorageSync("userinfo", this.data.userInfo);

  //   /**
  //  * 当从转发红包处进来是，先登录，获取用户信息，再开始获取此页面的信息
  //  * 当前方法则为 获取此页面的信息
  //  */
  //   app.globalData.logged = true;
  //   this.getData(id);
  // },

  /**
   * 再去发红包
   */
  distributeRedPacket: function (event) {
    wx: wx.reLaunch({
      url: '/pages/home/home',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },



  playVoice(e) {
    const path = e.currentTarget.dataset.voicepath;
    const idx = e.currentTarget.dataset.voiceidx;
    /**
     * 如果有文件正在播放
     * 则停止正在播放的文件
     */
    if (isPlayingVoice) {
        innerAudioContext.stop();
        isPlayingVoice = false;
    }
    if (this.data.isPlayidx === idx) {
      this.setData({
        isPlayidx: null,
      })
    } else {
      this.setData({
        isPlayidx: idx,
      })
    }
    isPlayingVoice = true;
    playingVoiceIndex = idx;
    console.log(path);
    innerAudioContext.src = path;
    innerAudioContext.play();
    innerAudioContext.onEnded(()=>{
      console.log("1111111111")
      this.setData({isPlayidx: null});
      playingVoiceIndex = '';
      isPlayingVoice = false;
    })
  },
  voiceStartRecord(e) {
    var that=this;
    if ((that.data.state == "2") && that.data.grab) {
      //console.log('start record');
      if (that.data.flag) {
        return
      } else {
        that.setData({
          flag: true
        })
      }
      that.setData({
        isBegin: true
      })
      recorderManager.start({
        // 最大长度设置为 2 分钟
        duration: 30 * 1000,
        // 格式
        format: 'mp3',
        sampleRate: 16000,
        encodeBitRate: 96000,
        frameSize: 9,
        numberOfChannels: 1
      });
    } else {
      return
    }
  },
  voiceEndRecord(e) {
    console.log(e);
    this.setData({
      isBegin: false
    })
    recorderManager.stop();
    recorderManager.onStop(this.onVoiceStop);
  },

  onVoiceStop(voiceInfo) {
    var that=this;
    const { duration, tempFilePath } = voiceInfo;
    // 不允许小于 1 秒
    if (duration < 1000) {
      util.showModel('提示','录音过短');
      this.setData({
        flag: false
      })
      return;
    }
    wx.showLoading({
      title: '正在识别',
    })
    // 保存文件
    wx.saveFile({
      tempFilePath,
      success: fileInfo => {
        const { savedFilePath } = fileInfo;
        var durations = (duration / 1000).toFixed(0)
        this.recognizeVoice(durations,savedFilePath);
      },
      fail() {
        wx.hideLoading();
        that.setData({
          flag: false
        })
        util.showModel('错误', '保存语音失败');
      }
    });
  },
  /**
   * 调用音频识别接口
   * @params {string} key 音频名称
   * @params {string} key 本地地址
   */
  recognizeVoice(duration,path) {
    var that = this;
    wx.uploadFile({
      url: config.service.receiveUrl,
      filePath: path,
      name: 'file',
      formData: {
        "wx3rdSession": wx.getStorageSync("wx3rdSession"),
        "duration": duration
      },
      header: {
        'content-type': 'multipart/form-data',
      },
      success: res => {
        let data = res.data;
        console.log(data);
        if (typeof data === 'string') {
          data = JSON.parse(data);
          // res = JSON.parse(res.data)
        }
        //console.log(data);
        if (data.status != "0") {
          console.error(data);
          wx.hideLoading();
          that.setData({
            flag: false
          })
          util.showModel('语音上传失败', data.data.message);
          return;
        } else {
          wx.request({
            url: config.service.getGrabUrl,
            data:{
              hmac:"",
              params:{
                commondUrl: data.data.fileName,
                folderid: that.data.packet_id,
                lan:that.data.select?'ct':'zh',
                "wx3rdSession": wx.getStorageSync("wx3rdSession")
              }
            },
            method: 'POST',
            header: {
              "x-requested-with": "XMLHttpRequest"
            },
            success:function(res){
              console.log(res)
              if(res.data.status == "0"){
                wx.hideLoading();
                util.showTip('领取成功');
                that.setData({
                  flag: false
                })
                that.setData({
                  grab:false
                })
                that.getData();   //刷新数据
              }else{
                wx.hideLoading();
                that.setData({
                  flag: false
                })
                that.setData({
                  error:true
                })
                setTimeout(function(){
                  that.setData({
                    error: false
                  })
                },2000)              
              }
            }
          })
        }
      },
      fail: function (e) {
        console.error(e);
        wx.hideLoading();
        util.showModel('语音识别失败', e);
      }
    });
  },
  inCash(event) {
    wx.navigateTo({
      url: '/pages/oldremain/remaining',
    })
  },
  replace:function(){
    wx.setStorageSync("select", !this.data.select);
    this.setData({
      select:!this.data.select
    })
  }
})