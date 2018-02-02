var questionsData = require("../../data/data.js");
Page({
  data:{
    currentPos:-1
  },
  onLoad:function(options){
    this.setData({
      questions: questionsData.questionList
    })
  },

  questionsTap:function(event){
    var pos = event.currentTarget.dataset.id;
    var curpos;
    console.log(this.data.currentPos);
    //如果点击原有的，自己缩回去
    if (pos === this.data.currentPos){
      console.log("shou");
      curpos=-1;
    }else{
      console.log("bushuo");
      curpos=pos;
    }
    console.log("pos ="+pos);
    this.setData({
      currentPos: curpos
    })
  }
})