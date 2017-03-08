/**
 * Created by yiweiguo on 2017/2/17.
 */
var EventProxy = require('eventproxy');
var ArticleInfo = require('../models').ArticleInfo;

exports.newAndSave = function (url, date_time, positon, type, school, title,callback) {
    var article = new ArticleInfo();
    article.url=url;
    article.date_time=date_time;
    article.positon=positon;
    article.type=type;
    article.school=school;
    article.title=title;
    article.save(callback);
    console.log("new and save article!!");
};

exports.saveOrUpdate=function (url, date_time, positon, type, school,school_cn_name,fans,title,read_num,like_num,callback) {
    //ArticleInfo.find({date_time:{"$gt": new Date("2017-01-08").setHours(0,0,0,0), "$lt": new Date("2017-01-08").setHours(23,59,0,0)},
    ArticleInfo.find({url:url},function (err,article) {
        if(err){
            console.log(err);
        }
        if(article!=null&&article.length>0){
            ArticleInfo.update({'_id':article[0]._id},{'read_num':read_num,'like_num':like_num},{},function (err) {
                if(err){
                    console.log(err);
                }
                callback();
            })
        }
        else{
            var article = new ArticleInfo();
            article.url=url;
            article.date_time=date_time;
            article.positon=positon;
            article.type=type;
            article.school=school;
            article.school_cn_name=school_cn_name;
            article.fans=fans;
            article.title=title;
            article.read_num=read_num;
            article.like_num=like_num;
            article.save(function (err) {
                callback();
            });
        }
    })
}

exports.updateCount=function (url,read_num,like_num,callback) {
    ArticleInfo.findOne({url:url},
        function (err,article) {
            if(article!=null){
                ArticleInfo.update({'_id':article._id},{'read_num':read_num,'like_num':like_num},{},function (err) {
                    if(err){
                        console.log(err);
                    }
                    callback();}
                )
            }
    })
}

exports.getArticlesByQuery=function (query,opt,callback) {
    ArticleInfo.find(query,[],opt,function (err,articles) {
        if(err){
            console.log(err);
            callback(err,[]);
        }
        else if(articles==undefined||articles.length==0){
            console.log("articles is undefined");
            callback(null,[]);
        }
        else {
            console.log("articles.length="+articles.length)
            callback(null,articles);
        }
        
    })
}

exports.countByQuery=function (query,callback) {
    ArticleInfo.count(query, callback);
}

exports.getLastByCondition=function (school,dates,callback) {
    var query={};
    var datasets=new  Array();
    async.eachSeries(dates,function (item,callback) {
            var data={}
            console.log("时间："+item.setHours(0, 0, 0, 0))
            async.series([
                function (cb) {
                    console.log('item:'+item);
                    query.school=school;
                    query.type="confess";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,function (err,articles){
                        if(err){
                            console.log(err);
                        }
                        else if(articles==undefined||articles.length==0){
                            data.confess=0;
                        }
                        else {
                            data.confess=articles[0].read_num;
                        }
                        console.log(school+"的表白数量:"+data.confess);

                        cb();
                    })
                },
                function (cb) {
                    query.school=school;
                    query.type="wanan";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,function (err,articles){
                        if(err){
                            console.log(err);
                        }
                        else if(articles==undefined||articles.length==0){
                            data.wanan=0;
                        }
                        else {
                            data.wanan=articles[0].read_num;
                        }
                        console.log(school+"的晚安数量:"+data.wanan);

                        cb();
                    })
                },
                function (cb) {
                    query.school=school;
                    query.type="shudong";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query, function (err,articles){
                        if(err){
                            console.log(err);
                        }
                        else if(articles==undefined||articles.length==0){
                            data.shudong=0;
                        }
                        else {
                            data.shudong=articles[0].read_num;
                        }
                        console.log(school+"的树洞数量:"+data.shudong)
                        cb();
                    })
                },
                function (cb) {
                    query.school=school;
                    query.type="photo_guess";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query, function (err,articles){
                        if(err){
                            console.log(err);
                        }
                        else if(articles==undefined||articles.length==0){
                            data.photo_guess=0;
                        }
                        else {
                            data.photo_guess=articles[0].read_num;
                        }
                        console.log(school+"的缘分数量:"+data.photo_guess)
                        cb();
                    })
                },
                function (cb) {
                    console.log('item'+item);
                    query.school=school;
                    query.type="topic";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query, function (err,articles){
                        if(err){
                            console.log(err);
                        }
                        else if(articles==undefined||articles.length==0){
                            data.topic=0;
                        }
                        else {
                            data.topic=articles[0].read_num;
                        }
                        console.log(school+"的缘分数量:"+data.topic)
                        cb();

                    })
                },
                function (cb) {
                    console.log('item'+item);
                    query.school=school;
                    query.type="advert";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query, function (err,articles){
                        if(err){
                            console.log(err);
                        }
                        else if(articles==undefined||articles.length==0){
                            data.advert=0;
                        }
                        else {
                            data.advert=articles[0].read_num;
                        }
                        console.log(school+"的缘分数量:"+data.advert)
                        cb();

                    })
                },
                function (cb) {
                    query.school=school;
                    delete query.type;
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query, function (err,articles){
                        if(err){
                            console.log(err);
                        }
                        else if(articles==undefined||articles.length==0){
                            data.total=0;
                        }
                        else {
                            data.total=0;
                            for(var i=0;i<articles.length;i++){
                                data.total=data.total+articles[i].read_num;
                            }

                        }
                        console.log(school+"的所有数量:"+data.total)
                        cb();

                    })
                },
                function (cb) {
                    //
                    datasets.push(data);
                    callback();
                }
            ],function (err) {
                if(err){
                    console.log(err);
                }

            })
        },
        function (err) {
            if(err){
                console.log(err);
            }
            console.log("==================最近"+dates.length+"天发布数量统计结束==================")
            callback(err,datasets);
        })
}