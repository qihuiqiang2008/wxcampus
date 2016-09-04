/**
 * Created by wanghan on 2014/11/29.
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var Resource = require('../proxy').Resource;
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;
var async = require('async');

exports.addKeyword = function(req, res, next){
    //获取消息
    var loadResult;
    var school_enname= req.query.school_enname;

    var content = req.query.content;
    var key_word = req.query.key;
    var rule_name = req.query.rulename;

    var fileid = req.query.fileid;
    var file_id;

    var type = req.query.type;
    var rule_type;

    var result_json;
    var schoolEx;

    if(type == '3') {
        rule_type = '3';
        file_id = fileid;
        content='';
    }
    else {
        rule_type = '1';
        file_id = '';
    }

    async.series([

        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                schoolEx = school;

                content= content.replace(new RegExp("__user_name__", "g"), school_enname);
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

        function(cb) {      //设置关键字
            var data = {
                token:loadResult.token,
                ajax:'1',
                allreply:'0',
                content0:content,
                f:'json',
                fileid0:file_id,
                keyword0:key_word,
                keywordcnt:'1',
                lang:'zh_CN',
                matchmode0:'0',
                random:Math.random(),
                replycnt:'1',
                replytype:'smartreply',
                ruleid:'0',
                rulename:rule_name,
                type0:rule_type
            };

            var sendData = '';

            for (property in data) {
                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                console.log(property + ':' + data[property]);
            }

            //添加关键字
            request.post('https://mp.weixin.qq.com/advanced/setreplyrule?cgi=setreplyrule&fun=save&t=ajax-response&token=' + loadResult.token + '&lang=zh_CN')
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,sdch")
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Referer', 'https://mp.weixin.qq.com/advanced/autoreply?t=ivr/keywords&action=smartreply&token=' + loadResult.token  + '&lang=zh_CN')
                .set('X-Requested-With', 'XMLHttpRequest')
                .send(sendData)
                .end(function(res){

                    result_json=JSON.parse(res.text);
                    console.log(res.text);
                    cb();
                })
        },

        function(cb){ //2.5 登出
            request('https://mp.weixin.qq.com/cgi-bin/logout?t=wxm-logout&lang=zh_CN&token=' + loadResult.token)
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,sdch")
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .end(function(res){
                    console.log('==========logout=================');
                    cb();
                })
        }
    ], function(err, results) {
        res.send(result_json.base_resp);
    });
}