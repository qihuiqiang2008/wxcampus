/**
 * Created by wanghan on 2014/10/25.
 */

require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var async = require('async');
var fs = require('fs');
var Resource = require('../proxy').Resource;
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;
var ent = require('ent');
var articleNum = 4;
var Configuration = require('../proxy').Configuration;


function replaceContent(e) {
    var t = [ "&", "&amp;", "<", "&lt;", ">", "&gt;", " ", "&nbsp;", '"', "&quot;", "'", "&#39;" ];
    t.reverse();
    for (var n = 0; n < t.length; n += 2) e = e.replace(new RegExp(t[n], "g"), t[1 + n]);
    return e;
}

exports.previewMessage = function(req, res, next){
    //获取消息
    var query = req.query.user;
    var loadResult;
    var content;
    var school_enname= req.query.school_enname;
    var previewId = req.query.preuser;
    var result_json;
  if(req.query.articleNum){
      articleNum=req.query.articleNum;
  }
    console.log(articleNum);
    async.series([
        function(cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                schoolEx = school;
                // console.log(schoolEx)
                cb();
            })
        },
        function(cb) {//1.1：登陆
            login(schoolEx, function(err, results) {
                loadResult = results;

                cb();
            });
        },
        function(cb) {//1.1：登陆到素材源。
            Configuration.getConfigurationByCode("getSourceSchool", function (err, s) {

                previewId=s.value.split('|')[5];
                /*contentSource = {
                    en_name: s.value.split('|')[0],
                    wx_account_id: s.value.split('|')[1],
                    wx_account_password: s.value.split('|')[2],
                    msgId: s.value.split('|')[4]
                };
                if(IsAdtype){
                    school_enname=contentSource.en_name;
                }*/

                cb();
            })
        },

        function(cb) {      //  获取素材内容
            request.get('https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid='+ schoolEx.appmsgid + '&isMul=1')
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
                    cb();
                });
        },

        function(cb) {      //2.4 上传文章内容
            var data = {
                token:loadResult.token,
                lang:'zh_CN',
                f:'json',
                ajax:'1',
                random:Math.random(),
                AppMsgId:schoolEx.appmsgid,
                count:articleNum + ''
            };

            for(var i = 0; i<articleNum; i++){
                data['title' + i] = content.multi_item[i].title;
                data['content' + i] = content.multi_item[i].content;
                data['digest' + i] = content.multi_item[i].digest;
                data['author' + i] = content.multi_item[i].author;
                data['fileid' + i] = content.multi_item[i].file_id;
                data['show_cover_pic' + i] = '0';
                data['sourceurl' + i] = ent.decode(content.multi_item[i].source_url);
            }
            data.vid = '';
            data.preusername = previewId;
            data.imgcode = '';
            var sendData = '';

            for (property in data) {
                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                console.log(property + ':' + data[property]);
            }

            //预览消息
            request.post('https://mp.weixin.qq.com/cgi-bin/operate_appmsg?sub=preview&t=ajax-appmsg-preview&type=10&token=' + loadResult.token + '&lang=zh_CN')
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,sdch")
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token  + '&type=10&appmsgid=' + schoolEx.appmsgid + '&isMul=1')
                .set('X-Requested-With', 'XMLHttpRequest')
                .send(sendData)
                .end(function(res){
                    console.log(res.text);
                    result_json=JSON.parse(res.text);
                    cb();
                })
        }
     /*   ,

        function(cb){ //2.5 登出
            request('https://mp.weixin.qq.com/cgi-bin/logout?t=wxm-logout&lang=zh_CN&token=' + loadResult.token)
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding" , "gzip,sdch")
                .set('User-Agent' , 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .end(function(res){
                    console.log('==========logout=================');
                    cb();
                })
        }*/
        ], function(err, results) {
        if(err){
            res.send("fail");
            console.log('=========preview fail=================');
        }

        res.send(result_json);
        console.log('=========preview done================');

    });

}