/**
 * Created by wanghan on 2014/8/30.
 */
require('../wx_helpers/md5');
var request = require("superagent");
var login = require( __dirname + '/../wx_helpers/login');
var async = require('async');
var Resource = require('../proxy').Resource;
var SchoolEx = require('../proxy').SchoolEx;
var School = require('../proxy').School;
var fs = require('fs');
var ent = require('ent');
var articleNum = 4;         //试验采用两篇文章
var Configuration = require('../proxy').Configuration;

function replaceContent(content,schoolEx){
    return content.replace(new RegExp('__topic_content__', "g"), schoolEx.topic_content)
        .replace(new RegExp('__photo_guess_content__', "g"), schoolEx.photo_guess_content.replace("赞","zan"))
        .replace(new RegExp('__confession_content__', "g"), schoolEx.confess_content.replace("赞","zan"))
        .replace(new RegExp('__secret_content__', "g"), schoolEx.secret_content.replace("赞","zan"))
        .replace(new RegExp('__info_content__', "g"), schoolEx.info_content.length>0?schoolEx.info_content.replace("赞","zan"):"暂无生活信息，如果大家有闲置二手物品或者失物招领等都可以写哦..记得附加上联系方式")
        .replace(new RegExp('__ershou_content__', "g"), schoolEx.ershou_content)
        .replace(new RegExp("_account_name_", "g"), schoolEx.wx_account_name)
        .replace(new RegExp("__zipai_content__", "g"), schoolEx.zipai_content)
        .replace(new RegExp("_erweima_", "g"), "<img src='"+schoolEx.erweima+"'/>");

       //

}

function replaceTitle(title,schoolEx){
    return title.replace(new RegExp("__topic_title__", "g"),  schoolEx.topic_title)
        .replace(new RegExp("__photo_guess_title__", "g"),  schoolEx.photo_guess_title)
        .replace(new RegExp("__confession_title__", "g"),  schoolEx.confess_title)
        .replace(new RegExp("__ershou_title__", "g"),  schoolEx.ershou_title)
        .replace(new RegExp("__friend_title__", "g"),  schoolEx.friend_title)
        .replace(new RegExp("__info_title__", "g"),  schoolEx.info_title)
        .replace(new RegExp("__zipai_title__", "g"),  schoolEx.zipai_title)
        .replace(new RegExp("__secret_title__", "g"),  schoolEx.secret_title);;
}

