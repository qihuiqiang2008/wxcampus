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