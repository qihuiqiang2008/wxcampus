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

var saveArticle = schedule.scheduleJob('55 23 * * *', function(){
    console.log('================定时任务[获取推送阅读量]开始执行================');
    SchoolEx.getSchoolExsByQueryAndField({}, 'en_name', {}, function (err, schoolexs) {
        if(schoolexs){
            schoolexs.forEach(function (school,index) {
                console.log("en_name:"+school.en_name)
                var data=JSON.stringify({"en_name":school.en_name})
                request.post(SAVE_ARTICLE_URL_DEV)
                    .set('Content-Type', 'application/json')
                    .send(data)
                    .end(function (err,res) {
                        if(err){
                            console.log(err);
                        }
                        //console.log(res)
                    })
            })
        }
    });
    console.log('================定时任务[获取推送阅读量]执行结束================');
});

exports.advertWarn=advertWarn;
exports.saveArticle=saveArticle;