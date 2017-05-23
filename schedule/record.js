/**
 * Created by yiweiguo on 2017/3/26.
 */
var schedule = require("node-schedule");
var ArticleInfo = require('../proxy').ArticleInfo;
var SchoolEx = require('../proxy').SchoolEx;
var request = require("superagent");
const SAVE_ARTICLE_URL="http://wx.welife001.com/back/record/saveArticle"
const SAVE_ARTICLE_URL_DEV="http://localhost:8080/back/record/saveArticle"

/**定时任务统计广告阅读量 推送预警短信**/
var advertWarn = schedule.scheduleJob('10 7 * * *', function(){
    var today=new Date();
    var yesterday=new Date();
    console.log('================定时任务[统计广告阅读量，并推送预警短信]开始执行================：'+today);
    yesterday.setDate(today.getDate()-1);
    ArticleInfo.getAdvertByData(yesterday,function (err,datasets) {
       if(err){
           console.log(err);
       }
       else {
           console.log('================定时任务[统计广告阅读量，并推送预警短信]执行结束================');
       }
    });
});

var saveArticle = schedule.scheduleJob('43 00 * * *', function(){
    console.log('================定时任务[获取推送阅读量]开始执行================');
    
    console.log('================定时任务[获取推送阅读量]执行结束================');
});

exports.advertWarn=advertWarn;
exports.saveArticle=saveArticle;