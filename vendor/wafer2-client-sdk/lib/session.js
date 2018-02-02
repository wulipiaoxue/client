var constants = require('./constants');

var Session = {
    get: function (key) {
        return wx.getStorageSync(key) || null;
    },

    set: function (key,session) {
        wx.setStorageSync(key, session);
    },

    clear: function () {
        wx.removeStorageSync();
    },
};

module.exports = Session;