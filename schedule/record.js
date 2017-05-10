/**
 * Created by yiweiguo on 2017/3/26.
 */
var schedule = require("node-schedule");
var ArticleInfo = require('../proxy').ArticleInfo;
var SchoolEx = require('../proxy').SchoolEx;
async = require('async');
var login = require(__dirname + '/../wx_helpers/login');
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

var saveArticle = schedule.scheduleJob('00 18 * * *', function(){
    console.log('================定时任务[获取推送阅读量]开始执行================');
    SchoolEx.getSchoolExsByQueryAndField({}, 'en_name', {'limit':10}, function (err, schoolexs) {
        if(err){
            console.log(err);
        }
        console.log("length:"+schoolexs.length)
        if(schoolexs){
            async.eachSeries(schoolexs,
                function (school, callback) {
                    school_en_name=school.en_name;
                    console.log("en_name:"+school.en_name)
                    async.series([
                            function (cb) {
                                console.log("===========1==========")
                                SchoolEx.getSchoolByEname(school_en_name, function (err, school) {
                                    schoolEx = school;
                                    cb(err);
                                })
                            },

                            function (cb) { //1.1：登陆。
                                console.log("===========2==========")
                                try {
                                    login(schoolEx, function (err, results) {
                                        if(err){
                                            console.log(school_en_name+"登录失败");
                                            cb(err);
                                        }
                                        loadResult = results;
                                        console.log(school_en_name+"登录成功");
                                        cb();
                                    });
                                }
                                catch (e){
                                    console.log(e);
                                }


                            },

                            function (cb) {
                                console.log("===========3==========")
                                request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN')
                                    .set('Cookie', loadResult.cookie)
                                    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                    .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                    .end(function (res) {
                                        console.log("res:"+res.text)
                                        var start = res.text.indexOf("window.wx =")
                                        var end = res.text.indexOf("path:")

                                        var indexHead = res.text.indexOf('wx.cgiData =');
                                        indexHead = res.text.indexOf('list :', indexHead);
                                        var indexTail = res.text.indexOf('.msg_item', indexHead);
                                        var html = res.text.slice(indexHead + 'list :'.length, indexTail).trim();
                                        html = html.slice(1, -1);
                                        try{
                                            list = JSON.parse(html)
                                            cb();
                                        }
                                        catch (err){

                                            console.log(school_en_name+"html解析错误")
                                            cb(err);
                                        }

                                    });

                            },
                            function (cb) {
                                console.log("===========4==========")
                                var start = new Date().setHours(0, 0, 0, 0);
                                var end = new Date().setHours(23, 59, 59, 0);
                                console.log(school_en_name+'===================开始保存文章信息===================')
                                for (var i = 0; i < list.msg_item.length; i++) {
                                    for (var j = 0; j < list.msg_item[i].multi_item.length; j++) {
                                        console.log("update:" + list.msg_item[i].multi_item[j].title);
                                        var url = escape2Html(list.msg_item[i].multi_item[j].content_url);
                                        var type = getArticleType(list.msg_item[i].multi_item[j].title);
                                        ArticleInfo.saveOrUpdate(url, new Date(list.msg_item[i].date_time * 1000),
                                            list.msg_item[i].multi_item[j].seq, type, school_en_name, schoolEx.cn_name, schoolEx.fans,
                                            list.msg_item[i].multi_item[j].title,list.msg_item[i].multi_item[j].digest, list.msg_item[i].multi_item[j].cover,list.msg_item[i].multi_item[j].read_num,
                                            list.msg_item[i].multi_item[j].like_num,
                                            function (err) {
                                                if (err) {
                                                    console.log(err);
                                                }

                                            });
                                    }
                                }
                                console.log("===========================end==========================")
                                cb();
                                callback();
                            }
                        ],
                        function (err) {
                            if(err){
                                console.log('保存文章信息失败'+err)
                                callback();
                                //return res.json({success: false});
                            }
                        }
                    );
                },
                function (err) {
                    console.log("================统计结束================" );
                    proxy.emit('amounts', amounts);
                    //cb();
                });
        }
    });
    console.log('================定时任务[获取推送阅读量]执行结束================');
});

exports.advertWarn=advertWarn;
exports.saveArticle=saveArticle;