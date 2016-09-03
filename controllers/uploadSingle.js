/**
 * Created by wanghan on 2014/8/30.
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require( __dirname + '/../wx_helpers/login');
//var wxList = require(__dirname + '/../config/config');
var async = require('async');
var Resource = require('../proxy').Resource;
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;

var fs = require('fs');

var articleNum = 4;         //试验采用两篇文章

exports.uploadSingle = function(req, res, next){
    var query = req.query.user;
    var school_enname= req.query.school_enname;
    var loadResult;
    var content;
    var cookie = '';
    var sendData = '';
    var userID = '';
    var schoolEx;
    //var Resource="";

/*    for(var elem in wxList){
        if(wxList[elem].user == query){
            item = wxList[elem];
            userID = item.user.split('@')[0];
            console.log('准备：' + item.name + '\nuser ID is ' + userID);
        }
    }*/

    async.series([
        function(cb) {      //  获取素材内容
           // Resource.getTodayResource(req.session.user.belong_group,{"$gte": new Date((new Date()).getFullYear(),(new Date()).getMonth(), (new Date()).getDate())},function(err,resource){
               // content=JSON.parse(resource.content);
              //  cb();
         //   });
           /* fs.readFile('./content_cache.dat', function(err, data){
                if(err){
                    console.log('error when read file!');
                }
                content = JSON.parse(data);
                cb();
            });*/
        },
        function(cb) {      //  获取素材内容
            SchoolEx.getSchoolByEname(school_enname,function(err,school){
                schoolEx=school;
                cb();
            })
           /* fs.readFile('./content_cache.dat', function(err, data){
                if(err){
                    console.log('error when read file!');
                }
                content = JSON.parse(data);
                cb();
            });*/
        },

        function(cb) {      //  获取秘密内容
            //fs.readFile('./data/' + userID + '_secret.txt', 'utf-8',function(err, data){
            // if(err){
            // console.log('error when read file!');
            // }

            content.multi_item[2].content = content.multi_item[2].content.replace(new RegExp('<p style=\"white-space: normal;\">__secret_content__</p>', "g"), schoolEx.secret_content);
            content.multi_item[2].title = content.multi_item[2].title.replace(new RegExp("__secret_title__", "g"),  schoolEx.secret_title);
            cb();
            // });
        },

        function(cb) {      //  获取表白内容
            //  fs.readFile('./data/' + userID + '_confession.txt', 'utf-8',function(err, data){
            //  if(err){
            //    console.log('error when read file!');
            // }
            content.multi_item[3].content = content.multi_item[3].content.replace(new RegExp('<p style=\"white-space: normal;\">__confession_content__</p>', "g"), schoolEx.confess_content);
            content.multi_item[3].title = content.multi_item[3].title.replace(new RegExp("__confession_title__", "g"),  schoolEx.confess_title);
            cb();
            //});
        },

        function(cb) {
          // var item={}
            login(schoolEx, function(err, results) { //2.1登陆目的账号
                loadResult = results;
                cb();
            });
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

            async.eachSeries(content.multi_item, function(item, callbackPostPic){
                var index = content.multi_item.indexOf(item);
                var req = request.post('https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&ticket_id=' + user_name + '&ticket=' + ticket + '&token=' + loadResult.token + '&lang=zh_CN')
                    .set('Accept', '*/*')
                    .set('Cookie', loadResult.cookie)
                    .set("Accept-Encoding" , "gzip,deflate,sdch")
                    //.set('Connection', 'keep-alive')
                    .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                    .set('Refer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid='+ item.AppMsgId + '&isMul=1')
                    .set('Origin', 'https://mp.weixin.qq.com')
                    .field('Filename', index +'.jpg')
                    .field('folder', '/cgi-bin/uploads')
                    .attach('file', './cache' + index + '.jpg', index + '.jpg')
                    .field('Upload', 'Submit Query')
                    .end(function(res){
                        content.multi_item[index].fileid0 = JSON.parse(res.text).content;
                        var cookie_temp = '';
                        if (res.header['set-cookie']) {
                            _ref = res.header['set-cookie'];
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                rs = _ref[_i];
                                cookie_temp += rs.replace(/HttpOnly/g, '');
                            }
                        }

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

            data.token = loadResult.token;
            data.random = Math.random();
            for(var i = 0; i<articleNum; i++){
                data['content' + i] = content.multi_item[i].content.replace(new RegExp("__user_name__", "g"), user_name);
                data['digest' + i] = content.multi_item[i].digest;
                data['title' + i] = content.multi_item[i].title.replace(new RegExp("__name__", "g"),  schoolEx.cn_short_name);
                data['fileid' + i] = content.multi_item[i].fileid0;
                data['show_cover_pic' + i] = '0';
            }

            data.AppMsgId =schoolEx.appmsgid;

            for (property in data) {
                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                console.log(property + ':' + data[property]);
            }

            request.post('https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=update&type=10&token=' + loadResult.token + '&lang=zh_CN')
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,sdch")
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Refer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token  + '&type=10&appmsgid=' + schoolEx.appmsgid + '&isMul=1')
                .send(sendData)
                .end(function(res){
                    console.log('===========req header==============\n' + res.req['_header'] + '\n================req header end============');
                    console.log('===========res header==============\n');
                    for (property in res.header) {
                        s = property + ": " + res.header[property] + "\n";
                        console.log(s);
                    }

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
          if(err){
              res.send("fail");
          }
           School.getSchoolByEname(school_enname,function(err,school){
               if(school){
                   school.last_edit_at=new Date();
                   school.save();
                   res.send("success");
               }else{


               }
           })


    });
}
