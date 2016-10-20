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
var fs = require('fs');
var ent = require('ent');
var cheerio = require('cheerio');

var articleNum = 4;         //试验采用两篇文章
var Configuration = require('../proxy').Configuration;

function replaceContent(content, schoolEx, face) {
    var contentFunnl = content.replace(new RegExp('__topic_content__', "g"), schoolEx.topic_content)
        .replace(new RegExp('__confession_content__', "g"), schoolEx.confess_content.replace("赞", "zan"))
        .replace(new RegExp('__secret_content__', "g"), schoolEx.secret_content.replace("赞", "zan"))
        .replace(new RegExp('__info_content__', "g"), schoolEx.info_content.length > 0 ? schoolEx.info_content.replace("赞", "zan") : "暂无生活信息，如果大家有闲置二手物品或者失物招领等都可以写哦..记得附加上联系方式")
        .replace(new RegExp("_account_name_", "g"), schoolEx.wx_account_name)
        .replace(new RegExp("_erweima_", "g"), "<img src='" + schoolEx.erweima + "'/>");

    if(schoolEx.ershou_content&&schoolEx.zipai_content&&schoolEx.photo_guess_content){
        contentFunnl=contentFunnl.replace(new RegExp('__ershou_content__', "g"), schoolEx.ershou_content)
            .replace(new RegExp("__zipai_content__", "g"), schoolEx.zipai_content)
            .replace(new RegExp('__photo_guess_content__', "g"), schoolEx.photo_guess_content.replace("赞", "zan"))
    }




    return contentFunnl
    //

}
var replaceAll = function (find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
}

function replaceTitle(title, schoolEx) {
    return title.replace(new RegExp("__topic_title__", "g"), schoolEx.topic_title)
        .replace(new RegExp("__photo_guess_title__", "g"), schoolEx.photo_guess_title)
        .replace(new RegExp("__confession_title__", "g"), schoolEx.confess_title)
        .replace(new RegExp("__ershou_title__", "g"), schoolEx.ershou_title)
        .replace(new RegExp("__friend_title__", "g"), schoolEx.friend_title)
        .replace(new RegExp("__info_title__", "g"), schoolEx.info_title)
        .replace(new RegExp("__zipai_title__", "g"), schoolEx.zipai_title)
        .replace(new RegExp("__secret_title__", "g"), schoolEx.secret_title);
    ;
}

function linkify(text) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
        return url;
    });
}


exports.uploadTest = function (req, res, next) {
}

function extractMSg(i, content, cb) {
    console.log("---------" + content.multi_item[i].content);
    var regexp = new RegExp("(http[s]{0,1}|ftp)://[a-zA-Z0-9\\.\\-]+\\.([a-zA-Z]{2,4})(:\\d+)?(/[a-zA-Z0-9\\.\\-~!@#$%^&*+?:_/=<>]*)?", "gi");
    var urls = content.multi_item[i].content.match(regexp);
    if (urls) {
        if (urls[0].split("@@@@").length > 0) {
            var url = urls[0].split("@@@@")[0]
            request.get(url)
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .end(function (res) {
                    if (res.ok) {
                        console.log(res.text)
                        var start_msg_title = res.text.indexOf("var msg_title =");
                        var start_msg_desc = res.text.indexOf("var msg_desc =");
                        var start_msg_cdn_url = res.text.indexOf("var msg_cdn_url =");
                        var start_msg_link = res.text.indexOf("var msg_link =");
                        var start_user_uin = res.text.indexOf("var user_uin =");
                        var start_msg_source_url = res.text.indexOf("var msg_source_url =");
                        var start_img_format = res.text.indexOf("var img_format =");
                        var msg_title = res.text.substring(start_msg_title + "var msg_title =".length, start_msg_desc).trim()
                        var msg_desc = res.text.substring(start_msg_desc + "var msg_desc =".length, start_msg_cdn_url).trim()
                        var msg_cdn_url = res.text.substring(start_msg_cdn_url + "var msg_cdn_url =".length, start_msg_link).trim().replace("\"", "").replace("\";", "");
                        var msg_link = res.text.substring(start_msg_link + "var msg_link =".length, start_user_uin).trim().replace("\"", "");
                        var msg_source_url = res.text.substring(start_msg_source_url + "var msg_source_url =".length, start_img_format).trim().replace("\"", "").replace("'", "").replace("';", "");
                        var $ = cheerio.load(res.text, {decodeEntities: false});
                        var stream = fs.createWriteStream('./cache' + count + '.jpg');
                        request.get(msg_cdn_url)
                            .set({"Accept-Encoding": "gzip,sdch"})
                            .set('Accept', 'image/png,image/*;q=0.8,*/*;q=0.5')
                            .pipe(stream);
                        content.multi_item[i].content = $('#js_content').html();
                        content.multi_item[i].title = msg_title;
                        content.multi_item[i].author = "";
                        content.multi_item[i].digest = msg_desc;
                        content.multi_item[i].cdn_url = msg_cdn_url;
                        content.multi_item[i].can_reward = 0;
                        content.multi_item[i].copyright_type = 0;
                        content.multi_item[i].source_url = msg_source_url;
                        cb();
                    }
                });
        }
    }


}


