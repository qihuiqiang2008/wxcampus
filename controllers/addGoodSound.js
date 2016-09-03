/**
 * Created by wanghan on 2014/12/1. 用于添加好声音
 */

require('../wx_helpers/md5');
var request = require("superagent");
var login = require( __dirname + '/../wx_helpers/login');
var async = require('async');
var Resource = require('../proxy').Resource;
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;
var fs = require('fs');

exports.addFile = function(req, res, next){
    console.log("========Get Good Sound file!============");
    // 指定文件上传后的目录 - 示例为"images"目录。

    console.log(req.files.file);
    if(req.files){
        fs.rename("./uploads/" + req.files.file.name, "./uploads/" + req.files.file.originalname, function(err){
            if(err){
                console.log("upload file err!");
                throw err;
            }
            res.send('File uploaded Done');
        });
    }
}

exports.addGoodSound = function(req, res, next){
    var result_json;
    var school_enname= req.query.school_enname;
    var loadResult;
    var index = req.query.index; //index 决定了好声音的规则名，关键字，和上传素材的名字。
    var type = req.query.type;

    async.series([

        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                schoolEx = school;
                cb();
            })
        },

        function(cb) {                          //2.1登陆目的账号
            login(schoolEx, function(err, results) {
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
                    var indexHead = res.text.indexOf('window.wx ={'); //定位到含有图片ticket的位置
                    indexHead = res.text.indexOf('ticket', indexHead);
                    var indexTail = res.text.indexOf('lang', indexHead);
                    var html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                    ticket = html.substring('ticket:'.length + 1, html.length - 2); //将头部的 ‘ticket:’，两头的引号与","都去除掉

                    indexHead = res.text.indexOf('user_name'); //定位到含有user_name的位置
                    indexTail = res.text.indexOf('nick_name', indexHead);
                    html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                    user_name = html.substring('user_name:'.length + 1, html.length - 2); //将头部的 ‘user_name:’，两头的引号与","都去除掉
                    //console.log("user name is " + user_name + "\nticket is " + ticket);
                    cb();
                });
        },

        function(cb) {                  //2.3 上传好声音
            var suffix;
            if(type =="2"){
                suffix = '.jpg';
            } else {
                suffix = '.mp3'
            }

            var req = request.post('https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&writetype=doublewrite&groupid=1&ticket_id=' + user_name + '&ticket=' + ticket + '&token=' + loadResult.token + '&lang=zh_CN')
                .set('Accept', '*/*')
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,deflate,sdch")
                //.set('Connection', 'keep-alive')
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/filepage?type=3&begin=0&count=20&t=media/list&token=' + loadResult.token + '&lang=zh_CN')
                .set('Origin', 'https://mp.weixin.qq.com')
                .field('Filename', index + suffix)
                .field('folder', '/cgi-bin/uploads')
                .attach('file', './uploads/' + index + suffix, index + suffix)
                .field('Upload', 'Submit Query')
                .end(function(res){
                    fileid = JSON.parse(res.text).content;
                    //console.log(res.text);
                    console.log('sound fileid is:' + fileid);
                    cb();
                });
        },

        function(cb) {      //设置关键字
            var uploadType;
            if(type == "2"){
                uploadType = '2';
            } else {
                uploadType = '3'
            }

            var data = {
                token:loadResult.token,
                ajax:'1',
                allreply:'0',
                content0:'',
                f:'json',
                fileid0:fileid,
                keyword0:index,
                keywordcnt:'1',
                lang:'zh_CN',
                matchmode0:'0',
                random:Math.random(),
                replycnt:'1',
                replytype:'smartreply',
                ruleid:'0',
                rulename:index,
                type0:uploadType
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
                    //  console.log('==========logout=================');
                    cb();
                })
        }
    ], function(err, results) {
        if(err){
            res.send("fail");
        }
        res.send(result_json.base_resp);
    });
}
