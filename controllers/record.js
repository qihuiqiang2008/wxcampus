var EventProxy = require('eventproxy');
var School = require('../proxy').School;
var Region = require('../proxy').Region;
var PostEx = require('../proxy').PostEx;
async = require('async');
var PV = require('../proxy/PV')
var SchoolEx = require('../proxy').SchoolEx;
var login = require(__dirname + '/../wx_helpers/login');
require('../wx_helpers/md5');
var request = require("superagent");
var ArticleInfo = require('../proxy').ArticleInfo;
var http = require("http");
var urlutil = require('url');
var querystring = require('querystring');
var crypto = require('crypto');

exports.getPostsRecord = function (req, res, next) {

    //获取查询的开始时间和结束时间
    var startDate, endDate;
    var create_at;
    if (req.query.startDate != undefined) {
        startDate = req.query.startDate;
    }
    else {
        startDate=new Date(new Date()-24*60*60*1000);
        startDate=startDate.getFullYear()+'/'+(startDate.getMonth()+1)+'/'+startDate.getDate()
    }
    if (req.query.endDate != undefined) {
        endDate = req.query.endDate;
    }
    else {
        endDate=new Date()
        endDate=endDate.getFullYear()+'/'+(endDate.getMonth()+1)+'/'+endDate.getDate()
    }

    if (startDate != undefined && endDate != undefined) {
        create_at = {
            "$gt": new Date(startDate),
            "$lt": new Date(endDate)
        }
        console.log("create_at is not null")
    }
    var view = 'back/record/posts';
    var query = {}
    var limit = 200;
    var page = parseInt(req.query.page, 10) || 1;
    var options = {
        skip: (page - 1) * limit, limit: limit, sort: [
            ['create_at', 'asc']
        ]
    };
    page = page > 0 ? page : 1;
    var proxy = EventProxy.create('schools', 'pages', 'amounts',
        function (schools, pages) {
            res.render(view, {
                schools: schools,
                pages: pages,
                amounts: JSON.stringify(amounts),
                current_page: page,
                startDate:startDate,
                endDate:endDate
            })
        })
    proxy.fail(next);
    //School.getSchoolsByQuery(query,options,proxy.done('schools'));
    var amounts = new Array();

    console.log("begin:" + new Date(startDate));
    console.log("end:" + new Date(endDate));

    School.getSchoolsByQuery(query, options, function (err, schools) {
        proxy.emit('schools', schools);
        console.log('学校数量：' + schools.length);
        async.eachSeries(schools,
            function (school, callback) {
                PostEx.countByschool(school, create_at, function (amount) {
                    //console.log("amount:" + amount.confess)
                    amounts.push(amount)
                    /*if(school.en_name=='ujs'){
                     console.log("表白树洞统计结束......"+amounts.length);
                     }*/
                    callback();
                })
            },
            function (err) {
                console.log("================统计结束================" );
                proxy.emit('amounts', amounts);
                //cb();
            });
    });
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
};

exports.getPostsByDate = function (req, res, next) {
    //获取查询的开始时间和结束时间
    var school=req.query.school;
    var day=req.query.day;
    var labels=new Array();
    var dates=new Array();
    if(day==undefined||day==null||day==0){
        day=50;
    }
    for(var i=0;i<day;i++){
        var today=new Date();
        today.setDate(today.getDate()-i);
        labels.push(today.getMonth()+1+"/"+today.getDate());
        dates.push(today);
    }


    var proxy = EventProxy.create('datasets',
        function (datasets) {
            res.render('back/record/posts-all',{
                datasets:datasets,
                labels:labels,
            })
        });

    proxy.fail(next);

    PostEx.countByAll(dates,function (err,datasets) {
        proxy.emit('datasets', datasets);
    });
};

