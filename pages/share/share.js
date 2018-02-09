var config = require('../../config');
var util = require('../../utils/util.js');
Page({
  data:{
    userInfo: {},
    packet_info: {},
    id:'',
  },
  onLoad:function(options){
    //拿到红包的id 发红的头像 和口令
    var id = options.id;
    this.data.id=id;
    var command = options.command ;
    var avatar = options.avatar;
    console.log("id=" + id + "  command=" + command + " avatar=" + avatar);
    this.setData({
      command: options.command,
      avatar: options.avatar,
      id: options.id
    })

    //添加用户信息
    this.setData({
      userInfo: wx.getStorageSync("userinfo")
    });
  },
  intoBack:function(){
    wx.navigateBack({
      delta: 1
    })
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target);
    }
    return {
      title: '恭喜发财，我们为您准备了礼物！',
      path: '/pages/redpacket/redpacket?id=' + this.data.id,
      success: function (res) {
        console.log("转发成功");
        util.showSuccess("转发成功");
      },
      fail: function (res) {
        console.log("转发失败")
      }
    }
  }
})