/**
 * Created by wanghan on 2014/8/31.
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var async = require('async');
var fs = require('fs');
var logger = require('./../logs/log');
exports.getMessage = function (req, res, next) {
    var user = req.query.user;
    var number = req.query.number;
    var day = req.query.day;
    var loadResult;
    var latest_msg_id;
    var total_count;
    var count = 20;
    var school_enname= req.params.en_name;
    var offset = 0;
    var list;
    var schoolEx;

    async.series([
        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                schoolEx = school;
                //   console.log(schoolEx)
                cb();
            })
        },

        function(cb) {//1.1：登陆。
            login(schoolEx, function(err, results){
                loadResult = results;
                cb();
            });
        },

        function (cb) {
            request.get('https://mp.weixin.qq.com/cgi-bin/message?t=message/list&action=&keyword=&count=20&day=7&filterivrmsg=1&token=' + loadResult.token + '&lang=zh_CN') //获取人数
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .end(function (res) {


                    var indexHead = res.text.indexOf('latest_msg_id :');        //获取latest_msg_id
                    var indexTail = res.text.indexOf('count', indexHead);
                    var html = res.text.slice(indexHead + 'latest_msg_id :'.length, indexTail).trim();
                    latest_msg_id = html.slice(1, -2);

                    var indexHead = res.text.indexOf('total_count :');          //获取消息总数
                    indexTail = res.text.indexOf('.latest_msg_id', indexHead);
                    html = res.text.slice(indexHead + 'total_count :'.length, indexTail).trim();
                    html = html.slice(0, -1);
                    total_count = parseInt(html);

                    cb();
                });
        },

         function(cb){
             request.get('https://mp.weixin.qq.com/cgi-bin/message?t=message/list&action=&keyword=&frommsgid=' + latest_msg_id +  '&offset=0&count=20&day=7&filterivrmsg=1&token=' + loadResult.token + '&lang=zh_CN' + loadResult.token + '&lang=zh_CN') //获取人数
             .set('Cookie', loadResult.cookie)
             .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
             .set({"Accept-Encoding" : "gzip,sdch"}) //为了防止出现Zlib错误
             .end(function(res) {
                   var start=res.text.indexOf("window.wx =")
                    var end=res.text.indexOf("path:")
                     console.log( res.text.slice(start+"window.wx =".length,end).trim());
            logger.info(res.headers)
                     logger.info( res.text.slice(start+"window.wx =".length,end).trim())
             console.log(res.headers)
             var indexHead = res.text.indexOf('wx.cgiData =');
             indexHead = res.text.indexOf('list :', indexHead);
             var indexTail = res.text.indexOf('.msg_item', indexHead);
             var html = res.text.slice(indexHead + 'list :'.length, indexTail).trim();
             html = html.slice(1, -1);
             //console.log(html);
             list =  JSON.parse(html);
             indexHead = res.text.indexOf('latest_msg_id :');
             indexTail = res.text.indexOf('count', indexHead);
             html = res.text.slice(indexHead + 'latest_msg_id :'.length, indexTail).trim();
             latest_msg_id = html.slice(0, -1);
             console.log("---------------");
             console.log(list);
             console.log("---------------");
             cb();
             });

         }
    ], function () {
        res.render('back/school/message', {json : list, name : schoolEx.cn_name, en_name : schoolEx.en_name, token : loadResult.token});
    });
}