exports.uploadSingle = function (req, res, next) {
    var regexp = new RegExp("(http[s]{0,1}|ftp)://[a-zA-Z0-9\\.\\-]+\\.([a-zA-Z]{2,4})(:\\d+)?(/[a-zA-Z0-9\\.\\-~!@#$%^&*+?:_/=<>]*)?", "gi");
    try {
        var result_json;
        var school_enname = req.query.school_enname;
        var loadResult;
        var content;
        var cookie = '';
        var sendData = '';
        var userID = '';
        var group = req.session.user.location.belong_group;
        var articleNum2 = req.query.article;
        var sourceFlag = req.query.flag;
        var tianqi = "....";
        var face = "";
        var contentSource = {
            en_name:"",
            wx_account_id:"bnu_welife@163.com",
            wx_account_password:"zgyfjch2013",
            msgId:"503031861"

        };
        var IsAdtype=true;
        console.log(school_enname)
        if(school_enname!=""){
            IsAdtype=false;
        }
        console.log(IsAdtype)

        articleNum = articleNum2;
        async.series([

            function (cb) {
                Resource.getTodayResource(function (err, resource) {
                    console.log(resource);
                    content = JSON.parse(resource.content);
                    cb();
                });
            },
            function (cb) {
                Configuration.getConfigurationByCode("face", function (err, faceconfig) {
                    //  console.log(resource.content);
                    face = faceconfig.value;
                    cb();
                });
            },
            function(cb) {//1.1：登陆到素材源。
                Configuration.getConfigurationByCode("getSourceSchool", function (err, s) {
                    contentSource = {
                        en_name: s.value.split('|')[0],
                        wx_account_id: s.value.split('|')[1],
                        wx_account_password: s.value.split('|')[2],
                        msgId: s.value.split('|')[4]
                    };
                    if(IsAdtype){
                        school_enname=contentSource.en_name;
                    }

                    cb();
                })
            },
            function (cb) {
                console.log("---"+school_enname)
                SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                    schoolEx = school;
                    if(IsAdtype){
                        schoolEx.appmsgid=contentSource.msgId;
                    }
                    var faces = face.split("|");
                    for (var i = 0; i < faces.length; i++) {
                        var url = faces[i].split(";")[0];
                        var text = faces[i].split(";")[1];
                        schoolEx.confess_content = replaceAll("[" + text + "]", "<img data-type='gif' data-src='" + url + "' style='width: auto !important; height: auto !important; visibility: visible !important;' data-ratio='1' data-w='22' src='" + url + "&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1' data-fail='0'>", schoolEx.confess_content);
                    }
                    cb();
                })
            },

            function (cb) {
                School.getSchoolByEname(school_enname, function (err, item) {
                    school = item;
                    cb();
                })
            },
            function (cb) {
                var i=0;
                async.eachSeries(content.multi_item, function (item, callreplace) {
                    if(!IsAdtype){
                        item.content = replaceContent(item.content, schoolEx, face);
                        item.title = replaceTitle(item.title, schoolEx);
                    }
                    if (item.title.split("广@告").length > 1) {
                        var url =item.content.replace("<p>","").replace("</p>","").split('amp;').join('');
                        if (url) {
                            console.log("---------============+"+url)
                            request.get(url)
                                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                .end(function (res) {
                                    if (res.ok) {
                                        //console.log(res.text)
                                        var start_msg_title = res.text.indexOf("var msg_title =");
                                        var start_msg_desc = res.text.indexOf("var msg_desc =");
                                        var start_msg_cdn_url = res.text.indexOf("var msg_cdn_url =");
                                        var start_msg_link = res.text.indexOf("var msg_link =");
                                        var start_user_uin = res.text.indexOf("var user_uin =");
                                        var start_msg_source_url = res.text.indexOf("var msg_source_url =");
                                        var start_img_format = res.text.indexOf("var img_format =");
                                        var msg_title = res.text.substring(start_msg_title + "var msg_title =".length, start_msg_desc).trim().replace("\"", "").replace("\";", "");
                                        var msg_desc = res.text.substring(start_msg_desc + "var msg_desc =".length, start_msg_cdn_url).trim()
                                        var msg_cdn_url = res.text.substring(start_msg_cdn_url + "var msg_cdn_url =".length, start_msg_link).trim().replace("\"", "").replace("\";", "");
                                        var msg_link = res.text.substring(start_msg_link + "var msg_link =".length, start_user_uin).trim().replace("\"", "");
                                        var msg_source_url = res.text.substring(start_msg_source_url + "var msg_source_url =".length, start_img_format).trim().replace("\"", "").replace("'", "").replace("';", "");
                                        msg_source_url= ent.decode(msg_source_url);
                                        if(!msg_source_url){
                                            msg_source_url='';
                                        }
                                        msg_title= ent.decode(msg_title);

                                        msg_desc= ent.decode(msg_desc);


                                        var $ = cheerio.load(res.text, {decodeEntities: false});
                                        var stream = fs.createWriteStream('./cache' + i + '.jpg');
                                        request.get(msg_cdn_url)
                                            .set({"Accept-Encoding": "gzip,sdch"})
                                            .set('Accept', 'image/png,image/*;q=0.8,*/*;q=0.5')
                                            .pipe(stream);
                                        item.content = $('#js_content').html().trim();
                                        console.log("---------------")

                                        item.title = msg_title;
                                        item.author = "";
                                        item.digest = msg_desc;
                                        item.cdn_url = msg_cdn_url;
                                        item.can_reward = 0;
                                        item.copyright_type = 0;
                                        item.source_url = msg_source_url;
                                        i++;
                                       callreplace();
                                    }
                                });
                        } else {
                            callreplace()
                        }
                    } else {
                        callreplace();
                    }
                }, function (err) {
                    if (err) {
                        console.log('err while upload  pic!!!');
                    }
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

                async.eachSeries(content.multi_item, function (item, callbackPostPic) {
                    var index = content.multi_item.indexOf(item);
                    //  console.log(item);
                    var req = request.post('https://mp.weixin.qq.com/cgi-bin/filetransfer?action=upload_material&f=json&writetype=doublewrite&groupid=1&ticket_id=' + user_name + '&ticket=' + ticket + '&token=' + loadResult.token + '&lang=zh_CN')
                        .set('Accept', '*/*')
                        .set('Cookie', loadResult.cookie)
                        .set("Accept-Encoding", "gzip,deflate,sdch")
                        //.set('Connection', 'keep-alive')
                        .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                        .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid=' + item.AppMsgId + '&isMul=1')
                        .set('Origin', 'https://mp.weixin.qq.com')
                        .field('Filename', index + '.jpg')
                        .field('folder', '/cgi-bin/uploads')
                        .attach('file', './cache' + index + '.jpg', index + '.jpg')
                        .field('Upload', 'Submit Query')
                        .end(function (res) {
                            if (res.ok) {
                                console.log("-----------ok--------------------------------------------------------------------")
                            } else {
                                console.log("-----------no--------------------------------------------------------------------")
                            }
                            content.multi_item[index].fileid0 = JSON.parse(res.text).content;
                            console.log('pic fileid is:' + content.multi_item[index].fileid0);
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
                }, function (err) {
                    if (err) {
                        console.log('err while upload  pic!!!');
                    }
                    cb();
                })
            },

            function (cb) {      //2.4 上传文章内容
                var data = {
                    ajax: '1',
                    count: articleNum + '',
                    f: 'json',
                    lang: 'zh_CN',
                    fee0: '0', // 2016.4.24 add by wanghan
                    isbn0: '',
                    music_id0: '',
                    video_id0: '',
                    shortvideofileid0: ''
                };

                data.token = loadResult.token;
                data.random = Math.random();
                data.AppMsgId = schoolEx.appmsgid;

                //console.log("content is :");
                //  console.log(content.multi_item[0]);
                if (user_name == "meirixiaogushi") {
                    user_name = "nxu-fuwu"
                }
                for (var i = 0; i < articleNum; i++) {
                    console.log("------" + articleNum)
                    console.log("----------" + i)

                    data['digest' + i] = content.multi_item[i].digest;
                    data['author' + i] = content.multi_item[i].author; //add by wanghan 20160630
                    if(!IsAdtype){
                        data['title' + i] = content.multi_item[i].title.replace(new RegExp("__name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_short_name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_name__", "g"), schoolEx.cn_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code);
                        ;

                        data['content' + i] = content.multi_item[i].content.replace(new RegExp("__user_name__", "g"), user_name).replace(new RegExp("__name__", "g"), schoolEx.cn_short_name).replace(new RegExp("_account_name_", "g"), schoolEx.wx_account_name).replace(new RegExp("__school_short_name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_name__", "g"), schoolEx.cn_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code);

                        if (sourceFlag != undefined) {
                            data['sourceurl' + i] = school.wx_account_url.replace(new RegExp("__user_name__", "g"), user_name).replace(new RegExp("__name__", "g"), schoolEx.en_name).replace(new RegExp("_account_name_", "g"), schoolEx.wx_account_name).replace(new RegExp("__school_short_name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_name__", "g"), schoolEx.cn_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code);

                        } else {
                            data['sourceurl' + i] = ent.decode(content.multi_item[i].source_url.replace(new RegExp("__user_name__", "g"), user_name).replace(new RegExp("__name__", "g"), schoolEx.en_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code));
                        }

                    }else{
                        data['title' + i] = content.multi_item[i].title;
                        data['content' + i] = content.multi_item[i].content;
                        data['sourceurl' + i] = content.multi_item[i].source_url;
                    }
                    data['fileid' + i] = content.multi_item[i].fileid0;
                    data['show_cover_pic' + i] = '0';
                    data['cdn_url' + i] = content.multi_item[i].cdn_url;
                    data['copyright_type' + i] = content.multi_item[i].copyright_type;
                    data['can_reward' + i] = content.multi_item[i].can_reward;
                    data['reward_wording' + i] = '';
                    data['need_open_comment' + i] = '0';
                    data['only_fans_can_comment' + i] = '0';
                    //data['sourceurl' + i] = '';
                    data['free_content' + i] = '';




                }
                //console.log("----CONTENT-------");
                for (property in data) {
                    sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                    console.log(property + ':' + data[property]);
                }
                console.log(sendData);
                request.post('https://mp.weixin.qq.com/cgi-bin/operate_appmsg?t=ajax-response&sub=update&type=10&token=' + loadResult.token + '&lang=zh_CN')
                    .set('Accept', 'application/json, text/javascript, */*; q=0.01')
                    .set("Accept-Encoding", "gzip, deflate, br")
                    .set('Accept-Language', 'zh-CN,zh;q=0.8')
                    .set('Connection', 'keep-alive')
                    .set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
                    .set('Cookie', loadResult.cookie)
                    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36')
                    .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid=' + schoolEx.appmsgid + '&isMul=1')
                    .set('Origin', 'https://mp.weixin.qq.com')
                    .set('X-Requested-With', 'XMLHttpRequest')
                    .send(sendData)
                    .end(function (res) {
                        if (res.ok) {
                            console.log("-----------ok--------------------------------------------------------------------")
                        } else {
                            console.log("-----------no--------------------------------------------------------------------")
                        }
                        console.log('===========req header==============\n' + res.req['_header'] + '\n================req header end============');
                        console.log('===========res header==============\n');
                        for (property in res.header) {
                            s = property + ": " + res.header[property] + "\n";
                            //  console.log(s);
                        }
                        result_json = JSON.parse(res.text);
                        console.log(res.text);
                        cb();
                    })
            }
            /*  ,

             function (cb) { //2.5 登出
             request('https://mp.weixin.qq.com/cgi-bin/logout?t=wxm-logout&lang=zh_CN&token=' + loadResult.token)
             .set('Cookie', loadResult.cookie)
             .set("Accept-Encoding", "gzip,sdch")
             .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
             .end(function (res) {
             //  console.log('==========logout=================');
             cb();
             })
             }*/
        ], function (err, results) {
            if (err) {
                res.send("fail");
            }
            console.log(articleNum);
            School.getSchoolByEname(school_enname, function (err, school) {
                if (school) {
                    // school.last_edit_at=new Date();
                    school.save();
                    res.send(result_json);
                } else {
                    res.send("fail");
                }
            })
        });
    } catch (e) {
        console.log("---------------------e----------")
    }
}


function TodayFormat() {
    var today = new Date(); // 获取今天时间
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}
function YesTodayFormat() {
    var today = new Date(); // 获取今天时间
    today.setDate(today.getDate() - 1); // 系统会自动转换
    return today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
}


/*微信
 data-previewsrc="[a-zA-z]+://[^\s]*    **/
/*data-label=".....    */

/*
 data-previewsrc="[a-zA-z]+://[^\s]*|data-label=".....
 */


/*空白:   \n\s* */


/*表情1
 https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAmkGjO5wPRQiaad0sXcm4kqZnBUnHFl3yfycYARIHZnG9zUzvLLVKfLw/0?wx_fmt=gif;ok|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaARsycXLeqx3ZyFP4srxM8kaV1koAvxAt7H5loDnX6RFib88NTtNev4mw/0?wx_fmt=gif;NO|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA3KzYT1l6t6HET4bVJ8ib8G64KxLiceLFmZiay6t8BCk6qmzMGH0mnIIGw/0?wx_fmt=gif;haha.|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0UnUxh8FQEPrW0pgnDJmJAUco0dPQiaaemVvVqHibicYzCialIiahvmSYmw/0?wx_fmt=gif;good.|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAjxtyqzRLlpwsbmPX8HacKgib9Ajph8ZG5ibtnicwbhzQqqHNt1Tiaph1fg/0?wx_fmt=gif;作揖|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAm559CkSwXw7UAGNYAGCE9UVbvRLKXfrd4PaNTkQsboQCo0jUfIB6jQ/0?wx_fmt=gif;左哼哼|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAefXw3EhqbibAzibqhysjr5DicH9Rqias9NibOaIr7VB4ricpbj4Atl55TtJg/0?wx_fmt=gif;左抱抱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABb7yzDLZelOiblV95LoedXcWAkWqJl0959ywm0bEdpSwuvM6picnJg2Q/0?wx_fmt=gif;最差|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA32GXcRHsr2MRziahrZnwaR5RkLHHKlYCottlcNECGJy3jcJicuxiakOlg/0?wx_fmt=gif;抓狂|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAvNQcPAymS9QS1icXtRqAnhbtO8CicDKARlKP5pnrO5nTgJNuucxwgsyg/0?wx_fmt=gif;赞|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAqhLQcQYt01ic0a9tIyeic3hczQdMCU0tVobxeia2Sb9djicTCddY0RZlNQ/0?wx_fmt=gif;晕|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAlnsOibeJOvky3EZJgqhvBAB9s81OuRjNHTghzUlPRX5FicJf9BXqMYrw/0?wx_fmt=gif;右哼哼|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAVSohry7pzWkC5Id5mibEW8ibVmjN79eEToWmsObwwp91TH90NLuRUVIA/0?wx_fmt=gif;右抱抱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaArgV6R3np2fsUdKSu5ExaoxR3R9HjrfePHqsys4c2q0s5NLu4mqcK7A/0?wx_fmt=gif;阴险|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAice7f9tjUCiciaUBecRqwTR0k9XMLd2jXtws7WBYSNZV66YZVYx8DGFzQ/0?wx_fmt=gif;疑问|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA9Msj4BAy70D8k9bYT2BcoIeeS3NefvDGVkrgicoxNdlGxyMRlplz1Kg/0?wx_fmt=gif;耶|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAdsotG7OMUgZbE5FrNc2MlK6eibXKmZtVCWk6LZXtvuOKD8eB5odswow/0?wx_fmt=gif;嘘|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAicgyV9ASofHIM5sgEL9P5iaQbjuQiaEfV9zzFRXtvlfvwWLqRpwuOaGOA/0?wx_fmt=gif;心|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEYESI7SeiaTatttJNELicmsaEjf5jK8rP1hoMxFboicPrCjibicV1hUibicGw/0?wx_fmt=gif;笑cry.|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAlbicgNVWN0x1ujrYakpPT7aMGKr6e0kCssf4erVk0PwFhtLEsQicIdkw/0?wx_fmt=gif;嘻嘻|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAibIty89pDMZBq55ABWKBiaBrMhhz91whvibpv3XK8J0JSNX47Fmty9Dzg/0?wx_fmt=gif;握手|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAu4dCMFdTkFSicvdG1icsWicqUxvtj0bfxbX6g5thG4kOK92wQKJPhPY5w/0?wx_fmt=gif;委屈|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAIkTjsTsufHE3ibg04Pk29PFLMFyEWAygibYcqrn7PY4U5iamtJhJfaO6Q/0?wx_fmt=gif;微笑|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAILy8fydVjYxzFxXiaPJ06ddebuaz6LLU5x1la2ickxtD6CqYNYE5hyicA/0?wx_fmt=gif;挖鼻|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaANDEiaW7ibJaPmdnQxRicJWj0BgvSUHbLIFNL6asLibu8LQ0v5IdtIHTTXQ/0?wx_fmt=gif;吐|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAHKsHh9Wo7nrdIqgF5uZMsEaGKEYicK18MYQTSFqbxMnQWib5yZWASWQw/0?wx_fmt=gif;偷笑|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAdWGWWYlT2b6Qfia6yGGhdOIkE6PdXxKgCHJI3zBf7w5k4Xzx5fJm29A/0?wx_fmt=gif;太开心|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaArdKIQohDZYtyicFzFRqU1Ywt7GuVkkhTIUP4CE2SeiaRLuphGXy366Qw/0?wx_fmt=gif;思考|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABxTKq0I0QjAYBKSU4DqX3knEk4Yn4UdctMvVuHOa7pwkbjNIEgia3Iw/0?wx_fmt=gif;睡|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAd3wD1XLWfVibuuAxDWrwv5DbpND0zcGG6lpLfV588nmib0x8JlAgAazw/0?wx_fmt=gif;衰|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAo5TtRZiacwM5rX5gicVk66NOcb8OXq1pbRa4TI8fCmfIWuV8qWoYFN1w/0?wx_fmt=gif;书呆子|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAO0gZ1mlKlroM8BKRvGNIe2icEPRGhZ9WLdQz4ibR2ScxtiaG8FicG2Qa0w/0?wx_fmt=gif;失望|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA4sib7iasicfloibBr0tJKCJF1G3iardzhUwfuHKxuicibNEJS2Hk89qvNxYxw/0?wx_fmt=gif;生病|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaACficmy6keqPicvThLESPHVsDmEVcbXWsoAGhLia7NNUGSJZqja9MZvJNg/0?wx_fmt=gif;傻眼|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA4heMmDAUy9JNugOVamFbz2MDvgBejkiclGAsjyEZhtib63tIMZrORQug/0?wx_fmt=gif;色|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaALiaxW0gEpjzIbsoXpcqQoZMhacLDgKBP6RM2oVibUB0cPicib7lo1Q543Q/0?wx_fmt=gif;弱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAictva1f4qb0ouzk6Sg88mZtIS4NxQCyI9lPhYFsjJ177F8pX9IAKprA/0?wx_fmt=gif;拳头|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAuMZW55bGnqC1rCo3dWHjCR7cEBia2Ax5y7KQW6f1BPBQxHuQPqu6vDg/0?wx_fmt=gif;亲亲|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEfbMzWtva38oChkPxl8FDcGo5tBlQBcPIeIogcxTzaicq5uNoLEzibDQ/0?wx_fmt=gif;钱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaArpKyGWHmxtHPlhnUdlBTT2ibC05OHVicWdyialAhroz3ElJfDAYxMeheg/0?wx_fmt=gif;怒骂|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaApJzaK8ztIlrINOYBPLDkv0qjlnJ8v5ShQoq5wnSzm7XRfJFwdbGgYw/0?wx_fmt=gif;怒|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAtws2NlfzEsNxFibUXXcmbwCE7KMSogwupZhvZ2Y57BVBV2Q7Va3RbMw/0?wx_fmt=gif;绿丝带|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATBzyOPz9M6BIxScWEQs9FdTy6gDupXiahRx8uUSqVSKyzWmDWTibHiakw/0?wx_fmt=gif;泪|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAtXvG9icJqY6eARWge278uzq5ll4bxGDdrWWic4LIWWUJM3JLrVujMhtg/0?wx_fmt=gif;来|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAJiap3pOC4P12icOZPXTADA1ywo1YQEB7WlicibhMXrY3mckG8CWmXZKK9A/0?wx_fmt=gif;困|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAFrcZibLzwQticAtNmdUNyMj0yuotNA90o7yS3KibDMNEZDJJ1NtM2JGjw/0?wx_fmt=gif;酷|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAUEXl3CZ8U8R3E9ukn2UltIDTJBFkKSsJo7PZT4ttDXkxfof0QfhA8w/0?wx_fmt=gif;可怜|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAPthn9ECemKzmgjv41QjgR6H7vrPwkuydKKrEic400IBc7jhFyPZo6Xg/0?wx_fmt=gif;可爱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaARFTmsQBf7IYBQV8cdyWliaO4zqG3TERVH44WNUMX2VNMzl9H2W2uicGw/0?wx_fmt=gif;挤眼|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAm2uviazQhTlKrxggshdniawwicb4sIraFBCsUrTTSq6xKL9OUia4WTyzPg/0?wx_fmt=gif;红丝带|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAPibrFJ3e51tPicuVsly0ks5vZQ6sBCdUZmxae7iaJhT8bPASTSfUrARog/0?wx_fmt=gif;哼|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaASyHicLUsaYDsRTC3PfdYY36nVVn2FpuEOuzoAMe1yCqWoQE2Yd8Ep0Q/0?wx_fmt=gif;黑线|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAa6gjC25hAp9DiaFcPLfmXUDQmasPcP9jassQLR7agK82pgIFoNicuXyw/0?wx_fmt=gif;汗|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAKywqvXOgmOPNOrWtjOraxzQE8EHTmM9mneWmMtymTW461SOcjVjIibQ/0?wx_fmt=gif;害羞|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAibwa4VqJnGq6thB1tkvxVwpZGuqL050lAX1tBnnz5doAUoUl2uxG0mg/0?wx_fmt=gif;哈欠|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAFBjuAbQRPMPia6CFGZVt0tU2c34AeIZPsoU0tUslKp7uTMVs46fcmDA/0?wx_fmt=gif;哈哈|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATN3P0fztxPAx5icve2yCQVT49FiaVY870ebYfRymUBv3gHtAziaTcuOkQ/0?wx_fmt=gif;鼓掌|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAzApAGpFhBQqTN1E4XmufT2JrOfefooU3gyGhZz6TTZpGlVxpZzj8Ow/0?wx_fmt=gif;感冒|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0SATeJb6xW4iaKwpXyiaXiaBybRCubADGbP2jOfezeA4zumDIQf1ubMYg/0?wx_fmt=gif;愤怒|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAl7E1U805fPcR0JI2MciaSZoegaHcKUFwgP8fMXUl383iaWHSICRHF4hw/0?wx_fmt=gif;顶|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAP7uUXYnjFNauy9mT1jiabvcPjYvHjh2ZQJutQODib9y7EmBQtNWVGPJA/0?wx_fmt=gif;打脸|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA8icQjKpFDxRUw0EBR3xk5QIicQqAiaQQv1UgPzsaR9ZKl86ACJZRTNOtw/0?wx_fmt=gif;吃惊|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0g8SfhnibPP7icDQ4TPkK4jQW5qSQfsLRRibuZbedib5nh2iax46KVZqphA/0?wx_fmt=gif;馋嘴|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAc6WtjmBvYnYUgvsok2KoEfkR4ic1eFuxM7rfBlu2gQZ8Lx5CDGa2TYg/0?wx_fmt=gif;闭嘴|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaACKSKtXbYicmXKHObAjY55e1bu021NRmdvMdtysAdZgXoDCfVUcaJ7Aw/0?wx_fmt=gif;鄙视|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAZWiaZWkeeos3n1AZQT44npkCm8bOQevEZuAa6F6BDY6hicvkb0FsAf3Q/0?wx_fmt=gif;悲伤|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaASmlNZC15IaXZicazicghXxY43Fadj3wMdJgSjAR81UotGcOc6b8YIXTw/0?wx_fmt=gif;抱抱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAG0RJiaXZSBxtxiccFULXsrRsAd8WPgCLPAk6OYGRO7t9vicToJcsqrsOg/0?wx_fmt=gif;拜拜|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAJcONjIR3JMJRvVUN7QpDbMQmReA5n9vNibfoqJwaHVgTAHmC3X20iaQw/0?wx_fmt=gif;白眼|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAweWpqKhDBduq16xhiaQLjW50aM2o5Hl64qJNjCNLYjB8GjIh5AmbrAw/0?wx_fmt=gif;爱你*/

/*表情2*/

/*
 https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAhREggibRQMm5CIpd4icl3gtvvVsoTFh8yKt2IppB8oW6R441PlBsO0Sg/0?wx_fmt=gif;xkl路过|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABUrw8WJjJb3kzxqIvpXic6J8tMQkpwQ2hRPJeyiarxrttMk4U6hIqa4g/0?wx_fmt=gif;moc转发|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAiabqmFeQA7YUl8sxfqBaHmicqf0IoPjDRUicWXvRpsXPPdCMWKV7Tfdcg/0?wx_fmt=gif;moc羞|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaApn6x9By5039rDazRwoH8w8z51bMagB8JDpbe3Jsob6Tf5ggl80kqzA/0?wx_fmt=gif;moc鬼脸|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAo58KMYzawRXkuib4K2QlNNv4lnaTpfibaCWug7hsibSsaslAm7SbdHeGg/0?wx_fmt=gif;moc大哭|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATrgBTVaFUw0ulPvwl6cjYewrkG2hMRhLZI6htTmn1XsIrv1uVZ85FA/0?wx_fmt=gif;kxl晕|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaADVzZI1UD2vlBIwuskoxMp3RTdYAGCCSIlou7WbJaaClcofqAjulia8g/0?wx_fmt=gif;kiss|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAsQQiaNykFb22ft3B152bJ8dUxTWWohvjUkgWgsS0GIAzYINHQgpDQwg/0?wx_fmt=gif;doge|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA9BD8NsmsjIiaE0ALbib5KuDCweF2bF78N8ujjhH7s9NAeJF6FibmWazLQ/0?wx_fmt=gif;din睡觉|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAM7DapQrU8EOk4S1xmsv88pusNy4h5zRgu8cHYs0B7FcGia7C3zpovWQ/0?wx_fmt=gif;din爱你|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAENTVicFsyBwARicdg54hyXmG4LUydg7PAXiaHjWyVUz6zSkyCEKHg2unA/0?wx_fmt=gif;c捂脸|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAQkIPXhViaFMJUPnFYKU9ZaWicLd0rZYJEicQzibawZdC3tjf4KnVgicK3yw/0?wx_fmt=gif;c委屈|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAjib86MRlSB8k1TrcZWolibVw94O5J91BbIuM1gd91icKGgSNsQkP9CY1w/0?wx_fmt=gif;c伤心|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAfBdXa912IvnhdHEBJPyjR1Qt5AkPoibBicgtrmtdXibUcsEPF6uzvtVpg/0?wx_fmt=gif;c发火|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAzI7VuSEODF1libDNWvtiaYatI2gYSpLDn3ctE0lzBYVjPPEiaDFrt1ytA/0?wx_fmt=gif;c大笑|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAPo2W9yV1v676McSgmKq0WpRXicSgeTsU2APNP2LCibkKKdDhJgKdSHVQ/0?wx_fmt=gif;bm抓狂|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABsr6AtsoZE8vu2GrVByrczlopKDDTicNzV9H48ar96DrkhUGib2xg8AQ/0?wx_fmt=gif;bm醒悟|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABsr6AtsoZE8vu2GrVByrczlopKDDTicNzV9H48ar96DrkhUGib2xg8AQ/0?wx_fmt=gif;bm缤纷|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0qgPrhkpqKnMpE302Cjf4oWwNqcvLtChSbrvHicbf1P0byaFWQIN6sQ/0?wx_fmt=gif;ali转圈哭|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAmxE5Go1zc2srkCqwz0ZSUWCJn6icZNX7iaPUlHklAQge1MiaxH77fbNVQ/0?wx_fmt=gif;ali冤|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA8tvliadURuENX13Wro8ZJwaXeL2DR5op1N3RF9oepPThMH7ty2zbVMA/0?wx_fmt=gif;ali加油|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAibDNBQ5pBwJYMs20htP7TKGC3Iibegd3NLBZ206QSTT1R8v006bibaVlA/0?wx_fmt=gif;ali跪求|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA3Ft0VSdX4gSe8d0GEmaRxbg3mwuykBNaicmwkBCHKQyzianFiaZiauibsXg/0?wx_fmt=gif;围观|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAxCuuIa6969uNo0iaqO0umFBkRhdM9klvMcPbzq1bVt15RYyGFczQ2wg/0?wx_fmt=gif;微风|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATvibqaQD53p1uFJltqBwDHYCvPGEXRzK4C7wbC2cdXvdicCD8xeLgmqA/0?wx_fmt=gif;跳舞花|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAJic7erLjDEg1UBTSOm52m4ZLrHW3AquNC7eN5WMNAoiavlvlEAvxFy1Q/0?wx_fmt=gif;女孩儿|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAXtlL2Vu6Fibnaq4rmTVD1KKbqNjnooRB6Evib4vgPHoMibIfxXhmKLOFw/0?wx_fmt=gif;男孩儿|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAUZUseH5r2zSPEXePBSJpLb2MvZiaQCd1F2vMFYYCnIG5jnOMvneHicyA/0?wx_fmt=gif;喵喵|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEQtObrmlpGc8DJmibnSLibDKN0M5Pqf2xoqaALLiabDJoEgEbp9EFLguA/0?wx_fmt=gif;芒果萌萌哒|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEmZNjGdP2E5e4BzRpsZfOAxoRp1OjMJ43iaL9oWSkpvia22I7vX08zcw/0?wx_fmt=gif;哆啦A梦汗*/


/*总表情
 https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAmkGjO5wPRQiaad0sXcm4kqZnBUnHFl3yfycYARIHZnG9zUzvLLVKfLw/0?wx_fmt=gif;ok|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaARsycXLeqx3ZyFP4srxM8kaV1koAvxAt7H5loDnX6RFib88NTtNev4mw/0?wx_fmt=gif;NO|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA3KzYT1l6t6HET4bVJ8ib8G64KxLiceLFmZiay6t8BCk6qmzMGH0mnIIGw/0?wx_fmt=gif;haha.|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0UnUxh8FQEPrW0pgnDJmJAUco0dPQiaaemVvVqHibicYzCialIiahvmSYmw/0?wx_fmt=gif;good.|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAjxtyqzRLlpwsbmPX8HacKgib9Ajph8ZG5ibtnicwbhzQqqHNt1Tiaph1fg/0?wx_fmt=gif;作揖|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAm559CkSwXw7UAGNYAGCE9UVbvRLKXfrd4PaNTkQsboQCo0jUfIB6jQ/0?wx_fmt=gif;左哼哼|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAefXw3EhqbibAzibqhysjr5DicH9Rqias9NibOaIr7VB4ricpbj4Atl55TtJg/0?wx_fmt=gif;左抱抱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABb7yzDLZelOiblV95LoedXcWAkWqJl0959ywm0bEdpSwuvM6picnJg2Q/0?wx_fmt=gif;最差|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA32GXcRHsr2MRziahrZnwaR5RkLHHKlYCottlcNECGJy3jcJicuxiakOlg/0?wx_fmt=gif;抓狂|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAvNQcPAymS9QS1icXtRqAnhbtO8CicDKARlKP5pnrO5nTgJNuucxwgsyg/0?wx_fmt=gif;赞|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAqhLQcQYt01ic0a9tIyeic3hczQdMCU0tVobxeia2Sb9djicTCddY0RZlNQ/0?wx_fmt=gif;晕|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAlnsOibeJOvky3EZJgqhvBAB9s81OuRjNHTghzUlPRX5FicJf9BXqMYrw/0?wx_fmt=gif;右哼哼|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAVSohry7pzWkC5Id5mibEW8ibVmjN79eEToWmsObwwp91TH90NLuRUVIA/0?wx_fmt=gif;右抱抱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaArgV6R3np2fsUdKSu5ExaoxR3R9HjrfePHqsys4c2q0s5NLu4mqcK7A/0?wx_fmt=gif;阴险|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAice7f9tjUCiciaUBecRqwTR0k9XMLd2jXtws7WBYSNZV66YZVYx8DGFzQ/0?wx_fmt=gif;疑问|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA9Msj4BAy70D8k9bYT2BcoIeeS3NefvDGVkrgicoxNdlGxyMRlplz1Kg/0?wx_fmt=gif;耶|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAdsotG7OMUgZbE5FrNc2MlK6eibXKmZtVCWk6LZXtvuOKD8eB5odswow/0?wx_fmt=gif;嘘|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAicgyV9ASofHIM5sgEL9P5iaQbjuQiaEfV9zzFRXtvlfvwWLqRpwuOaGOA/0?wx_fmt=gif;心|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEYESI7SeiaTatttJNELicmsaEjf5jK8rP1hoMxFboicPrCjibicV1hUibicGw/0?wx_fmt=gif;笑cry.|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAlbicgNVWN0x1ujrYakpPT7aMGKr6e0kCssf4erVk0PwFhtLEsQicIdkw/0?wx_fmt=gif;嘻嘻|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAibIty89pDMZBq55ABWKBiaBrMhhz91whvibpv3XK8J0JSNX47Fmty9Dzg/0?wx_fmt=gif;握手|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAu4dCMFdTkFSicvdG1icsWicqUxvtj0bfxbX6g5thG4kOK92wQKJPhPY5w/0?wx_fmt=gif;委屈|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAIkTjsTsufHE3ibg04Pk29PFLMFyEWAygibYcqrn7PY4U5iamtJhJfaO6Q/0?wx_fmt=gif;微笑|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAILy8fydVjYxzFxXiaPJ06ddebuaz6LLU5x1la2ickxtD6CqYNYE5hyicA/0?wx_fmt=gif;挖鼻|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaANDEiaW7ibJaPmdnQxRicJWj0BgvSUHbLIFNL6asLibu8LQ0v5IdtIHTTXQ/0?wx_fmt=gif;吐|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAHKsHh9Wo7nrdIqgF5uZMsEaGKEYicK18MYQTSFqbxMnQWib5yZWASWQw/0?wx_fmt=gif;偷笑|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAdWGWWYlT2b6Qfia6yGGhdOIkE6PdXxKgCHJI3zBf7w5k4Xzx5fJm29A/0?wx_fmt=gif;太开心|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaArdKIQohDZYtyicFzFRqU1Ywt7GuVkkhTIUP4CE2SeiaRLuphGXy366Qw/0?wx_fmt=gif;思考|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABxTKq0I0QjAYBKSU4DqX3knEk4Yn4UdctMvVuHOa7pwkbjNIEgia3Iw/0?wx_fmt=gif;睡|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAd3wD1XLWfVibuuAxDWrwv5DbpND0zcGG6lpLfV588nmib0x8JlAgAazw/0?wx_fmt=gif;衰|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAo5TtRZiacwM5rX5gicVk66NOcb8OXq1pbRa4TI8fCmfIWuV8qWoYFN1w/0?wx_fmt=gif;书呆子|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAO0gZ1mlKlroM8BKRvGNIe2icEPRGhZ9WLdQz4ibR2ScxtiaG8FicG2Qa0w/0?wx_fmt=gif;失望|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA4sib7iasicfloibBr0tJKCJF1G3iardzhUwfuHKxuicibNEJS2Hk89qvNxYxw/0?wx_fmt=gif;生病|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaACficmy6keqPicvThLESPHVsDmEVcbXWsoAGhLia7NNUGSJZqja9MZvJNg/0?wx_fmt=gif;傻眼|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA4heMmDAUy9JNugOVamFbz2MDvgBejkiclGAsjyEZhtib63tIMZrORQug/0?wx_fmt=gif;色|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaALiaxW0gEpjzIbsoXpcqQoZMhacLDgKBP6RM2oVibUB0cPicib7lo1Q543Q/0?wx_fmt=gif;弱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAictva1f4qb0ouzk6Sg88mZtIS4NxQCyI9lPhYFsjJ177F8pX9IAKprA/0?wx_fmt=gif;拳头|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAuMZW55bGnqC1rCo3dWHjCR7cEBia2Ax5y7KQW6f1BPBQxHuQPqu6vDg/0?wx_fmt=gif;亲亲|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEfbMzWtva38oChkPxl8FDcGo5tBlQBcPIeIogcxTzaicq5uNoLEzibDQ/0?wx_fmt=gif;钱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaArpKyGWHmxtHPlhnUdlBTT2ibC05OHVicWdyialAhroz3ElJfDAYxMeheg/0?wx_fmt=gif;怒骂|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaApJzaK8ztIlrINOYBPLDkv0qjlnJ8v5ShQoq5wnSzm7XRfJFwdbGgYw/0?wx_fmt=gif;怒|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAtws2NlfzEsNxFibUXXcmbwCE7KMSogwupZhvZ2Y57BVBV2Q7Va3RbMw/0?wx_fmt=gif;绿丝带|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATBzyOPz9M6BIxScWEQs9FdTy6gDupXiahRx8uUSqVSKyzWmDWTibHiakw/0?wx_fmt=gif;泪|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAtXvG9icJqY6eARWge278uzq5ll4bxGDdrWWic4LIWWUJM3JLrVujMhtg/0?wx_fmt=gif;来|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAJiap3pOC4P12icOZPXTADA1ywo1YQEB7WlicibhMXrY3mckG8CWmXZKK9A/0?wx_fmt=gif;困|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAFrcZibLzwQticAtNmdUNyMj0yuotNA90o7yS3KibDMNEZDJJ1NtM2JGjw/0?wx_fmt=gif;酷|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAUEXl3CZ8U8R3E9ukn2UltIDTJBFkKSsJo7PZT4ttDXkxfof0QfhA8w/0?wx_fmt=gif;可怜|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAPthn9ECemKzmgjv41QjgR6H7vrPwkuydKKrEic400IBc7jhFyPZo6Xg/0?wx_fmt=gif;可爱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaARFTmsQBf7IYBQV8cdyWliaO4zqG3TERVH44WNUMX2VNMzl9H2W2uicGw/0?wx_fmt=gif;挤眼|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAm2uviazQhTlKrxggshdniawwicb4sIraFBCsUrTTSq6xKL9OUia4WTyzPg/0?wx_fmt=gif;红丝带|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAPibrFJ3e51tPicuVsly0ks5vZQ6sBCdUZmxae7iaJhT8bPASTSfUrARog/0?wx_fmt=gif;哼|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaASyHicLUsaYDsRTC3PfdYY36nVVn2FpuEOuzoAMe1yCqWoQE2Yd8Ep0Q/0?wx_fmt=gif;黑线|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAa6gjC25hAp9DiaFcPLfmXUDQmasPcP9jassQLR7agK82pgIFoNicuXyw/0?wx_fmt=gif;汗|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAKywqvXOgmOPNOrWtjOraxzQE8EHTmM9mneWmMtymTW461SOcjVjIibQ/0?wx_fmt=gif;害羞|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAibwa4VqJnGq6thB1tkvxVwpZGuqL050lAX1tBnnz5doAUoUl2uxG0mg/0?wx_fmt=gif;哈欠|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAFBjuAbQRPMPia6CFGZVt0tU2c34AeIZPsoU0tUslKp7uTMVs46fcmDA/0?wx_fmt=gif;哈哈|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATN3P0fztxPAx5icve2yCQVT49FiaVY870ebYfRymUBv3gHtAziaTcuOkQ/0?wx_fmt=gif;鼓掌|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAzApAGpFhBQqTN1E4XmufT2JrOfefooU3gyGhZz6TTZpGlVxpZzj8Ow/0?wx_fmt=gif;感冒|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0SATeJb6xW4iaKwpXyiaXiaBybRCubADGbP2jOfezeA4zumDIQf1ubMYg/0?wx_fmt=gif;愤怒|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAl7E1U805fPcR0JI2MciaSZoegaHcKUFwgP8fMXUl383iaWHSICRHF4hw/0?wx_fmt=gif;顶|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAP7uUXYnjFNauy9mT1jiabvcPjYvHjh2ZQJutQODib9y7EmBQtNWVGPJA/0?wx_fmt=gif;打脸|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA8icQjKpFDxRUw0EBR3xk5QIicQqAiaQQv1UgPzsaR9ZKl86ACJZRTNOtw/0?wx_fmt=gif;吃惊|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0g8SfhnibPP7icDQ4TPkK4jQW5qSQfsLRRibuZbedib5nh2iax46KVZqphA/0?wx_fmt=gif;馋嘴|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAc6WtjmBvYnYUgvsok2KoEfkR4ic1eFuxM7rfBlu2gQZ8Lx5CDGa2TYg/0?wx_fmt=gif;闭嘴|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaACKSKtXbYicmXKHObAjY55e1bu021NRmdvMdtysAdZgXoDCfVUcaJ7Aw/0?wx_fmt=gif;鄙视|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAZWiaZWkeeos3n1AZQT44npkCm8bOQevEZuAa6F6BDY6hicvkb0FsAf3Q/0?wx_fmt=gif;悲伤|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaASmlNZC15IaXZicazicghXxY43Fadj3wMdJgSjAR81UotGcOc6b8YIXTw/0?wx_fmt=gif;抱抱|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAG0RJiaXZSBxtxiccFULXsrRsAd8WPgCLPAk6OYGRO7t9vicToJcsqrsOg/0?wx_fmt=gif;拜拜|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAJcONjIR3JMJRvVUN7QpDbMQmReA5n9vNibfoqJwaHVgTAHmC3X20iaQw/0?wx_fmt=gif;白眼|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAweWpqKhDBduq16xhiaQLjW50aM2o5Hl64qJNjCNLYjB8GjIh5AmbrAw/0?wx_fmt=gif;爱你|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAhREggibRQMm5CIpd4icl3gtvvVsoTFh8yKt2IppB8oW6R441PlBsO0Sg/0?wx_fmt=gif;xkl路过|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABUrw8WJjJb3kzxqIvpXic6J8tMQkpwQ2hRPJeyiarxrttMk4U6hIqa4g/0?wx_fmt=gif;moc转发|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAiabqmFeQA7YUl8sxfqBaHmicqf0IoPjDRUicWXvRpsXPPdCMWKV7Tfdcg/0?wx_fmt=gif;moc羞|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaApn6x9By5039rDazRwoH8w8z51bMagB8JDpbe3Jsob6Tf5ggl80kqzA/0?wx_fmt=gif;moc鬼脸|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAo58KMYzawRXkuib4K2QlNNv4lnaTpfibaCWug7hsibSsaslAm7SbdHeGg/0?wx_fmt=gif;moc大哭|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATrgBTVaFUw0ulPvwl6cjYewrkG2hMRhLZI6htTmn1XsIrv1uVZ85FA/0?wx_fmt=gif;kxl晕|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaADVzZI1UD2vlBIwuskoxMp3RTdYAGCCSIlou7WbJaaClcofqAjulia8g/0?wx_fmt=gif;kiss|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAsQQiaNykFb22ft3B152bJ8dUxTWWohvjUkgWgsS0GIAzYINHQgpDQwg/0?wx_fmt=gif;doge|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA9BD8NsmsjIiaE0ALbib5KuDCweF2bF78N8ujjhH7s9NAeJF6FibmWazLQ/0?wx_fmt=gif;din睡觉|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAM7DapQrU8EOk4S1xmsv88pusNy4h5zRgu8cHYs0B7FcGia7C3zpovWQ/0?wx_fmt=gif;din爱你|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAENTVicFsyBwARicdg54hyXmG4LUydg7PAXiaHjWyVUz6zSkyCEKHg2unA/0?wx_fmt=gif;c捂脸|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAQkIPXhViaFMJUPnFYKU9ZaWicLd0rZYJEicQzibawZdC3tjf4KnVgicK3yw/0?wx_fmt=gif;c委屈|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAjib86MRlSB8k1TrcZWolibVw94O5J91BbIuM1gd91icKGgSNsQkP9CY1w/0?wx_fmt=gif;c伤心|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAfBdXa912IvnhdHEBJPyjR1Qt5AkPoibBicgtrmtdXibUcsEPF6uzvtVpg/0?wx_fmt=gif;c发火|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAzI7VuSEODF1libDNWvtiaYatI2gYSpLDn3ctE0lzBYVjPPEiaDFrt1ytA/0?wx_fmt=gif;c大笑|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAPo2W9yV1v676McSgmKq0WpRXicSgeTsU2APNP2LCibkKKdDhJgKdSHVQ/0?wx_fmt=gif;bm抓狂|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABsr6AtsoZE8vu2GrVByrczlopKDDTicNzV9H48ar96DrkhUGib2xg8AQ/0?wx_fmt=gif;bm醒悟|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaABsr6AtsoZE8vu2GrVByrczlopKDDTicNzV9H48ar96DrkhUGib2xg8AQ/0?wx_fmt=gif;bm缤纷|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA0qgPrhkpqKnMpE302Cjf4oWwNqcvLtChSbrvHicbf1P0byaFWQIN6sQ/0?wx_fmt=gif;ali转圈哭|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAmxE5Go1zc2srkCqwz0ZSUWCJn6icZNX7iaPUlHklAQge1MiaxH77fbNVQ/0?wx_fmt=gif;ali冤|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA8tvliadURuENX13Wro8ZJwaXeL2DR5op1N3RF9oepPThMH7ty2zbVMA/0?wx_fmt=gif;ali加油|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAibDNBQ5pBwJYMs20htP7TKGC3Iibegd3NLBZ206QSTT1R8v006bibaVlA/0?wx_fmt=gif;ali跪求|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaA3Ft0VSdX4gSe8d0GEmaRxbg3mwuykBNaicmwkBCHKQyzianFiaZiauibsXg/0?wx_fmt=gif;围观|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAxCuuIa6969uNo0iaqO0umFBkRhdM9klvMcPbzq1bVt15RYyGFczQ2wg/0?wx_fmt=gif;微风|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaATvibqaQD53p1uFJltqBwDHYCvPGEXRzK4C7wbC2cdXvdicCD8xeLgmqA/0?wx_fmt=gif;跳舞花|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAJic7erLjDEg1UBTSOm52m4ZLrHW3AquNC7eN5WMNAoiavlvlEAvxFy1Q/0?wx_fmt=gif;女孩儿|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAXtlL2Vu6Fibnaq4rmTVD1KKbqNjnooRB6Evib4vgPHoMibIfxXhmKLOFw/0?wx_fmt=gif;男孩儿|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAUZUseH5r2zSPEXePBSJpLb2MvZiaQCd1F2vMFYYCnIG5jnOMvneHicyA/0?wx_fmt=gif;喵喵|https://mmbiz.qlogo.cn/mmbiz_gif/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEQtObrmlpGc8DJmibnSLibDKN0M5Pqf2xoqaALLiabDJoEgEbp9EFLguA/0?wx_fmt=gif;芒果萌萌哒|https://mmbiz.qlogo.cn/mmbiz_png/lxn9LpU0EpVPVTPcxbtxwcfE9DfA5ciaAEmZNjGdP2E5e4BzRpsZfOAxoRp1OjMJ43iaL9oWSkpvia22I7vX08zcw/0?wx_fmt=gif;哆啦A梦汗
 *
 * */