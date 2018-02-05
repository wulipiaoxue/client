/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = 'https://redpacket.chtfund.com';
//var host = 'http://172.16.191.178:3000';
// var host = 'https://441649268.rundong.xyz'; //production

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/apis/redpacket/user/login.action`,
        //上传用户信息接口
        userMsg: `${host}/apis/redpacket/user/setInformation.action`,
        // 上传图片接口
        uploadUrl: `${host}/apis/common/file/upload.action`,

        //生成语音口令
        createVoiceComment: `${host}/apis/redpacket/redpacket/createRedPackets.action`,

        //获取语音口令详情
        getVoiceDetail: `${host}/apis/redpacket/redpacket/getFolderInfo.action`,

        //发出的红包记录
        getMyRecord: `${host}/apis/redpacket/user/getCreateList.action`,

        //语音上传
        receiveUrl: `${host}/apis/redpacket/common/uploadVoice.action`,

        //语音识别
        getGrabUrl: `${host}/apis/redpacket/redpacket/grabRedPackets.action`,

        //语音下载
        voiceUrl: `${host}/apis/redpacket/common/downloadVoice.action`,

        //获取用户信息
        userinfoUrl: `${host}/apis/redpacket/user/getInformation.action`,

        //付款状态
        notifyUrl: `${host}/apis/redpacket/redpacket/notify.action`,

        //抢到的红包记录
        grabUrl: `${host}/apis/redpacket/user/getGrabList.action`,

        //我的余额提现
        cashUrl: `${host}/apis/redpacket/user/drawCash.action`,

        //获取语音口令
        commandUrl: `${host}/apis/redpacket/redpacket/getFolderCommondList.action`,
    }
};

module.exports = config;
