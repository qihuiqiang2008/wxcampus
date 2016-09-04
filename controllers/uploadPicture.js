/**
 * Created by wanghan on 2014/12/11.
 */
/**
 * Created by wanghan on 2014/8/30.
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var async = require('async');
var Resource = require('../proxy').Resource;
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;
var Post = require('../proxy').Post;
var PostEx = require('../proxy').PostEx;
var Photo_Guess = require('../proxy').Photo_Guess;
var fs = require('fs');
var UserImage = require('../proxy').UserImage;
var Configuration = require('../proxy').Configuration;
var config = require('../config').config;
var imageinfo = require('imageinfo');

function TodayFormat() {
    var today = new Date(); // 获取今天时间
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}
function YesTodayFormat() {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - 1); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}

function YYesTodayFormat() {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - 2); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}
exports.uploadPicture = function (req, res, next) {
    var result_json;
    var school_enname = req.query.en_name;
    var loadResult;
    var content;
    var cookie = '';
    var id = req.query.id;
    var group = req.query.group || 1;
    //var filePath = 'D:/campus007/public/front/userImages/' + folder;D:\campusFrom1\public\front\photo_guess
    var filePath = config.photo_dir;
    console.log("----------now upload picture-----------------");
    console.log('school is:' + school_enname);
    async.series([

        function (cb) {
            SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                schoolEx = school;
                //console.log(schoolEx)
                cb();
            })
        },

        function (cb) {
            School.getSchoolByEname(school_enname, function (err, item) {
                school = item;
                cb();
            })
        },

        function (cb) {                          //2.1登陆目的账号
            login(schoolEx, function (err, results) {
                loadResult = results;
                cb();
            });
        },
        function (cb) {//2.2 获取ticket 与user_name
            request.get('https://mp.weixin.qq.com/cgi-bin/home?t=home/index&lang=zh_CN&token=' + loadResult.token) //获取人数
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .end(function (res) {
                    var indexHead = res.text.indexOf('window.wx ={'); //定位到含有图片ticket的位置
                    indexHead = res.text.indexOf('ticket', indexHead);
                    var indexTail = res.text.indexOf('lang', indexHead);
                    var html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                    ticket = html.substring('ticket:'.length + 1, html.length - 2); //将头部的 ‘ticket:’，两头的引号与","都去除掉

                    indexHead = res.text.indexOf('user_name'); //定位到含有user_name的位置
                    indexTail = res.text.indexOf('nick_name', indexHead);
                    html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                    user_name = html.substring('user_name:'.length + 1, html.length - 2); //将头部的 ‘user_name:’，两头的引号与","都去除掉
                    //  console.log("user name is " + user_name + "\nticket is " + ticket);
                    cb();
                });
        },

        function (cb) {                  //2.3 上传图片
            Configuration.getConfigurationByCode("photo_guess", function (err, day) {
                Configuration.getConfigurationByCode(DateFormat(7), function (err, start_cfg) {

                    Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
                        var query = {en_name: school_enname, create_at: {
                            "$gt": new Date(start_cfg.value)
                        }};
                        if (id) {
                            query = {_id: id,create_at: {
                                "$gt": new Date(start_cfg.value)
                            }};
                        }
                        Photo_Guess.getPhoto_GuessByQuery(query, {}, function (err, photo_guesss) {
                            async.eachSeries(photo_guesss, function (photo_guess, callbackPostPic) {
                                if (photo_guess.wx_photo_url && (!id)) {
                                    console.log('------------imagealready exit, skip!------------');

                                    callbackPostPic();
                                }
                                else if (!(photo_guess.photo_url)) {
                                    callbackPostPic();
                                } else {
                                    var date = photo_guess.create_at;
                                    var fileName = date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate() + "/" + photo_guess._id + ".jpg";
                                    //if (photo_guess.must_anwser&&photo_guess.type=="photo_guess") {
                                        //fileName = date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate() + "/" + photo_guess._id + "welife.jpg";
                                    //}
                                    console.log(filePath + '/' + fileName)
                                    fs.exists(filePath + '/' + fileName, function (exists) {
                                        console.log("是否存在"+exists);
                                        if (exists) {


                                            fs.readFile(filePath + '/' + fileName, function (err, data) {
                                                if (err) throw err;

                                                info = imageinfo(data);
                                                console.log("Data is type:", info.mimeType);
                                                console.log("  Size:", data.length, "bytes");
                                                console.log("  Dimensions:", info.width, "x", info.height);
                                                var req = request.post('https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&writetype=doublewrite&groupid=1&ticket_id=' + user_name + '&ticket=' + ticket + '&token=' + loadResult.token + '&lang=zh_CN')
                                                    .set('Accept', '*/*')
                                                    .set('Cookie', loadResult.cookie)
                                                    .set("Accept-Encoding", "gzip,deflate,sdch")
                                                    //.set('Connection', 'keep-alive')
                                                    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                                    .set('Referer', ' https://mp.weixin.qq.com/cgi-bin/filepage?type=3&begin=0&count=20&t=media/list&token=' + loadResult.token + '&lang=zh_CN')
                                                    .set('Origin', 'https://mp.weixin.qq.com')
                                                    .field('Filename', fileName)
                                                    .field('folder', '/cgi-bin/uploads')
                                                    .attach('file', filePath + '/' + fileName)
                                                    .field('Upload', 'Submit Query')
                                                    .end(function (res) {
                                                        var fileid = JSON.parse(res.text).content;
                                                        request.get('https://mp.weixin.qq.com/cgi-bin/filepage?type=2&begin=0&count=12&t=media/img_list&token=' + loadResult.token + '&lang=zh_CN') //从此页面提取图片url
                                                            .set('Cookie', loadResult.cookie)
                                                            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                                            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                                            .end(function (res) {
                                                                var indexHead = res.text.indexOf('"file_id":' + fileid);
                                                                indexHead = res.text.indexOf('cdn_url', indexHead);
                                                                var indexTail = res.text.indexOf('}', indexHead);
                                                                var html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                                                                var pic_url = html.substring(10, html.length - 1).replace(/\\/g, ''); //将头部的 ‘cdm_url’，两头的引号与","都去除掉
                                                                console.log("picture url is :" + pic_url.replace(/\\/g, ''));
                                                                //  console.log("user name is " + user_name + "\nticket is " + ticket);
                                                                photo_guess.wx_photo_url = pic_url;
                                                                photo_guess.save();
                                                                callbackPostPic();
                                                            });
                                                    });


                                            });


                                        } else {

                                            callbackPostPic();
                                        }
                                    })

                                }
                            }, function (err) {
                                if (err) {
                                    console.log('err while upload  pic!!!');
                                }
                                cb();
                            });
                        });
                    })
                })
            })
        },
        function (cb) {                  //2.3 上传图片
            Configuration.getConfigurationByCode("photo_guess", function (err, day) {
                Configuration.getConfigurationByCode(DateFormat(day.value), function (err, start_cfg) {
                    Configuration.getConfigurationByCode(TodayFormat(), function (err, end_cfg) {
                        var query = {from_school_en_name: school_enname, create_at: {
                            "$gt": new Date(start_cfg.value)
                        }};
                        if (id) {
                            query = {_id: id, create_at: {
                                "$gt": new Date(start_cfg.value)
                            }};
                        }
                        PostEx.getPostExsByQuery(query, {}, function (err, postexs) {
                            console.log(postexs.length + "###");
                            async.eachSeries(postexs, function (post, callbackPostPic) {
//                            if(post.image&&(!id)){
//                                callbackPostPic();
//                                console.log('------------imagealready exit, skip!------------');
//                            }
//                            else
                                if (!(post.image)) {
                                    callbackPostPic();
                                } else {
                                    var date = post.create_at;
                                    var fileName = date.getFullYear() + "" + (date.getMonth() + 1) + "" + date.getDate() + "/" + post._id + ".jpg";
                                    fs.exists(filePath + '/' + fileName, function (exists) {
                                        if (exists) {
                                            var req = request.post('https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&writetype=doublewrite&groupid=1&ticket_id=' + user_name + '&ticket=' + ticket + '&token=' + loadResult.token + '&lang=zh_CN')
                                                .set('Accept', '*/*')
                                                .set('Cookie', loadResult.cookie)
                                                .set("Accept-Encoding", "gzip,deflate,sdch")
                                                //.set('Connection', 'keep-alive')
                                                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                                .set('Referer', ' https://mp.weixin.qq.com/cgi-bin/filepage?type=3&begin=0&count=20&t=media/list&token=' + loadResult.token + '&lang=zh_CN')
                                                .set('Origin', 'https://mp.weixin.qq.com')
                                                .field('Filename', fileName)
                                                .field('folder', '/cgi-bin/uploads')
                                                .attach('file', filePath + '/' + fileName)
                                                .field('Upload', 'Submit Query')
                                                .end(function (res) {
                                                    var fileid = JSON.parse(res.text).content;
                                                    request.get('https://mp.weixin.qq.com/cgi-bin/filepage?type=2&begin=0&count=12&t=media/img_list&token=' + loadResult.token + '&lang=zh_CN') //从此页面提取图片url
                                                        .set('Cookie', loadResult.cookie)
                                                        .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                                        .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                                        .end(function (res) {
                                                            var indexHead = res.text.indexOf('"file_id":' + fileid);
                                                            indexHead = res.text.indexOf('cdn_url', indexHead);
                                                            var indexTail = res.text.indexOf('}', indexHead);
                                                            var html = res.text.slice(indexHead, indexTail).trim();  //截取部分html
                                                            var pic_url = html.substring(10, html.length - 1).replace(/\\/g, ''); //将头部的 ‘cdm_url’，两头的引号与","都去除掉
                                                            console.log("picture url is :" + pic_url.replace(/\\/g, ''));
                                                            //  console.log("user name is " + user_name + "\nticket is " + ticket);
                                                            post.wx_photo_url = pic_url;
                                                            post.save();
                                                            callbackPostPic();
                                                        });
                                                });

                                        } else {
                                            callbackPostPic();
                                        }
                                    })

                                }
                            }, function (err) {
                                if (err) {
                                    console.log('err while upload  pic!!!');
                                }
                                cb();
                            });
                        });
                    })
                })
            })
        }
        /*,

        function (cb) { //2.5 登出
            request('https://mp.weixin.qq.com/cgi-bin/logout?t=wxm-logout&lang=zh_CN&token=' + loadResult.token)
                .set('Cookie', loadResult.cookie)
                .set("Accept-Encoding", "gzip,sdch")
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .end(function (res) {
                    console.log('==========logout=================');
                    cb();
                })
        }*/
    ], function (err, results) {
        if (err) {
            return   res.send({success: false});
        }
        return res.send({success: true});
    });
}


function DateFormat(number) {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - number); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}