require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var AD = require('../proxy').AD;
var async = require('async');
var fs = require('fs');
var parse5 = require('parse5');

exports.getArticleAD = function(req, res, next) {
    var ads;
    var user = req.query.user;
    var number = req.query.number;
    var day = req.query.day;
    var loadResult;
    var latest_msg_id;
    var total_count;
    var count = 20;
    var school_enname = "whu";
    var offset = 0;
    var list;
    var schoolEx;
    var begin;
    var day = req.query.day;
    if (day == undefined) {
        begin = new Date(new Date().setUTCHours(0, 0, 0, 0));
    } else {
        begin = new Date(day);
    }

    async.series([
        // function(cb) {
        //     ad.getAdByTime(begin, end, {}, function(err, ad) {
        //     	ads = ad;
        //         cb();
        //     });
        // },

        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function(err, school) {
                schoolEx = school;
                //   console.log(schoolEx)
                cb();
            })
        },

        function(cb) { //1.1：登陆。
            login(schoolEx, function(err, results) {
                loadResult = results;
                cb();
            });
        },

        function(cb) {
            request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN') //获取人数
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({ "Accept-Encoding": "gzip,sdch" }) //为了防止出现Zlib错误
                .end(function(res) {
                    var start = res.text.indexOf("window.wx =")
                    var end = res.text.indexOf("path:")

                    var indexHead = res.text.indexOf('wx.cgiData =');
                    indexHead = res.text.indexOf('list :', indexHead);
                    var indexTail = res.text.indexOf('.msg_item', indexHead);
                    var html = res.text.slice(indexHead + 'list :'.length, indexTail).trim();
                    html = html.slice(1, -1);
                    //console.log(html);
                    list = JSON.parse(html);
                    console.log(list.msg_item[0].multi_item);
                    cb();
                });

        }
    ], function() {
        res.render('back/school/message', { json: list, name: schoolEx.cn_name, en_name: schoolEx.en_name, token: loadResult.token });
    });
}