exports.getPvs = function (req, res, next) {
    var startDate, endDate;
    if (req.query.startDate != undefined) {
        startDate = req.query.startDate;
    }
    else{
        startDate=new Date(new Date()-24*60*60*1000);
        startDate=startDate.getFullYear()+'/'+(startDate.getMonth()+1)+'/'+startDate.getDate()
    }
    if (req.query.endDate != undefined) {
        endDate = req.query.endDate;
    }
    else{
        endDate=new Date();
        endDate=endDate.getFullYear()+'/'+(endDate.getMonth()+1)+'/'+endDate.getDate()
    }
    console.log("begin:" + new Date(startDate));
    console.log("end:" + new Date(endDate).setDate(new Date(endDate).getDate() + 1));
    var create_at;
    if (startDate != undefined && endDate != undefined) {
        create_at = {
            "$gt": new Date(startDate),
            "$lt": new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        }
        console.log("create_at is not null")
    }

    var view = 'back/record/pvs';

    var query = {}
    var limit = 200;
    var page = parseInt(req.query.page, 10) || 1;
    var options = {
        skip: (page - 1) * limit, limit: limit, sort: [
            ['schools', 'asc']
        ]
    };
    page = page > 0 ? page : 1;

    var proxy = EventProxy.create('schools', 'pages', 'amounts',
        function (schools, pages) {
            res.render(view, {
                schools: schools,
                pages: pages,
                amounts: JSON.stringify(amounts),
                current_page: page,
                endDate:endDate,
                startDate:startDate
            })
        })
    proxy.fail(next);
    var amounts = [];
    School.getSchoolsByQuery(query, options, function (err, schools) {
        proxy.emit('schools', schools);
        console.log('schools.length' + schools.length);
        async.eachSeries(schools,
            function (school, callback) {
                PV.countByCondition(school, create_at, function (amount) {
                    console.log("amount:" + amount.confess)
                    amounts.push(amount)
                    /*if(school.en_name=='ujs'){
                     console.log("表白树洞统计结束......"+amounts.length);
                     }*/
                    callback();
                })
            },
            function (err) {
                console.log("表白树洞PV统计结束......" + amounts[3].total);
                proxy.emit('amounts', amounts);
                //cb();
            });
    });
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));

}
exports.gotoSaveArticle = function (req, res, next) {
    SchoolEx.getSchoolExsByQueryAndField({}, '_id cn_name en_name', {}, function (err, schoolexs) {
        res.render('back/record/saveArticle', {schoolexs: schoolexs});
    });
}
exports.saveArticle = function (req, res, next) {
    var school_en_name = req.body.en_name;
    console.log("school:" + school_en_name);
    var position = 1;
    var loadResult;
    var latest_msg_id;
    var list;
    var schoolEx;
    var todayUrlList = new Array();
        async.series([
            function (cb) {
                SchoolEx.getSchoolByEname(school_en_name, function (err, school) {
                    schoolEx = school;
                    cb(err);
                })
            },

            function (cb) { //1.1：登陆。

                    login(schoolEx, function (err, results) {
                        if(err){
                            console.log(school_en_name+"登录失败");
                            cb(err);
                        }
                        loadResult = results;
                        console.log(school_en_name+"登录成功");
                        cb();
                    });
            },

            function (cb) {
                request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN')
                    .set('Cookie', loadResult.cookie)
                    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                    .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                    .end(function (res) {
                        var start = res.text.indexOf("window.wx =")
                        var end = res.text.indexOf("path:")

                        var indexHead = res.text.indexOf('wx.cgiData =');
                        indexHead = res.text.indexOf('list :', indexHead);
                        var indexTail = res.text.indexOf('.msg_item', indexHead);
                        var html = res.text.slice(indexHead + 'list :'.length, indexTail).trim();
                        html = html.slice(1, -1);
                        try{
                            list = JSON.parse(html)
                            cb();
                        }
                        catch (err){

                            console.log(school_en_name+"html解析错误")
                            cb(err);
                        }

                    });

            },
            function (cb) {
                var start = new Date().setHours(0, 0, 0, 0);
                var end = new Date().setHours(23, 59, 59, 0);
                /*for (var i = 0; i < list.msg_item.length; i++) {
                    if (list.msg_item[i].date_time * 1000 < end && list.msg_item[i].date_time * 1000 > start) {*/
                        //var url=escape2Html(list.msg_item[i].content_url)
                        console.log(school_en_name+'===================开始保存文章信息===================')
                        /*for (var j = 0; j < list.msg_item[i].multi_item.length; j++) {
                            console.log("save:"+list.msg_item[i].multi_item[j].title);
                            var url = escape2Html(list.msg_item[i].multi_item[j].content_url);
                            var type=getArticleType(list.msg_item[i].multi_item[j].title);
                            ArticleInfo.saveOrUpdate(url, new Date(list.msg_item[i].date_time * 1000),
                                list.msg_item[i].multi_item[j].seq, type, school_en_name,schoolEx.cn_name,schoolEx.fans,
                                list.msg_item[i].multi_item[j].title, list.msg_item[i].multi_item[j].read_num,
                                list.msg_item[i].multi_item[j].like_num,
                                function (err) {
                                    if (err) {
                                        console.log(err);
                                        cb(err);
                                    }

                                });

                            //todayUrlList.push(list.msg_item[i].multi_item[j].content_url);
                        }*/
                        for (var i = 0; i < list.msg_item.length; i++) {
                            for (var j = 0; j < list.msg_item[i].multi_item.length; j++) {
                                console.log("update:" + list.msg_item[i].multi_item[j].title);
                                var url = escape2Html(list.msg_item[i].multi_item[j].content_url);
                                var type = getArticleType(list.msg_item[i].multi_item[j].title);
                                ArticleInfo.saveOrUpdate(url, new Date(list.msg_item[i].date_time * 1000),
                                    list.msg_item[i].multi_item[j].seq, type, school_en_name, schoolEx.cn_name, schoolEx.fans,
                                    list.msg_item[i].multi_item[j].title, list.msg_item[i].multi_item[j].read_num,
                                    list.msg_item[i].multi_item[j].like_num,
                                    function (err) {
                                        if (err) {
                                            console.log(err);
                                        }

                                    });
                            }
                        /*}
                    }*/
                }
                console.log("===========================end==========================")
                cb();
            }
        ],
        function (err) {
            if(err){
                console.log('保存文章信息失败'+err)
                return res.json({success: false});
            }
            else {
                //console.log(school_en_name+'===================开始更新文章阅读量===================')


                    /*for (var j = 0; j < list.msg_item[i].multi_item.length; j++) {
                     var url = escape2Html(list.msg_item[i].multi_item[j].content_url);
                     ArticleInfo.updateCount(url,list.msg_item[i].multi_item[j].read_num,
                     list.msg_item[i].multi_item[j].like_num,
                     function (err) {
                     if (err) {
                     console.log(err);
                     }

                     });
                     }*/

                return res.json({success: true});

            }
            }

    );
}

