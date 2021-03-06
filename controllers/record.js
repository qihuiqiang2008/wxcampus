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
var Article = require('../models').ArticleInfo;

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

    School.getSchoolsByQuery(query,options, function (err, schools) {
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

exports.listSchools = function (req, res, next) {
    SchoolEx.getSchoolExsByQueryAndField({}, '_id cn_name en_name erweima', {}, function (err, schoolexs) {
        res.render('back/record/schoolInfo', {schoolexs: schoolexs});
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
                try {
                    login(schoolEx, function (err, results) {
                        if(err){
                            console.log(school_en_name+"登录失败");
                            cb(err);
                        }
                        loadResult = results;
                        console.log(school_en_name+"登录成功");
                        cb();
                    });
                }
                catch (e){
                    console.log(e);
                }


            },

            function (cb) {
                request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN')
                    .set('Cookie', loadResult.cookie)
                    .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                    .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                    .end(function (res) {
                        console.log("res:"+res.text)
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
                                    list.msg_item[i].multi_item[j].title,list.msg_item[i].multi_item[j].digest, list.msg_item[i].multi_item[j].cover,list.msg_item[i].multi_item[j].read_num,
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

exports.batchSaveArticle=function (req,res,next) {
    console.log("进入batchSaveArticle()......")
    var position = 1;
    var loadResult;
    var latest_msg_id;
    var list;
    var schoolEx;
    var query={};
    var skip=0;
    var options={"limit":100};
    var count=0;
    var articleArray=[];
    /*var myInterval=setInterval(function () {*/
        SchoolEx.getSchoolsByQueryAndFiled(query, ['en_name','token' ,'cookie','wx_account_id'],options, function (err, schoolExs) {
            console.log('schools.length' + schoolExs.length);
                async.eachSeries(schoolExs,
                    function (schoolEx, callback) {
                        count++;
                        console.log("======count="+count+"====="+schoolEx.wx_account_id+"=======");
                        if(schoolEx.wx_account_id=='xiangx029'||schoolEx.wx_account_id=='bjgx010'){
                            callback();
                        }else {
                            async.series([
                                    function (cb) { //1.1：登陆。
                                        try {
                                            login(schoolEx, function (err, results) {
                                                if(err){
                                                    console.log(schoolEx.en_name+"登录失败");
                                                    cb(err);
                                                }
                                                loadResult = results;
                                                console.log(schoolEx.en_name+"登录成功");
                                                cb();
                                            });
                                        }
                                        catch (e){
                                            console.log(e);
                                        }

                                    },

                                    function (cb) {
                                        request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN')
                                            .set('Cookie', loadResult.cookie)
                                            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                            .end(function (res) {
                                                //console.log("res:"+res.text)
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
                                                    console.log(schoolEx.en_name+"html解析错误")
                                                    cb(err);
                                                }

                                            });

                                    },
                                    function (cb) {
                                        var start = new Date().setHours(0, 0, 0, 0);
                                        var end = new Date().setHours(23, 59, 59, 0);
                                        console.log(schoolEx.en_name+'===================开始保存文章信息===================')
                                        for (var i = 0; i < list.msg_item.length; i++) {
                                            for (var j = 0; j < list.msg_item[i].multi_item.length; j++) {
                                                //console.log("update:" + list.msg_item[i].multi_item[j].title);
                                                var url = escape2Html(list.msg_item[i].multi_item[j].content_url);
                                                var type = getArticleType(list.msg_item[i].multi_item[j].title);

                                                ArticleInfo.saveOrUpdate(url, new Date(list.msg_item[i].date_time * 1000),
                                                    list.msg_item[i].multi_item[j].seq, type, schoolEx.en_name, schoolEx.cn_name, schoolEx.fans,
                                                    list.msg_item[i].multi_item[j].title,list.msg_item[i].multi_item[j].digest, list.msg_item[i].multi_item[j].cover,list.msg_item[i].multi_item[j].read_num,
                                                    list.msg_item[i].multi_item[j].like_num,
                                                    function (err) {
                                                        if (err) {
                                                            console.log(err);
                                                            cb(err);
                                                        }

                                                    });

                                                var article={};
                                                article.url=url;
                                                article.date_time=new Date(list.msg_item[i].date_time * 1000);
                                                article.positon=list.msg_item[i].multi_item[j].seq;
                                                article.type=type;
                                                article.school=schoolEx.en_name;
                                                article.school_cn_name=schoolEx.cn_name;
                                                article.fans=schoolEx.fans;
                                                article.title=list.msg_item[i].multi_item[j].title;
                                                article.digest=list.msg_item[i].multi_item[j].title,list.msg_item[i].multi_item[j].digest;
                                                article.cover=list.msg_item[i].multi_item[j].cover;
                                                article.read_num=list.msg_item[i].multi_item[j].read_num;
                                                article.like_num=list.msg_item[i].multi_item[j].like_num;
                                                article.wx_account_id=schoolEx.wx_account_id;
                                                articleArray.push(article);


                                            }
                                        }
                                        /*try{
                                            request.post('http://ab.welife001.com/data/synArticles')
                                                .send({ articleArray: articleArray })
                                                .set('X-API-Key', 'foobar')
                                                .set('Accept', 'application/json')
                                                .end(function(res){
                                                    //console.log(res);
                                                });
                                        }catch(e){
                                            console.log(e);
                                        }*/
                                        console.log("===========================end==========================")
                                        cb();
                                    }
                                ],
                                function (err) {
                                    if(err){
                                        console.log('保存文章信息失败'+err)
                                        callback();
                                    }
                                    callback();
                                }

                            );
                        }

                },
                function (err) {
                    console.log("==========表白树洞PV统计结束......开始同步==========");
                    var query={"hasSyn":0};

                    ArticleInfo.getArticlesByQuery(query,{},function (err,articles) {
                        console.log("数组长度:"+articles.length)
                        for(var i=0;i<articles.length;i++){
                            Article.update({'_id':articles[i]._id},{'hasSyn':1},{},function (err) {
                                if(err){
                                    console.log(err);
                                }

                            })
                        }
                        request.post('http://ab.welife001.com/data/synArticles')
                            .send({ articles: articles})
                            .set('X-API-Key', 'foobar')
                            .set('Accept', 'application/json')
                            .end(function(res){
                                //console.log(res);
                            });

                    })

                });
        });
   /* },10000,"Interval");*/

}

function syn_article(article,url) {

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
        /*query.date_time = {
            "$gt": +new Date(new Date()-24*60*60*1000),
            "$lt": new Date().setHours(23, 59, 0, 0)
        }*/
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

            ['date_time','desc'],
            ['positon','asc'],
            ['school','desc'],
            ['fans','desc']

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


exports.getArticleByDate = function (req, res, next) {
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
            res.render('back/record/articles-all',{
                datasets:datasets,
                labels:labels,
            })
        });

    proxy.fail(next);

    ArticleInfo.sumByDate(dates,function (err,datasets) {
        proxy.emit('datasets', datasets);
    });
};

exports.warnAdvertRead = function (req, res, next) {

    var today=new Date();
    var yesterday=new Date();
    yesterday.setDate(today.getDate()-1);

    /*var proxy = EventProxy.create('datasets',
     function (datasets) {
     res.render('back/record/articles-all',{
     datasets:datasets,
     labels:labels,
     })
     });

     proxy.fail(next);*/

    ArticleInfo.getAdvertByData(yesterday,function (err,datasets) {
        proxy.emit('datasets', datasets);
    });
};

exports.saveArticleSchedule = function (req, res, next) {
    console.log('================定时任务[获取推送阅读量]开始执行================');
    SchoolEx.getSchoolExsByQueryAndField({}, 'en_name', {}, function (err, schoolexs) {
        if(schoolexs){
            schoolexs.forEach(function (school,index) {
                console.log("en_name:"+school.en_name)
                var data=JSON.stringify({"en_name":school.en_name})
                request.post('http://localhost:8080/back/record/saveArticle')
                    .set('Content-Type', 'application/json')
                    .send(data)
                    .end(function (err,res) {
                        if(err){
                            console.log(err);
                        }
                        //console.log(res)
                    })
            })
        }
    });
    console.log('================定时任务[获取推送阅读量]执行结束================');
};
exports.getAdverts = function (req, res, next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 50;
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

    }
    if(school !=undefined&&school!=""){
        query.school_cn_name = school;
        console.log('enddate2:'+endDate);
    }
    var options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: [
            ['date_time','desc'],
            ['positon','asc'],
            ['school','desc'],
            ['fans','desc']

        ]
    };
    var view = 'back/record/adverts.html';

    var proxy = EventProxy.create('articles', 'pages',
        function (articles, pages, TodayResourceCount, regions, ads) {
            res.render(view, {
                articles: articles,
                pages: pages,
                current_page: page,
            });
        });


    proxy.fail(next);
    query.type='advert';
    ArticleInfo.getArticlesByQuery(query, options, proxy.done("articles"));
    ArticleInfo.countByQuery(query, proxy.done(function (err, all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
}
exports.getReadNow = function (req, res, next) {
    var url=unescape(req.body.url);
    console.log(url)
    ArticleInfo.updateAdvertByUrl(url,function (err,ad) {
        if(err){
            console.log(err);
            return res.json({success: false});
        }
        else{
            console.log("ad:"+ad.like_num+","+ad.read_num);
            return res.json({success: true,data:ad});
        }
    })
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


function escape2Html(str) {
    var arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
        return arrEntities[t];
    });
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