exports.uploadSingle = function(req, res, next){
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

        articleNum = articleNum2;

        console.log(group);
        async.series([

            function (cb) {
                Resource.getTodayResource(function (err, resource) {
                    //  console.log(resource.content);
                    content = JSON.parse(resource.content);
                    cb();
                });
            },

            function (cb) {
                SchoolEx.getSchoolByEname(school_enname, function (err, school) {
                    schoolEx = school;

                    console.log(schoolEx)
                    cb();
                })
            },

            function (cb) {
                School.getSchoolByEname(school_enname, function (err, item) {
                    school = item;
                    cb();
                })
            },
            /*        function(cb) {
             Configuration.getConfigurationByCode(schoolEx.region_code, function (err, configuration) {
             if(configuration){
             tianqi = configuration.value;
             }
             cb();
             })
             },*/
            function (cb) {
                content.multi_item[0].content = replaceContent(content.multi_item[0].content, schoolEx);
                content.multi_item[0].title = replaceTitle(content.multi_item[0].title, schoolEx);
                cb();
            },
            function (cb) {
                if (articleNum > 1) {
                    content.multi_item[1].content = replaceContent(content.multi_item[1].content, schoolEx);
                    content.multi_item[1].title = replaceTitle(content.multi_item[1].title, schoolEx);
                }
                cb();
            },
            function (cb) {
                if (articleNum > 2) {
                    content.multi_item[2].content = replaceContent(content.multi_item[2].content, schoolEx);
                    content.multi_item[2].title = replaceTitle(content.multi_item[2].title, schoolEx);
                }
                cb();
            },

            function (cb) {
                if (articleNum > 3) {
                    content.multi_item[3].content = replaceContent(content.multi_item[3].content, schoolEx);
                    content.multi_item[3].title = replaceTitle(content.multi_item[3].title, schoolEx);
                }
                cb();
            },

            function (cb) {
                if (articleNum > 4) {
                    content.multi_item[4].content = replaceContent(content.multi_item[4].content, schoolEx);
                    content.multi_item[4].title = replaceTitle(content.multi_item[4].title, schoolEx);
                }

                cb();
            },

            function (cb) {
                if (articleNum > 5) {
                    content.multi_item[5].content = replaceContent(content.multi_item[5].content, schoolEx);
                    content.multi_item[5].title = replaceTitle(content.multi_item[5].title, schoolEx);
                }
                cb();
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
                            }else{
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
                    isbn0:'',
                    music_id0 :'',
                    video_id0 :'',
                    shortvideofileid0 :''
                };

                data.token = loadResult.token;
                data.random = Math.random();
                data.AppMsgId = schoolEx.appmsgid;

                //console.log("content is :");
              //  console.log(content.multi_item[0]);
                if(user_name=="meirixiaogushi"){
                    user_name="nxu-fuwu"
                }
                for (var i = 0; i < articleNum; i++) {
                    data['content' + i] = content.multi_item[i].content.replace(new RegExp("__user_name__", "g"), user_name).replace(new RegExp("__name__", "g"), schoolEx.cn_short_name).replace(new RegExp("_account_name_", "g"), schoolEx.wx_account_name).replace(new RegExp("__school_short_name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_name__", "g"), schoolEx.cn_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code);
                    data['digest' + i] = content.multi_item[i].digest;
                    data['author' + i] = content.multi_item[i].author; //add by wanghan 20160630
                    data['title' + i] = content.multi_item[i].title.replace(new RegExp("__name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_short_name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_name__", "g"), schoolEx.cn_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code);
                    ;
                    data['fileid' + i] = content.multi_item[i].fileid0;
                    /*--- add 20160424 --- begin---*/
                    data['show_cover_pic' + i] = '0';
                    data['cdn_url' + i] = content.multi_item[i].cdn_url;
                    data['copyright_type' + i] = content.multi_item[i].copyright_type;
                    data['can_reward' + i] = content.multi_item[i].can_reward;
                    data['reward_wording' + i] = '';
                    data['need_open_comment' + i] = '0';
                    data['only_fans_can_comment' + i] = '0';
                    data['sourceurl' + i] = '';
                    data['free_content' + i] = '';
                    /*--- add 20160424 ---end---*/
                    if (sourceFlag != undefined) {
                        data['sourceurl' + i] = school.wx_account_url.replace(new RegExp("__user_name__", "g"), user_name).replace(new RegExp("__name__", "g"), schoolEx.en_name).replace(new RegExp("_account_name_", "g"), schoolEx.wx_account_name).replace(new RegExp("__school_short_name__", "g"), schoolEx.cn_short_name).replace(new RegExp("__school_name__", "g"), schoolEx.cn_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code);

                    } else {
                        console.log("-------------------");

                        data['sourceurl' + i] = ent.decode(content.multi_item[i].source_url.replace(new RegExp("__user_name__", "g"), user_name).replace(new RegExp("__name__", "g"), schoolEx.en_name).replace(new RegExp("__today__", "g"), TodayFormat()).replace(new RegExp("__yestoday__", "g"), YesTodayFormat()).replace(new RegExp("__region_code__", "g"), schoolEx.region_code));
                        console.log("source url is:" + data['sourceurl' + i]);
                    }


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
                    .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
                    .set('Cookie', loadResult.cookie)
                    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36')
                    .set('Referer', 'https://mp.weixin.qq.com/cgi-bin/appmsg?t=media/appmsg_edit&action=edit&lang=zh_CN&token=' + loadResult.token + '&type=10&appmsgid=' + schoolEx.appmsgid + '&isMul=1')
                    .set('Origin', 'https://mp.weixin.qq.com')
                    .set('X-Requested-With','XMLHttpRequest')
                    .send(sendData)
                    .end(function (res) {
                        if (res.ok) {
                            console.log("-----------ok--------------------------------------------------------------------")
                        }else{
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
    }catch(e){
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