exports.getArticle = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 200;
    var endDate=req.query.endDate;
    var school=req.query.school;
    var query = {};
    console.log('school:'+school);
    if(endDate !=undefined&&endDate!=""){
        //endDate=new Date();
        query.date_time = {
            "$gt": new Date(new Date(endDate)).setHours(0, 0, 0, 0),
            "$lt": new Date(endDate).setHours(23, 59, 0, 0)
        }
        console.log('enddate2:'+endDate);
    }
    else {
        query.date_time = {
            "$gt": +new Date(new Date()-24*60*60*1000),
            "$lt": new Date().setHours(23, 59, 0, 0)
        }
    }
    if(school !=undefined&&school!=""){
        //endDate=new Date();
        query.school_cn_name = school;
        console.log('enddate2:'+endDate);
    }
    var options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: [
         ['fans','desc'],
            ['date_time','desc'],
            ['positon','asc']
         ]
    };
    var view = 'back/record/articles';

    var proxy = EventProxy.create('articles', 'pages',
        function (articles, pages, TodayResourceCount, regions, ads) {
            res.render(view, {
                articles: articles,
                pages: pages,
                current_page: page,
            });
        });


    proxy.fail(next);
    ArticleInfo.getArticlesByQuery(query, options, proxy.done("articles"));
    ArticleInfo.countByQuery(query, proxy.done(function (err, all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
}

exports.countArticle = function (res, req, next) {
    //var url=res.query.url;
    var url = "http://mp.weixin.qq.com/s/U-fHwe1S4ThgzAazORluiQ";
    console.log("url:" + url);
    sendHttpRequest("http://wxapi.51tools.info/wx/api.ashx?key=tp_591320673&ver=1", 'post', function (responseData) {
        console.log(responseData);
    });

}

exports.getPostsChart=function (req, res, next) {
    var school=req.query.school;
    var day=req.query.day;
    var labels=new Array();
    var dates=new Array();
    if(day==undefined||day==null||day==0){
        day=20;
    }
    for(var i=0;i<day;i++){
        var today=new Date();
        today.setDate(today.getDate()-i);
        labels.push(today.getMonth()+1+"/"+today.getDate());
        dates.push(today);
    }


    var proxy = EventProxy.create('datasets',
        function (datasets) {
            res.render('back/record/charts-posts',{
                datasets:JSON.stringify(datasets),
                labels:JSON.stringify(labels),
                school:school,
                day:day,
            })
        });

    proxy.fail(next);

    PostEx.countLastBySchool(school,dates,function (err,datasets) {
        
        proxy.emit('datasets', datasets);
    });
   
}


exports.getArticleChart=function (req, res, next) {

    console.log('进入。。。。。。。')

    var school=req.query.school;
    console.log("学校："+school)
    var day=req.query.day;
    var labels=new Array();
    var dates=new Array();
    if(day==undefined||day==null||day==0){
        day=20;
    }
    for(var i=0;i<day;i++){
        var today=new Date();
        today.setDate(today.getDate()-i);
        labels.push(today.getMonth()+1+"/"+today.getDate());
        dates.push(today);
        console.log("日期："+today)
    }


    var proxy = EventProxy.create('datasets',
        function (datasets) {
            res.render('back/record/charts-article',{
                datasets:JSON.stringify(datasets),
                labels:JSON.stringify(labels),
                school:school,
                day:day,
            })
        });

    proxy.fail(next);

    ArticleInfo.getLastByCondition(school,dates,function (err,datasets) {
        proxy.emit('datasets', datasets);
    });

}

var sendHttpRequest = function (url, type, callback) {
    var data = {url: "http://mp.weixin.qq.com/s?__biz=MzA4MzQ4NTQxNw==&mid=2652391675&idx=1&sn=dd347b621c2137721c0ebeadaae089d5&chksm=84195f7db36ed66b95019d1d1b9fe9afd1796b1106d04a72345f649a6ddb3dd179a8e1d1cbd6&scene=0#rd"};
    //data = JSON.stringify(data);
    var content = querystring.stringify(data, null, null, null);
    console.log(content)
    var urlObj = urlutil.parse(url);
    var host = urlObj.hostname;
    console.log("host:" + host)
    var path = urlObj.path;
    console.log("host:" + path)
    var port = urlObj.port;
    console.log("host:" + port)

    var options = {
        hostname: host,
        port: 80,
        path: path,
        method: type,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(content)
        }
    };
    var body = '';
    var req = http.request(options, function (res) {
        console.log("response: " + res.statusCode);
        res.on('data', function (data) {
            body += data;
        }).on('end', function () {
            callback(body);
        });
    }).on('error', function (e) {
        console.log("error: " + e.message);
    })
    req.write(content);
    req.end();
};

function escape2Html(str) {
    var arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
        return arrEntities[t];
    });
}

function getDateYMD(date) {

    if (typeof(date) == "number") {
        d = new Date(date);
        return d.getFullYear() + '-' + d.getMonth() + 1 + '-' + d.getDate();
    }
    else {
        return date.getFullYear() + '-' + date.getMonth() + 1 + '-' + date.getDate();
    }
}

function getArticleType(title) {
    if(title.indexOf("晚安")>0){
        return "wanan";
    }
    else if(title.indexOf("树洞")>0){
        return "shudong";
    }
    else if(title.indexOf("表白墙】")>0){
        return "confess";
    }
    else if(title.indexOf("缘分")>0){
        return "photo_guess";
    }
    else if(title.indexOf("对象")>0){
        return "photo_guess";
    }
    else if(title.indexOf("话题")>0){
        return "topic";
    }
    else if(title.indexOf("表白墙")>0){
        return "other";
    }
    else {
        return "advert";
    }

}