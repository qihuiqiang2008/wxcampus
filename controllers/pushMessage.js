/**
 * Created by wanghan on 2014/10/29.
 */

require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var Resource = require('../proxy').Resource;
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;
var async = require('async');
var fs = require('fs');

exports.pushMessage = function(req, res, next){
    //获取消息
    var loadResult;
    var school_enname= req.query.school_enname;
    var operation_seq;
    var result_json;
    var schoolEx;
    var cookie = ''; 

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

        function(cb) {  //更新cookie
        request.get('https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token='+loadResult.token)
            .set('Cookie', loadResult.cookie)
            .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
            .set({"Accept-Encoding" : "gzip,sdch"})
            .end(function(res){
                
                       //更新cookie
                if (res.header['set-cookie']) {
                    _ref = res.header['set-cookie'];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        rs = _ref[_i];
                        cookie += rs.replace(/HttpOnly/g, '');
                    }
                }
                var head = cookie.indexOf('bizuin');
                var new_bizuin = cookie.slice(head + 7, head + 17);
                head = loadResult.cookie.indexOf('bizuin');
                var old_bizuin = loadResult.cookie.slice(head + 7, head + 17);
                var eval_string = "loadResult.cookie = loadResult.cookie.replace(/bizuin="+ old_bizuin +"/g, 'bizuin=" + new_bizuin + "')";
                eval(eval_string);
                var eval_string = "loadResult.cookie = loadResult.cookie.replace(/data_bizuin="+ new_bizuin +"/g, 'data_bizuin=" + old_bizuin + "')";
                eval(eval_string);
                loadResult.cookie = loadResult.cookie.replace(/Secure;/g, '').replace(/Path=\/;/g, '').replace(/[ ]/g,"");
                //loadResult.cookie += "noticeLoginFlag=1; pgv_pvid=6586050236; ptui_loginuin=605702235; ptcz=a9f6e5918786ac365b1020937554aa699850f78b74730c7c2dc9db2a8d06739d; pt2gguin=o0605702235; pgv_pvi=185521152;";
                cb();
            });
        },

        function(cb){ //获取operation_seq
            console.log("Login cookie is :" + loadResult.cookie);
            console.log("cookie is :" + cookie);
            request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/send&token=' + loadResult.token + '&lang=zh_CN') //获取人数
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,deflate,sdch"}) //为了防止出现Zlib错误
                .set('Accept', "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .set('Referer', "https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token=" + loadResult.token)
                .set('Host', "mp.weixin.qq.com")
                .end(function (res) {

                    //console.log(res.text);
                    var indexHead = res.text.indexOf('operation_seq');        //获取latest_msg_id
                    var indexTail = res.text.indexOf('gray_status', indexHead);
                    var html = res.text.slice(indexHead + 'operation_seq:'.length, indexTail).trim();
                    //console.log("indexHead is:" + indexHead);
                    //console.log("indexTail is:" + indexTail);

                    operation_seq = html.slice(0, -1).trim();
                    operation_seq = operation_seq.slice(1, -1);
                    console.log("operation_seq is:" + operation_seq);
                    
                    cb();
                    
                });

        },

        function(cb){  //推送消息前检查消息的版权信息，现在观察的结果是单图文检查两次，多图文检查三次。
            var data = {
                token:loadResult.token,
                lang:'zh_CN',
                f:'json',
                ajax:'1',
                random:Math.random(),
                first_check:'1',
                type:'10',
                appmsgid:schoolEx.appmsgid
            };
            var sendData = '';

            for (property in data) {
                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                console.log(property + ':' + data[property]);
            }
            sendData = sendData.substring(0, sendData.length - 1);

            console.log("check first time! param:" + sendData);

                var url = 'https://mp.weixin.qq.com/cgi-bin/masssend?action=get_appmsg_copyright_stat&token='+ loadResult.token +'&lang=zh_CN';
                request.post(url) //第一遍
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,sdch")
                        .set("Accept-Language","zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3")
                .set("Accept" ,"application/json, text/javascript, */*; q=0.01")
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/send&token=' + loadResult.token + '&lang=zh_CN')
                .set('X-Requested-With', 'XMLHttpRequest')
                        .set('Host','mp.weixin.qq.com')
                .send(sendData)
                .end(function(res){
                    console.log(res.text);
                    data.first_check = '0';
                    data.random = Math.random();
                    var sendData2 = '';
                    for (property in data) {
                         sendData2 = sendData2 + property + '=' + encodeURIComponent(data[property]) + "&";
                         console.log(property + ':' + data[property]);
                    }
                    sendData2 = sendData2.substring(0, sendData2.length - 1);

                    console.log("check second time! param:" + sendData2);
                    request.post(url)  //第二遍
                        .set('Cookie', loadResult.cookie)
                        .set("Accept-Encoding" , "gzip,sdch")
                                .set("Accept-Language","zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3")
                        .set("Accept" ,"application/json, text/javascript, */*; q=0.01")
                        .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                        .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/send&token=' + loadResult.token + '&lang=zh_CN')
                        .set('X-Requested-With', 'XMLHttpRequest')
                                .set('Host','mp.weixin.qq.com')
                        .send(sendData2)
                        .end(function(res){
                            console.log(res.text);
//                             request.post(url) //第三遍
//                                .set('Cookie', loadResult.cookie)
//                                .set("Accept-Encoding" , "gzip,sdch")
//                                        .set("Accept-Language","zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3")
//                                .set("Accept" ,"application/json, text/javascript, */*; q=0.01")
//                                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
//                                .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN')
//                                .set('X-Requested-With', 'XMLHttpRequest')
//                                        .set('Host','mp.weixin.qq.com')
//                                .send(sendData)
//                                .end(function(res){
//                                    cb();
//                                });
                            cb();
                        });
                });
        },

        function(cb) {      //推送消息
            var data = {
                token:loadResult.token,
                lang:'zh_CN',
                f:'json',
                ajax:'1',
                random:Math.random(),
                type:'10',
                appmsgid:schoolEx.appmsgid,
                cardlimit:'1',
                sex:'0',
                groupid:'-1',
                synctxweibo:'0',
               // enablecomment:'0',
                country:'',
                province:'',
                city:'',
                imgcode:''
              //  direct_send:'1'
             //   copy_msgid:schoolEx.appmsgid,
              //  reprint_allow_list:''
            };

            data.operation_seq = operation_seq;
            data.direct_send = '1';
            var sendData = '';

            for (property in data) {
                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                console.log(property + ':' + data[property]);
            }
            sendData = sendData.substring(0, sendData.length - 1);

            //推送消息
			   //  console.log( loadResult.cookie);
            console.log("Now Push Message! param:" + sendData);
            console.log("Cookie: " + loadResult.cookie);
            var url = 'https://mp.weixin.qq.com/cgi-bin/masssend?t=ajax-response&token='+ loadResult.token +'&lang=zh_CN';
            request.post(url)
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,sdch")
				        .set("Accept-Language","zh-cn,zh;q=0.8,en-us;q=0.5,en;q=0.3")
                .set("Accept" ,"application/json, text/javascript, */*; q=0.01")
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/send&token=' + loadResult.token + '&lang=zh_CN')
                .set('X-Requested-With', 'XMLHttpRequest')
				        .set('Host','mp.weixin.qq.com')
                .send(sendData)
                .end(function(res){
                    result_json=JSON.parse(res.text);
                    console.log(res.text);
                    cb();
                });
        }
        // ,
        // function(cb){ //2.5 登出
        //     request('https://mp.weixin.qq.com/cgi-bin/logout?t=wxm-logout&lang=zh_CN&token=' + loadResult.token)
        //         .set('Cookie', loadResult.cookie)
        //         .set("Accept-Encoding" , "gzip,sdch")
        //         .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
        //         .end(function(res){
        //             console.log('==========logout=================');
        //             cb();
        //         })
        // }
    ], function(err, results) {
        res.send(result_json);
    });
}