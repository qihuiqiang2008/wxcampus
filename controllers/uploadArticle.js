/**
 * Created by wanghan on 2014/8/18.
 * 从源账户获取指定的文章内容，将其复制到其它账号去
 *
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require( __dirname + '/../wx_helpers/login');
//var wxList = require(__dirname + '/../config/config');
var SchoolEx = require('../proxy').SchoolEx;
var deepCopy = require('deepcopy');
var async = require('async');
var fs = require('fs');

var articleNum = 4;         //试验采用两篇文章

function replaceContent(e) {
    var t = [ "&", "&amp;", "<", "&lt;", ">", "&gt;", " ", "&nbsp;", '"', "&quot;", "'", "&#39;" ];
    t.reverse();
    for (var n = 0; n < t.length; n += 2) e = e.replace(new RegExp(t[n], "g"), t[1 + n]);
    return e;
}

exports.upload = function(req, res, next){
    var contentSource = {
        wx_account_id:"bjfu_welife@163.com",
        wx_account_password:"zgyfjch2013",
        msgId:"200342592"
    };

    var loadResult, content;
    async.series([
        function(cb) {//1.1：登陆到素材源。
            login(contentSource, function(err, results){
                loadResult = results;
                cb();
            });
        },

        function(cb) {  //1.2：获取素材内容
            request.get('https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid='+ contentSource.msgId + '&isMul=1')
                .set('Cookie', loadResult.cookie)
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding" : "gzip,sdch"})
                .end(function(res){
                    var indexHead = res.text.indexOf('infos'); //定位到含有内容的位置
                    var indexTail = res.text.indexOf('item = (infos.item && infos.item[0] ) || {};', indexHead);
                    var html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                    var infos;
                    eval(html.substring(0,html.length - 1) + ';'); //对infos赋值
                    content = (infos.item && infos.item[0] ) || {}; //现在变量中的multi_item中放的就是文章内容

                    for(var i=0; i<articleNum; i++) {
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

        function(cb) { //1.3：获取图片

            async.each(content.multi_item, function(item, callbackGetPic){
                var index = content.multi_item.indexOf(item);
                var stream = fs.createWriteStream('./cache' + index + '.jpg');
                console.log(index);
//                for (property in item) {
//                    s = property + ": " + item[property] + "\n";
//                    console.log(s);
//                }
                console.log(content.multi_item[index].cover);
                request.get(content.multi_item[index].cover)
                    .set({"Accept-Encoding" : "gzip,sdch"})
                    .set('Accept','image/png,image/*;q=0.8,*/*;q=0.5')
                    .pipe(stream);
                callbackGetPic();
