/**
 * Created by wanghan on 2014/10/22.
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var async = require('async');
var fs = require('fs');
var SchoolEx = require('../proxy').SchoolEx;

exports.sendMessage = function(req, res, next){
    var school_enname= req.query.en_name;
    var fakeid = req.query.fakeid;
    var content = req.query.content;
    var schoolEx;
    var json;

    var loadResult;

    console.log("fakeid is " + fakeid);
    console.log("msg is " + content);
    async.series([
        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                schoolEx = school;
                //   console.log(schoolEx)
                console.log("school is " + school_enname);
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
            request.post('https://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&f=json&token=' + loadResult.token + '&lang=zh_CN') //发送消息
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Referer','https://mp.weixin.qq.com/cgi-bin/singlesendpage?tofakeid=' + fakeid + '&t=message/send&action=index&token='  + loadResult.token + '&lang=zh_CN') //伪装
                .set('X-Requested-With',	'XMLHttpRequest')
                .send('ajax=1')
                .send('content=' + content)
                .send('f=json')
                .send('lang=zh_CN')
                .send('random=' + Math.random())
                .send('tofakeid=' + fakeid)
                .send('token=' + loadResult.token)
                .send('type=1')
                .end(function (res) {

                    json = JSON.parse(res.text);
                    console.log(json);
                    cb();
                });
        }
    ], function () {
        res.send(json);
    });
}

exports.addBlacklist = function(req, res, next){
    var school_enname= req.query.en_name;
    var fakeid = req.query.fakeid;
    var content = req.query.content;
    var schoolEx;
    var json;

    var loadResult;

    console.log("fakeid is " + fakeid);
    console.log("msg is " + content);
    async.series([
        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                schoolEx = school;
                //   console.log(schoolEx)
                console.log("school is " + school_enname);
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
            request.post('https://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&f=json&token=' + loadResult.token + '&lang=zh_CN') //发送消息
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Referer','https://mp.weixin.qq.com/cgi-bin/singlesendpage?tofakeid=' + fakeid + '&t=message/send&action=index&token='  + loadResult.token + '&lang=zh_CN') //伪装
                .set('X-Requested-With',    'XMLHttpRequest')
                .send('ajax=1')
                .send('content=' + content)
                .send('f=json')
                .send('lang=zh_CN')
                .send('random=' + Math.random())
                .send('tofakeid=' + fakeid)
                .send('token=' + loadResult.token)
                .send('type=1')
                .end(function (res) {
                    json = JSON.parse(res.text);
                    console.log(json);
                    cb();
                });
        }
    ], function () {
        res.send(json);
    });
}