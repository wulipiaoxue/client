var util = require('util.js');

/**
 * 检查银行卡号是否符合规则
 * @param bankno 银行卡号
 * @returns
 */
function checkBankNo(bankno) {
  var bankno = bankno.replace(/\s/g, '');
  if (bankno == "") {
    util.showTip("请填写银行卡号");
    return false;
  }
  if (bankno.length < 16 || bankno.length > 19) {
    util.showTip("银行卡号长度必须在16到19之间");
    return false;
  }
  var num = /^\d*$/;// 全数字
  if (!num.exec(bankno)) {
    util.showTip("银行卡号必须全为数字");
    return false;
  }
  // 开头两位
  var strBin = "10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99";
  if (strBin.indexOf(bankno.substring(0, 2)) == -1) {
    util.showTip("银行卡号开头两位不符合规范");
    return false;
  }
  // luhn校验
  if (!luhnCheck(bankno)) {
    return false;
  }
  return true;
}

/**
 * 银行卡号luhn校验算法
 * luhn校验规则：16位银行卡号（19位通用）:
 * 1.将未带校验位的 15（或18）位卡号从右依次编号 1 到 15（18），位于奇数位号上的数字乘以 2。
 * 2.将奇位乘积的个十位全部相加，再加上所有偶数位上的数字。
 * 3.将加法和加上校验位能被 10 整除。
 * @param bankno 银行卡号
 * @returns
 */
function luhnCheck(bankno) {
  var lastNum = bankno.substr(bankno.length - 1, 1);// 取出最后一位（与luhn进行比较）
  var first15Num = bankno.substr(0, bankno.length - 1);// 前15或18位
  var newArr = new Array();
  for (var i = first15Num.length - 1; i > -1; i--) { // 前15或18位倒序存进数组
    newArr.push(first15Num.substr(i, 1));
  }
  var arrJiShu = new Array(); // 奇数位*2的积 <9
  var arrJiShu2 = new Array(); // 奇数位*2的积 >9
  var arrOuShu = new Array(); // 偶数位数组
  for (var j = 0; j < newArr.length; j++) {
    if ((j + 1) % 2 == 1) {// 奇数位
      if (parseInt(newArr[j]) * 2 < 9) {
        arrJiShu.push(parseInt(newArr[j]) * 2);
      } else {
        arrJiShu2.push(parseInt(newArr[j]) * 2);
      }
    } else {
      arrOuShu.push(newArr[j]);// 偶数位
    }
  }

  var jishu_child1 = new Array();// 奇数位*2 >9 的分割之后的数组个位数
  var jishu_child2 = new Array();// 奇数位*2 >9 的分割之后的数组十位数
  for (var h = 0; h < arrJiShu2.length; h++) {
    jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
    jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
  }
  var sumJiShu = 0; // 奇数位*2 < 9 的数组之和
  var sumOuShu = 0; // 偶数位数组之和
  var sumJiShuChild1 = 0; // 奇数位*2 >9 的分割之后的数组个位数之和
  var sumJiShuChild2 = 0; // 奇数位*2 >9 的分割之后的数组十位数之和
  var sumTotal = 0;
  for (var m = 0; m < arrJiShu.length; m++) {
    sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
  }
  for (var n = 0; n < arrOuShu.length; n++) {
    sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
  }
  for (var p = 0; p < jishu_child1.length; p++) {
    sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
    sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
  }
  // 计算总和
  sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu)
    + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);
  // 计算luhn值
  var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
  var luhn = 10 - k;
  if (lastNum == luhn) {
    console.log("验证通过");
    return true;
  } else {
    util.showTip("银行卡号必须符合luhn校验");
    return false;
  }
}

module.exports = checkBankNo;