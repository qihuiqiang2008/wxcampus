var request = require("superagent");
var login = require('../wx_helpers/login_scan');
var async = require('async');
var http = require('request');
var fs = require('fs');
var p = require('prettyput');
var schedule = require('node-schedule');
var SchoolEx = require('../proxy').SchoolEx;

var school;

var LoginStatusDef = {
    done: 1,
    error: 2,
    unknown : 0,
};

var url = "";
var appid = "";
var ticket = "";
var operation_seq = "";
var uuid = "";
var picUrl = "";

exports.wxLogin = function(req, res, next){
  var school_enname = req.params.from_school_en_name;;
loginStatus = LoginStatusDef.unknown;

async.series([
    function (cb) {
        SchoolEx.getSchoolByEname(school_enname, function (err, school1) {
            school = school1;
            cb();
        })
    },
        function(cb) {//1.1：登陆。
            login(school, function(err, results){
                loadResult = results;
                cb();
            });
        },
        function(cb){ //获取Referer
            request.get('https://mp.weixin.qq.com' + loadResult.redirect_url)
                    .set('Cookie', loadResult.cookie)
                        .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                        .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                        .set('Referer', 'https://mp.weixin.qq.com' + loadResult.redirect_url)
                        .end(function(err, res){
                            var indexHead = res.text.indexOf('<script onerror="wx_loaderror(this)" type="text/javascript" src="https://res.wx.qq.com/c/=/mpres/zh_CN/htmledition/js/safe/');
                            var indexTail = res.text.indexOf('</script>', indexHead);
                            //console.log(indexHead);
                            //indexHead = res.text.indexOf('/mpres/zh_CN/htmledition/js/user', indexHead);
                            //console.log(indexHead);
                            //console.log(indexTail);
                            //url = "https://res.wx.qq.com" + res.text.slice(indexHead, indexTail - '"> '.length);
                            //console.log(url);
                            url = res.text.slice(indexHead + '<script onerror="wx_loaderror(this)" type="text/javascript" src="'.length, indexTail - '"> '.length);

                            cb();
                        });
        },

        function(cb){ //获取appid
            var options = {
               // url: url,
                url:'https://res.wx.qq.com/c/=/mpres/zh_CN/htmledition/js/biz_common/moment26d05a.js,/mpres/zh_CN/htmledition/js/safe/safe_check2a92e6.js,/mpres/zh_CN/htmledition/js/common/wx/Step218877.js,/mpres/zh_CN/htmledition/js/safe/Scan2e91e6.js,/mpres/zh_CN/htmledition/js/user/validate_wx2e91e6.js',
                header : {
                    'Cookie': loadResult.cookie,
                    'Referer':'https://mp.weixin.qq.com' + loadResult.redirect_url,
                }
            };

            http.get(options, function(err, res, body){
                console.log(body)
                var indexHead = body.indexOf('appid');
                var indexTail = body.indexOf('scope', indexHead);
                appid = body.slice(indexHead + 'appid:"'.length, indexTail - 3);
                console.log("appid is:" + appid);
                cb();
            });
        },

    //     function(cb){
    //     	if(loadResult.scan == true){
    //             console.log("url is :" + url);
				// request.get(url)
		  //           .set('Cookie', loadResult.cookie)
		  //               .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
		  //               .set({"Accept-Encoding": "gzip, deflate, sdch"}) 
    //                     .set('Accept-Language', 'zh-CN,zh;q=0.8')
		  //               .set('Referer', 'https://mp.weixin.qq.com' + loadResult.redirect_url)
		  //               .end(function(err, res){
		  //             //   	for (property in res.res) {
				// 	           //     s = property + ": " + res.res[property] + "\n";
				// 	           //     console.log(s);
				// 	           // }
				// 	           p.p(res);
				// 	           cb();

		  //               })
    //     	} else {
    //     		cb();
    //     	}
            
    //     }

        function (cb) {
            var data = {
                token : "",
                lang : 'zh_CN',
                f : 'json',
                ajax : 1,
                random : Math.random,
                action : 'get_ticket',
                auth:'ticket'
            };

            var sendData = '';

            for (property in data) {
                    sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
            }

            request.post('https://mp.weixin.qq.com/misc/safeassistant?1=1&token=&lang=zh_CN') 
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .set('Referer', 'https://mp.weixin.qq.com' + loadResult.redirect_url)
                .send(sendData)
                .end(function (err, res) {
                    //获取ticket和operate_seq
                    console.log(res.text);
                    var cmd = "data = " + res.text + ";";
                    eval(cmd);
                    operation_seq = data.operation_seq;
                    ticket = data.ticket;
                    console.log("operation_seq is : " + operation_seq);
                    console.log("ticket is :" + ticket);
                    cb();
                });
        },

         function(cb){
            var data = {
                token : "",
                lang : 'zh_CN',
                f : 'json',
                ajax : 1,
                random : Math.random,
                appid : appid,
                scope: 'snsapi_contact',
                state: 0,
                redirect_uri: 'https://mp.weixin.qq.com',
                login_type: 'safe_center',
                type: 'json',
                ticket : ticket
            };

            var sendData = '';

            for (property in data) {
                    sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
            }

             request.post('https://mp.weixin.qq.com/safe/safeqrconnect?1=1&token=&lang=zh_CN') 
             .set('Cookie', loadResult.cookie)
             .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
             .set({"Accept-Encoding" : "gzip,sdch"}) //为了防止出现Zlib错误
             .send(sendData)
             .end(function(err, res) {
                   //获取uuid
                   console.log(res.text);
                   var cmd = "data = " + res.text + ";";
                   eval(cmd);
                   uuid = data.uuid;
                   console.log("uuid is: " + uuid);
                   cb();
             });

         },

         function(cb){

            picUrl = './public/cache_' + school.en_name + '.jpg';
            var fsStream = fs.createWriteStream(picUrl);
            var wxPicUrl = 'https://mp.weixin.qq.com/safe/safeqrcode?ticket=' + ticket + '&uuid=' + uuid + '&action=check&type=login&auth=ticket&msgid='+ operation_seq;
            var options = {
                url: wxPicUrl,
                header : {
                    'Cookie': loadResult.cookie,
                }
            };
            // request.get() 
            //  .set('Cookie', loadResult.cookie)
            //  .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
            //  .set({"Accept-Encoding" : "gzip,sdch"}) //为了防止出现Zlib错误
            //  .pipe(stream);
            //  cb();
            var stream = http.get(options).pipe(fsStream);

            stream.on('finish', function(){
                fs.readFile(picUrl, function(err, data) {
                    if (err) throw err; // Fail if the file can't be read.
                    res.writeHead(200, {'Content-Type': 'image/jpeg'});
                    res.end(data); // Send the file data to the browser.
                    cb();
                });

               /* console.log("Picture Download Finish!!");
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write('<html><body><img src="data:image/jpeg;base64,')
                res.write(new Buffer(data).toString('base64'));
                res.end('"/></body></html>');*/

            });
             
         }
    ], function () {
        var maxtime=20;
        var rule = new schedule.RecurrenceRule();
        var times = [];
        for(var i = 1; i<20; i++){
            times.push(i*3);
        }
        rule.second = times;
       

        var job = schedule.scheduleJob(rule, function(){
            maxtime--
           if(maxtime<0){
               job.cancel();
           }
            var date = new Date();

            var data = {
                token : "",
                lang : 'zh_CN',
                f : 'json',
                ajax : 1,
                random : Math.random,
                uuid : uuid,
                action: 'json',
                type: 'json',
                ticket : ticket
            };

            var sendData = '';

            for (property in data) {
                    sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
            }

            request.post('https://mp.weixin.qq.com/safe/safeuuid?timespam=' + date.getTime() + '&token=&lang=zh_CN')
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .set('Referer', 'https://mp.weixin.qq.com' + loadResult.redirect_url)
                .send(sendData)
                .end(function(err, res){
                    var json = JSON.parse(res.text);
                    if(json.errcode == 401){
                        console.log("wait for login");
                    } else if(json.errcode == 405){
                        var data = {
                            token : "",
                            lang : 'zh_CN',
                            f : 'json',
                            ajax : 1,
                            random : Math.random,
                            code : uuid,
                            account: school.wx_account_id,
                            operation_seq: operation_seq
                        };

                        var sendData = '';

                        for (property in data) {
                                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                        }

                        request.post('https://mp.weixin.qq.com/cgi-bin/securewxverify')
                                .set('Cookie', loadResult.cookie)
                                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                .set('Referer', 'https://mp.weixin.qq.com' + loadResult.redirect_url)
                                .send(sendData)
                                .end(function(err, res){
                                var json = JSON.parse(res.text);
                                 var   token = json.redirect_url.match(/token=(\d+)/)[1];
                                 var  cookie = '';
                                if (res.header['set-cookie']) {
                                    _ref = res.header['set-cookie'];
                                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                        rs = _ref[_i];
                                        cookie += rs.replace(/HttpOnly/g, '');
                                    }
                                }
                                cookie=cookie+  res['req']['_headers']['cookie']
                                console.log(cookie);
                                SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                                    loginStatus = LoginStatusDef.done;
                                    job.cancel();
                                    school.cookie = cookie;
                                    school.token=token;
                                    school.save();

                                   // job.cancel();
                                    console.log("login Done!");
                                    })
                                });


                    } else {
                        console.log(json.errcode)
                        console.log("status unknown!");
                    }
                });
        });
    	console.log("done");
    });
}

exports.checkLogin = function(req, res, next){
    console.log("status:" + loginStatus);
    res.json({status:loginStatus});
}