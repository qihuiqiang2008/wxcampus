var EventProxy = require('eventproxy');
var School = require('../proxy').School;
var Region = require('../proxy').Region;
var PostEx=require('../proxy').PostEx;
async = require('async');
var PV=require('../proxy/PV')
var SchoolEx = require('../proxy').SchoolEx;
var login = require(__dirname + '/../wx_helpers/login');
require('../wx_helpers/md5');
var request = require("superagent");
var ArticleInfo=require('../proxy').ArticleInfo;
var http = require("http");
var urlutil=require('url');
var querystring = require('querystring');
var crypto = require('crypto');

exports.getPostsRecord = function (req, res, next) {
    
    //获取查询的开始时间和结束时间
    var startDate,endDate;
    var create_at;
    if (req.query.startDate != undefined) {
        startDate = req.query.startDate;
    }
    if(req.query.endDate != undefined){
        endDate = req.query.endDate;
    }
    console.log("begin:"+new Date(startDate));
    console.log("end:"+new Date(endDate));
    if(startDate!=undefined&&endDate!=undefined){
        create_at={
            "$gt": new Date(startDate),
            "$lt": new Date(endDate)
        }
        console.log("create_at is not null")
    }
    var view = 'back/record/posts';
    var query={}
    var limit = 200;
    var page = parseInt(req.query.page, 10) || 1;
    var options = {
        skip: (page - 1) * limit, limit: limit, sort: [
            ['create_at', 'asc']
        ]
    };
    page = page > 0 ? page : 1;
    var proxy=EventProxy.create('schools','pages','amounts',
        function (schools,pages) {
            res.render(view,{
                schools:schools,
                pages: pages,
                amounts:JSON.stringify(amounts),
                current_page: page,
            })
    })
    proxy.fail(next);
    //School.getSchoolsByQuery(query,options,proxy.done('schools'));
    var amounts=new Array();
    School.getSchoolsByQuery(query,options,function (err,schools){
        proxy.emit('schools', schools);
        console.log('schools.length'+schools.length);
        async.eachSeries(schools,
            function (school,callback){
                PostEx.countByschool(school,create_at,function (amount) {
                    console.log("amount:"+amount.confess)
                    amounts.push(amount)
                    /*if(school.en_name=='ujs'){
                     console.log("表白树洞统计结束......"+amounts.length);
                     }*/
                    callback();
                })
            },
            function (err){
                console.log("表白树洞统计结束......"+amounts[3].total);
                proxy.emit('amounts', amounts);
                //cb();
            });
    });
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
};

