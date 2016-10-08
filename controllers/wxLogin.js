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
    unknown: 0,
};

var url = "";
var appid = "";
var ticket = "";
var operation_seq = "";
var uuid = "";
var picUrl = "";

exports.wxLogin = function (req, res, next) {
    var school_enname = req.params.from_school_en_name;
    ;
    loginStatus = LoginStatusDef.unknown;

    async.series([
        function (cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school1) {
                school = school1;
                cb();
            })
        },
        function (cb) {//1.1：登陆。
            login(school, function (err, results) {
                loadResult = results;
                cb();
            });
        },
        function (cb) { //获取Referer
            request.get('https://mp.weixin.qq.com' + loadResult.redirect_url)
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .set('Referer', 'https://mp.weixin.qq.com' + loadResult.redirect_url)
                .end(function (err, res) {
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

        function (cb) { //获取appid
            var options = {
                // url: url,
                url: 'https://res.wx.qq.com/c/=/mpres/zh_CN/htmledition/js/biz_common/moment26d05a.js,/mpres/zh_CN/htmledition/js/safe/safe_check2a92e6.js,/mpres/zh_CN/htmledition/js/common/wx/Step218877.js,/mpres/zh_CN/htmledition/js/safe/Scan2e91e6.js,/mpres/zh_CN/htmledition/js/user/validate_wx2e91e6.js',
                header: {
                    'Cookie': loadResult.cookie,
                    'Referer': 'https://mp.weixin.qq.com' + loadResult.redirect_url,
                }
            };

            http.get(options, function (err, res, body) {
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
                token: "",
                lang: 'zh_CN',
                f: 'json',
                ajax: 1,
                random: Math.random,
                action: 'get_ticket',
                auth: 'ticket'
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

        function (cb) {
            var data = {
                token: "",
                lang: 'zh_CN',
                f: 'json',
                ajax: 1,
                random: Math.random,
                appid: appid,
                scope: 'snsapi_contact',
                state: 0,
                redirect_uri: 'https://mp.weixin.qq.com',
                login_type: 'safe_center',
                type: 'json',
                ticket: ticket
            };

            var sendData = '';

            for (property in data) {
                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
            }

            request.post('https://mp.weixin.qq.com/safe/safeqrconnect?1=1&token=&lang=zh_CN')
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .send(sendData)
                .end(function (err, res) {
                    //获取uuid
                    console.log(res.text);
                    var cmd = "data = " + res.text + ";";
                    eval(cmd);
                    uuid = data.uuid;
                    console.log("uuid is: " + uuid);
                    cb();
                });

        },

        function (cb) {

            picUrl = './public/cache_' + school.en_name + '.jpg';
            var fsStream = fs.createWriteStream(picUrl);
            var wxPicUrl = 'https://mp.weixin.qq.com/safe/safeqrcode?ticket=' + ticket + '&uuid=' + uuid + '&action=check&type=login&auth=ticket&msgid=' + operation_seq;
            var options = {
                url: wxPicUrl,
                header: {
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

            stream.on('finish', function () {
                fs.readFile(picUrl, function (err, data) {
                    if (err) throw err; // Fail if the file can't be read.

                    res.render('back/school/codescan', {
                        image: '/public/cache_' + school.en_name + '.jpg',
                        school: school
                    });
                    /* res.writeHead(200, {'Content-Type': 'image/jpeg'});
                     res.end(data); // Send the file data to the browser.*/
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
        var maxtime = 20;
        var rule = new schedule.RecurrenceRule();
        var times = [];
        for (var i = 1; i < 20; i++) {
            times.push(i * 3);
        }
        rule.second = times;


        var job = schedule.scheduleJob(rule, function () {
            maxtime--
            if (maxtime < 0) {
                job.cancel();
            }
            var date = new Date();

            var data = {
                token: "",
                lang: 'zh_CN',
                f: 'json',
                ajax: 1,
                random: Math.random,
                uuid: uuid,
                action: 'json',
                type: 'json',
                ticket: ticket
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
                .end(function (err, res) {
                    var json = JSON.parse(res.text);
                    if (json.errcode == 401) {
                        console.log("wait for login");
                    } else if (json.errcode == 405) {
                        var data = {
                            token: "",
                            lang: 'zh_CN',
                            f: 'json',
                            ajax: 1,
                            random: Math.random,
                            code: uuid,
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
                            .end(function (err, res) {
                                var json = JSON.parse(res.text);
                                var token = json.redirect_url.match(/token=(\d+)/)[1];
                                var cookie = '';
                                if (res.header['set-cookie']) {
                                    _ref = res.header['set-cookie'];
                                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                        rs = _ref[_i];
                                        cookie += rs.replace(/HttpOnly/g, '');
                                    }
                                }
                                cookie = cookie + res['req']['_headers']['cookie']
                                console.log(cookie);
                                SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                                    loginStatus = LoginStatusDef.done;
                                    job.cancel();
                                    school.cookie = cookie;
                                    school.token = token;
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

exports.checkLogin = function (req, res, next) {
    console.log("status:" + loginStatus);
    res.json({status: loginStatus});
}


exports.download = function (req, res, next) {
    // var titile="挤眼|亲亲|太开心|生病|书呆子|失望|可怜|黑线|吐|委屈|思考|哈哈|嘘|右哼哼|左哼哼|疑问|阴险|顶|钱|悲伤|鄙视|拜拜|吃惊|闭嘴|衰|愤怒|感冒|酷|来|拳头|弱|握手|赞|耶|最差|怒骂|困|哈欠|微笑|白眼|睡|色|挖鼻|傻眼|打脸|作揖|笑cry|红丝带|绿丝带|可爱|嘻嘻|汗|害羞|泪|爱你|偷笑|心|哼|鼓掌|晕|馋嘴|抓狂|抱抱_旧|怒|右抱抱|左抱抱";
    /* var image = "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c3/zy_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/8f/qq_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/58/mb_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b6/sb_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/61/sdz_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0c/sw_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/kl_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/91/h_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9e/t_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/73/wq_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/e9/sk_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6a/laugh.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a6/x_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/98/yhh_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/zhh_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/yw_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/yx_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/91/d_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/90/money_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/1a/bs_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/71/bs2_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/70/88_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f4/cj_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/29/bz_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/af/cry.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/bd/fn_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a0/gm_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/cool_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/come_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d8/good_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/13/ha_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d6/ok_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/cc/o_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d8/sad_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0c/ws_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d0/z2_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/ye_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/3e/bad_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/ae/buyao_org.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/numav2_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/kunv2_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/cc/haqianv2_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5c/huanglianwx_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/landeln_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/96/huangliansj_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/20/huanglianse_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/wabi_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/2b/shayan_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/32/dalian_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/06/zuoyi_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/34/xiaoku_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/59/red_band_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9b/green_band_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/14/tza_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0b/tootha_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/24/sweata_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6e/shamea_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/9d/sada_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/lovea_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/19/heia_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/hearta_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/49/hatea_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/36/gza_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/d9/dizzya_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a5/cza_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/62/crazya_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/27/bba_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/7c/angrya_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0d/right_thumb.gif|"
     image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/54/left_thumb.gif"


     var title = "挤眼"
     title = title + "|亲亲"
     title = title + "|太开心"
     title = title + "|生病"
     title = title + "|书呆子"
     title = title + "|失望"
     title = title + "|可怜"
     title = title + "|黑线"
     title = title + "|吐"
     title = title + "|委屈"
     title = title + "|思考"
     title = title + "|哈哈"
     title = title + "|嘘"
     title = title + "|右哼哼"
     title = title + "|左哼哼"
     title = title + "|疑问"
     title = title + "|阴险"
     title = title + "|顶"
     title = title + "|钱"
     title = title + "|悲伤"
     title = title + "|鄙视"
     title = title + "|拜拜"
     title = title + "|吃惊"
     title = title + "|闭嘴"
     title = title + "|衰"
     title = title + "|愤怒"
     title = title + "|感冒"
     title = title + "|酷"
     title = title + "|来"
     title = title + "|good"
     title = title + "|haha"
     title = title + "|ok"
     title = title + "|拳头"
     title = title + "|弱"
     title = title + "|握手"
     title = title + "|赞"
     title = title + "|耶"
     title = title + "|最差"
     title = title + "|NO"
     title = title + "|怒骂"
     title = title + "|困"
     title = title + "|哈欠"
     title = title + "|微笑"
     title = title + "|白眼"
     title = title + "|睡"
     title = title + "|色"
     title = title + "|挖鼻"
     title = title + "|傻眼"
     title = title + "|打脸"
     title = title + "|作揖"
     title = title + "|笑cry"
     title = title + "|红丝带"
     title = title + "|绿丝带"
     title = title + "|可爱"
     title = title + "|嘻嘻"
     title = title + "|汗"
     title = title + "|害羞"
     title = title + "|泪"
     title = title + "|爱你"
     title = title + "|偷笑"
     title = title + "|心"
     title = title + "|哼"
     title = title + "|鼓掌"
     title = title + "|晕"
     title = title + "|馋嘴"
     title = title + "|抓狂"
     title = title + "|抱抱"
     title = title + "|怒"
     title = title + "|右抱抱"
     title = title + "|左抱抱"
     */

  var title = "doge";
    title = title + "|喵喵"
    title = title + "|围观"

    title = title + "|kxl晕"

    title = title + "|男孩儿"

    title = title + "|女孩儿"

    title = title + "|kiss"

    title = title + "|跳舞花"
    title = title + "|c伤心"
    title = title + "|c捂脸"

    title = title + "|c大笑"
    title = title + "|moc转发"
    title = title + "|moc羞"


    title = title + "|moc鬼脸"

    title = title + "|moc大哭"
    title = title + "|微风"

    title = title + "|c发火"

    title = title + "|c委屈"

    title = title + "|bm抓狂"

    title = title + "|bm缤纷"

    title = title + "|bm醒悟"

    title = title + "|哆啦A梦汗"

    title = title + "|xkl路过"

    title = title + "|芒果萌萌哒"

    title = title + "|din爱你"
    title = title + "|din睡觉"

    title = title + "|ali转圈哭"

    title = title + "|ali跪求"
    title = title + "|ali冤"

    title = title + "|ali加油"
    var image = "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b6/doge_thumb.gif|"
    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/4a/mm_thumb.gif|"
    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f2/wg_thumb.gif|"


    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/c6/kxlyun_thumb.gif|"


    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/4e/kissboy_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/1b/kissgirl_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/59/kiss2_thumb.gif|"


    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/70/twh_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/cf/xcjshangxin_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/96/xcjwulian_thumb.gif|"


   image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/6d/cdaxiao_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/cb/moczhuanfa_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/53/mocxiu_thumb.gif|"


    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/0f/mocguilian_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/92/mocdaku_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/a5/wind_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/20/xcjfahuo_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/48/xcjweiqu_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/bmzhuakuang_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/15/bmbinfen_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/15/bmbinfen_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/61/dorahan_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/00/xklluguo_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/49/mango_11_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/83/dinaini_thumb.gif|"
    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/f3/dinshuijiao_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/ef/alizhuanquankunew_thumb.gif|"


    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/61/aliguiqiunew_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/5f/wq2_thumb.gif|"

    image = image + "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/b1/alijiayounew_thumb.gif"

    var dd = "";
    var titiles = title.split("|");
    var images = image.split("|");
    for (var i = 0; i < titiles.length; i++) {

        //console.log(titiles[i] + ":" + images[i])

        var url = images[i];
        dd = dd + "," + "'" + titiles[i] + "'";

        console.log(url + ":" + titiles[i])

        request(url).pipe(fs.createWriteStream("/Users/umeng/MyProjects/wxcampus/public/front/face1/" + titiles[i]+".gif"));


    }
    console.log(dd);
}


