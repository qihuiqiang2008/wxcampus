/**
 * Created by wanghan on 2014/8/30.
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
//var wxList = require(__dirname + '/../config/config');
var async = require('async');
var deepCopy = require('deepcopy');
var Resource = require('../proxy').Resource;
var fs = require('fs');
var Configuration = require('../proxy').Configuration;
var SchoolEx = require('../proxy').SchoolEx;

exports.checkResource = function (req, res, next) {
    var group = req.query.group || 1;
    Resource.getTodayResourceCount(group, {"$gte": new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate())}, function (err, count) {
        if (count > 0) {
            res.send("true");
        }
        else {
            res.send("false");
        }
    });
}


function replaceContent(e) {
    var t = ["&", "&amp;", "<", "&lt;", ">", "&gt;", " ", "&nbsp;", '"', "&quot;", "'", "&#39;"];
    t.reverse();
    for (var n = 0; n < t.length; n += 2) e = e.replace(new RegExp(t[n], "g"), t[1 + n]);
    return e;
}

var articleNum = 4;
var html;
exports.getSource = function (req, res, next) {
    var group = req.query.group || 1;
    var loadResult, content;
    var isgetTarget=req.query.isgetTarget
    articleNum = req.query.articleNum;

    console.log(articleNum);
    var contentSource = {
        wx_account_id: "bnu_welife@163.com",
        wx_account_password: "zgyfjch2013",
        msgId: "503031861"

    };
    if (group == 5) {
        contentSource = {
            wx_account_id: "bnu_welife@163.com",
            wx_account_password: "zgyfjch2013",
            msgId: "503031861"
        };
    }

    async.series([
        function (cb) {//1.1：登陆到素材源。
            Configuration.getConfigurationByCode("getSourceSchool", function (err, s) {
                contentSource = {
                    wx_account_id: s.value.split('|')[1],
                    wx_account_password: s.value.split('|')[2],
                    msgId: s.value.split('|')[3]
                };
                if (isgetTarget) {
                    contentSource.msgId = s.value.split('|')[4];
                }
                SchoolEx.getSchoolByEname(s.value.split('|')[0], function (err, school) {
                    login(school, function (err, results) {
                        loadResult = results;
                        cb();
                    })
                })
            })
        },
        function (cb) {  //1.2：获取素材内容
            request.get('https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid=' + contentSource.msgId + '&isMul=1')
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"})
                .end(function (res) {
                    var indexHead = res.text.indexOf('infos'); //定位到含有内容的位置
                    var indexTail = res.text.indexOf('item = (infos.item && infos.item[0] ) || {};', indexHead);
                    html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                    var infos;
                    eval(html.substring(0, html.length - 1) + ';'); //对infos赋值
                    content = (infos.item && infos.item[0] ) || {}; //现在变量中的multi_item中放的就是文章内容

                    for (var i = 0; i < articleNum; i++) {
                        content.multi_item[i].content = replaceContent(content.multi_item[i].content);
                    }


                    var cookie = '';        //更新cookie
                    if (res.header['set-cookie']) {
                        _ref = res.header['set-cookie'];
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            rs = _ref[_i];
                            cookie += rs.replace(/HttpOnly/g, '');
                        }
                    }
                    loadResult.cookie = cookie;
                    cb();
                });
        },

        function (cb) { //1.3：获取图片

            async.each(content.multi_item, function (item, callbackGetPic) {
                var index = content.multi_item.indexOf(item);
                var stream = fs.createWriteStream('./cache' + index + '.jpg');
                console.log(index);

                request.get(content.multi_item[index].cover)
                    .set({"Accept-Encoding": "gzip,sdch"})
                    .set('Accept', 'image/png,image/*;q=0.8,*/*;q=0.5')
                    .pipe(stream);
                callbackGetPic();

            }, function (err) {
                console.log("err is:" + err);

                // content.multi_item.push({content:"",title:"",author:"",digest:"",cdn_url:"",can_reward:"",copyright_type:"",source_url:""});


                console.log(content.multi_item.length + "---------");
                Resource.removeAll(function () {
                    Resource.newAndSave(group, JSON.stringify(content), function (err) {
                        res.send("success");
                        console.log("get source success!");
                        console.log("--------------------------------------")


                        console.log(JSON.stringify(content));
                        cb();
                        // console.log(contentSource);
                        // console.log( req.session.user.location.belong_group);
                        //console.log(req.session.user.location.belong_group==2);
                    });
                });
                //content内容写入到文件中
                /* fs.writeFile('./content_cache.dat', JSON.stringify(content), function(err){
                 if(err){
                 console.log('write file fail!');
                 }
                 console.log('===============done!==================');
                 cb();
                 });*/
            });
        }])
}