exports.getPvs=function (req, res, next) {
    var startDate,endDate;
    if (req.query.startDate != undefined) {
        startDate = req.query.startDate;
    }
    if(req.query.endDate != undefined){
        endDate = req.query.endDate;
    }
    console.log("begin:"+new Date(startDate));
    console.log("end:"+new Date(endDate).setDate(new Date(endDate).getDate()+1));
    var create_at;
    if(startDate!=undefined&&endDate!=undefined){
        create_at={
            "$gt": new Date(startDate),
            "$lt": new Date(endDate).setDate(new Date(endDate).getDate()+1)
        }
        console.log("create_at is not null")
    }

    var view = 'back/record/pvs';

    var query={}
    var limit = 200;
    var page = parseInt(req.query.page, 10) || 1;
    var options = {
        skip: (page - 1) * limit, limit: limit, sort: [
            ['schools', 'asc']
        ]
    };
    page = page > 0 ? page : 1;

    var proxy=EventProxy.create('schools','pages','amounts',
        function (schools,pages) {
            res.render(view,{
                schools:schools,
                pages: pages,
                amounts:JSON.stringify(amounts),
                current_page: page,
            })
        })
    proxy.fail(next);
    var amounts=[];
    School.getSchoolsByQuery(query,options,function (err,schools){
        proxy.emit('schools', schools);
        console.log('schools.length'+schools.length);
        async.eachSeries(schools,
            function (school,callback){
                PV.countByCondition(school,create_at,function (amount) {
                    console.log("amount:"+amount.confess)
                    amounts.push(amount)
                    /*if(school.en_name=='ujs'){
                     console.log("表白树洞统计结束......"+amounts.length);
                     }*/
                    callback();
                })
            },
            function (err){
                console.log("表白树洞PV统计结束......"+amounts[3].total);
                proxy.emit('amounts', amounts);
                //cb();
            });
    });
    School.getCountByQuery(query, proxy.done(function (all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
    
}
exports.gotoSaveArticle=function (req,res,next) {
    SchoolEx.getSchoolExsByQueryAndField({},'_id cn_name en_name',{},function (err, schoolexs) {
        res.render('back/record/saveArticle', {schoolexs: schoolexs});
    });
}
exports.saveArticle=function (req, res, next) {
    var school_en_name=req.body.en_name;
    console.log("school:"+school_en_name);
    var position=1;
    var loadResult;
    var latest_msg_id;
    var list;
    var schoolEx;
    var todayUrlList=new Array();
    async.series([
        function(cb) {
            SchoolEx.getSchoolByEname(school_en_name, function(err, school) {
                schoolEx = school;
                cb();
            })
        },

        function(cb) { //1.1：登陆。
            login(schoolEx, function(err, results) {
                loadResult = results;
                cb();
                console.log("登录成功");
            });
        },

        function(cb) {
            request.get('https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=0&count=10&token=' + loadResult.token + '&lang=zh_CN')
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({ "Accept-Encoding": "gzip,sdch" }) //为了防止出现Zlib错误
                .end(function(res) {
                    //console.log("res:"+res.text);
                    var start = res.text.indexOf("window.wx =")
                    var end = res.text.indexOf("path:")

                    var indexHead = res.text.indexOf('wx.cgiData =');
                    indexHead = res.text.indexOf('list :', indexHead);
                    var indexTail = res.text.indexOf('.msg_item', indexHead);
                    var html = res.text.slice(indexHead + 'list :'.length, indexTail).trim();
                    html = html.slice(1, -1);
                    list=JSON.parse(html)
                    cb();
                });

        }
    ], function(cb) {
        var start=new Date("2017-01-08").setHours(0,0,0,0);
        var end=new Date("2017-01-08").setHours(23,59,59,0);
        console.log("start:"+start)
        console.log("end"+end)
        for(var i=0;i<list.msg_item.length;i++){
            console.log("msg_item[i].date_time:"+new Date(list.msg_item[i].date_time*1000))
            if(list.msg_item[i].date_time*1000<end&&list.msg_item[i].date_time*1000>start){
                //var url=escape2Html(list.msg_item[i].content_url)
                for(var j=0;j<list.msg_item[i].multi_item.length;j++) {
                    var url = escape2Html(list.msg_item[i].multi_item[j].content_url);
                    ArticleInfo.saveOrUpdate(url,new Date(list.msg_item[i].date_time*1000),
                        list.msg_item[i].multi_item[j].seq,"confess",school_en_name,
                        list.msg_item[i].multi_item[j].title,0,function (err) {
                            if(err){
                                console.log(err);
                            }
                        });

                    //todayUrlList.push(list.msg_item[i].multi_item[j].content_url);
                }
            }
        }
        return res.json({success: true});
        }
    );
}

exports.getArticle=function (req,res,next) {
    var page = parseInt(req.query.page, 10) || 1;
    page = 1;//page > 0 ? page : 1;
    var limit = 100;
    var options = {
        skip: (page - 1) * limit,
        limit: limit,
        /*sort: [
            ['region_code', 'asc']
        ]*/
    };
    var query={};
    var view = 'back/record/articles';

    var proxy = EventProxy.create('articles', 'pages',
        function(articles, pages, TodayResourceCount, regions, ads) {
            res.render(view, {
                articles: articles,
                pages: pages,
                current_page: page,
            });
        });


    proxy.fail(next);
    query.date_time={
        "$gt": new Date("2017-01-08").setHours(0,0,0,0),
            "$lt": new Date("2017-01-08").setHours(23,59,0,0)
    }
    ArticleInfo.getArticlesByQuery(query, options, proxy.done("articles"));
    ArticleInfo.countByQuery(query, proxy.done(function(err,all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
}

exports.countArticle=function (res,req,next) {
    //var url=res.query.url;
    var url="http://mp.weixin.qq.com/s?__biz=MjM5OTY0MDk0Mg==&mid=2651269135&idx=4&sn=d7216d402cf9163e0b1eabdcc2c197d3&chksm=bccbe20e8bbc6b18b1e1627d85266ee2ab6df63793b096aaa367d34ad78f4b3dc1751e27969d#rd";
    console.log("url:"+url);
    sendHttpRequest("http://wxapi.51tools.info/wx/api.ashx?key=tp_591320673",'post',url,function (responseData) {
        console.log(responseData);
    });

}

var sendHttpRequest=function(url,type,data,callback){
    var content = querystring.stringify(data,null,null,null);
    var urlObj=urlutil.parse(url);
    var host=urlObj.hostname;
    var path=urlObj.path;
    var port=urlObj.port;
    var options = {
        hostname: host,
        port: port,
        path: path,
        method: type,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(content)
        }
    };
    var responseData="";
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            responseData+=chunk;
        });
        res.on('end', function () {
            callback(responseData);
        });
        //设置超时
        req.setTimeout(1000,function(){
            console.log('request timeout!');
            req.abort();
        });
        req.on('error', function (e) {
            console.log('request ERROR: ' + e.message);
        });
    });
    req.write(content);
    req.end();
};

function escape2Html(str) {
    var arrEntities = { 'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"' };
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all, t) {
        return arrEntities[t];
    });
}

function getDateYMD(date) {

    if (typeof(date)=="number"){
        d=new Date(date);
        return d.getFullYear()+'-'+d.getMonth()+1+'-'+d.getDate();
    }
    else {
        return date.getFullYear()+'-'+date.getMonth()+1+'-'+date.getDate();
    }
}