//                    .end(function(res) {
////                        content.multi_item[index].cover = res.body;
////                        content.multi_item[index].type = res.header["content-type"];
////                        console.log('index is ' + index);
//                        call_back();
//                    });
            }, function(err){
                        cb();
            });
        }

    ], function(err, results) {     //全部成功，进入第二阶段，将所有账号内容自动填充
        var user_name, ticket;
        var userID = '';
        var content_temp;
        SchoolEx.getAllSchoolExs(function(err,schoolExes) {
            console.log(schoolExes);
            async.eachSeries(schoolExes, function(item, callback){      //所有账号都重复一遍
                async.series([
                    function(cb) {                          //2.1登陆目的账号
                        login(item, function(err, results) {
                            content_temp = deepCopy(content);
                            loadResult = results;
                            userID = item.cn_name.split('@')[0];
                            console.log("准备：" + item.cn_name + '\nid:' + userID);
                            cb();
                        });
                    },

//                function(cb){//获取秘密及表白标题
//                    var secret_title, confession_title;
//
//                    content_temp.multi_item[2].title = content.multi_item[2].title.replace(new RegExp("__secret_title__", "g"), secret_title);
//                    content_temp.multi_item[3].title = content.multi_item[3].title.replace(new RegExp("__confession_title__", "g"), confession_title);
//                },

                    function(cb) {      //  获取秘密内容
                        //fs.readFile('./data/' + userID + '_secret.txt', 'utf-8',function(err, data){
                           // if(err){
                               // console.log('error when read file!');
                           // }

                            content_temp.multi_item[2].content = content.multi_item[2].content.replace(new RegExp('<p style=\"white-space: normal;\">__secret_content__</p>', "g"), item.secret_content);
                            content_temp.multi_item[2].title = content.multi_item[2].title.replace(new RegExp("__secret_title__", "g"),  item.secret_title);
                            cb();
                       // });
                    },

                    function(cb) {      //  获取表白内容
                      //  fs.readFile('./data/' + userID + '_confession.txt', 'utf-8',function(err, data){
                          //  if(err){
                            //    console.log('error when read file!');
                           // }

                            content_temp.multi_item[3].content = content.multi_item[3].content.replace(new RegExp('<p style=\"white-space: normal;\">__confession_content__</p>', "g"), item.confess_content);
                            content_temp.multi_item[3].title = content.multi_item[3].title.replace(new RegExp("__confession_title__", "g"),  item.confess_title);
                            cb();
                        //});
                    },

                    function(cb){//2.2 获取ticket 与user_name
                        request.get('https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token='+loadResult.token) //获取人数
                            .set('Cookie', loadResult.cookie)
                            .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                            .set({"Accept-Encoding" : "gzip,sdch"}) //为了防止出现Zlib错误
                            .end(function(res) {
                                var indexHead = res.text.indexOf('window.wx'); //定位到含有图片ticket的位置
                                indexHead = res.text.indexOf('ticket', indexHead);
                                var indexTail = res.text.indexOf('lang', indexHead);
                                var html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                                ticket = html.substring('ticket:'.length + 1, html.length - 2); //将头部的 ‘ticket:’，两头的引号与","都去除掉

                                indexHead = res.text.indexOf('user_name'); //定位到含有user_name的位置
                                indexTail = res.text.indexOf('nick_name', indexHead);
                                html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                                user_name = html.substring('user_name:'.length + 1, html.length - 2); //将头部的 ‘user_name:’，两头的引号与","都去除掉
                                console.log("user name is " + user_name + "\nticket is " + ticket);
                                cb();
                            });
                    },

                    function(cb) {                  //2.3 上传图片
                        //var fileType = content.multi_item[0].type.substring("image/".length, content.multi_item[0].type.length);
                        //var fileName = new Date().getTime() + '.' + fileType;
                        async.eachSeries(content_temp.multi_item, function(item, callbackPostPic){
                            var index = content_temp.multi_item.indexOf(item);
                            var req = request.post('https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&ticket_id=' + user_name + '&ticket=' + ticket + '&token=' + loadResult.token + '&lang=zh_CN')
                                .set('Accept', '*/*')
                                .set('Cookie', loadResult.cookie)
                                .set("Accept-Encoding" , "gzip,deflate,sdch")
                                .set('Connection', 'keep-alive')
                                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                .set('Refer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid='+ item.AppMsgId + '&isMul=1')
                                .set('Origin', 'https://mp.weixin.qq.com')
                                .field('Filename', index +'.jpg')
                                .field('folder', '/cgi-bin/uploads')
                                .attach('file', './cache' + index + '.jpg', index + '.jpg')
                                .field('Upload', 'Submit Query')
                                .end(function(res){
                                    content_temp.multi_item[index].fileid0 = JSON.parse(res.text).content;
                                    callbackPostPic();
                                });
                        }, function(err){
                            cb();
                        })
                    },

                    function(cb) {      //2.4 上传文章内容
                        var data = {
                            ajax:'1',
                            count:articleNum + '',
                            f:'json',
                            lang:'zh_CN'
                        };
                        var sendData = '';

                        data.token = loadResult.token;
                        data.random = Math.random();
                        for(var i = 0; i<articleNum; i++){
                            data['content' + i] = content_temp.multi_item[i].content.replace(new RegExp("__user_name__", "g"), user_name);
                            data['digest' + i] = content_temp.multi_item[i].digest;
                            data['title' + i] = content_temp.multi_item[i].title.replace(new RegExp("__name__", "g"), item.cn_short_name);
                            data['fileid' + i] = content_temp.multi_item[i].fileid0;
                            data['show_cover_pic' + i] = '0';
                        }

                        data.AppMsgId = item.appmsgid;

                        for (property in data) {
                            sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                            console.log(property + ':' + data[property]);
                        }

                        request.post('https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=update&type=10&token=' + loadResult.token + '&lang=zh_CN')
                            .set('Cookie', loadResult.cookie)
                            .set("Accept-Encoding" , "gzip,sdch")
                            .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                            .set('Refer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token  + '&type=10&appmsgid=' + item.appmsgid + '&isMul=1')
                            .send(sendData)
                            .end(function(res){
                                console.log(res.text);
                                cb();
                            })
                    },

                    function(cb){ //2.5 登出
                        request('https://mp.weixin.qq.com/cgi-bin/logout?t=wxm-logout&lang=zh_CN&token='+ loadResult.token)
                            .set('Cookie', loadResult.cookie)
                            .set("Accept-Encoding" , "gzip,sdch")
                            .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                            .end(function(res){

                                console.log('==========logout=================');
                                cb();
                            })
                    }
                ], function(err, results) {
                    if(!err){
                        item.edit_at=Date.now;
                        item.save();
                    }
                    callback();
                });
            });
        })
     });


}
