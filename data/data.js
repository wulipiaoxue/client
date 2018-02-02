var question_database=[
    {
      pos:0,
      title:"语音口令怎么玩？",
      detail:"通过语音识别技术开发的说口令娱乐工具，在发口令时可以设置领取奖励的语音口令，好友说对口令才能领到奖励"
    },
    {
      pos: 0,
      title: "我支付了但是没有发出去",
      detail: "请在主页的【我的记录】中找到相应记录，点击进入详情页后点击【去转发】可把口令转发给好友或朋友圈"
    },
    {
      pos: 0,
      title: "好友可以转发我的口令吗",
      detail: "可以的，您分享给好友或者转发到微信群的语音口令，其他好友均可再次转发"
    },
    {
      pos: 0,
      title: "发口令会收取服务费吗",
      detail: "发口令不会收取服务费"
    }, {
      pos: 0,
      title: "未领取的金额怎样处理",
      detail: "未领取的金额将于24小时后退至您的小程序余额"
    },
     {
      pos: 0,
      title: "如何提现到微信钱包",
      detail: "在主页的【余额提现】或详情页的【去提现】均可跳转至余额提现页面进行提现，提现金额每次至少2元，每天最多提现3次"
    },
     {
       pos: 0,
       title: "提现会收取服务费吗？多久到账",
       detail: "收取提现金额的1%作为服务费（四舍五入）；申请提现后会在1-5个工作日内转账到您的微信钱包"
     }

]
var comment_database=[
  {
    name:'我会放光啊',
    time:"8''",
    price:'1.00元',
    date:'12月24日 17：02'

  },
  {
    name: 'kizi',
    time: "7''",
    price: '2.00元',
    date: '12月24日 17：02'

  },
  {
    name: 'lijun',
    time: "6''",
    price: '6.00元',
    date: '12月24日 17：02'

  },
  {
    name: 'whj',
    time: "8''",
    price: '5.00元',
    date: '12月24日 17：02'

  },
  {
    name: 'cml',
    time: "8''",
    price: '4.00元',
    date: '12月24日 17：02'

  }

]

var hbpeo_database={
  nickname:"只若初见",
  avatarUrl:"https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKOErtaV5Apen4VPicibbGmGjn94X1CznWhUOTzK56S39ibaBpicybGHDoY23JTNibLRRcoFLkyTu4CKGg/5",
  command:"黑化肥发灰会挥发",
  reward:5,
  restReward:2,
  packetNum:5,
  restPacketNum:2,
}
module.exports = {
  questionList: question_database,
  commentList: comment_database,
  hbpeoList: hbpeo_database
}