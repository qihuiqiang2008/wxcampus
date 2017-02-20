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

exports.saveOrUpdate=function (url, date_time, positon, type, school, title,count,callback) {
    ArticleInfo.find({date_time:{
        "$gt": new Date("2017-01-08").setHours(0,0,0,0),
            "$lt": new Date("2017-01-08").setHours(23,59,0,0)
        },
        positon:positon,school:school},function (err,article) {
        if(err){
            console.log(err);
        }
        if(article!=null&&article.length>0){
            console.log("update:"+article[0].id);
            ArticleInfo.update({'_id':article[0]._id},{'count':count,'url':url,'type':type},{},function (err) {
                if(err){
                    console.log(err);
                }
                callback();
            })
        }
        else{
            console.log("save")
            var article = new ArticleInfo();
            article.url=url;
            article.date_time=date_time;
            article.positon=positon;
            article.type=type;
            article.school=school;
            article.title=title;
            article.count=count;
            article.save(function (err) {
                callback();
            });
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
