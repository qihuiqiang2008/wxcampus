var EventProxy = require('eventproxy');
var async = require('async');
var models = require('../models');
var PostEx = models.PostEx;
var User = require('./user');
var Util = require('../libs/util');
var mongoose = require('mongoose');

//var elasticsearch = require('elasticsearch');
//var client = new elasticsearch.Client({
//    host: 'http://127.0.0.1:9200',
//    log: 'trace'
//});
/**
 * 根据主题ID获取主题
 * Callback:
 * - err, 数据库错误
 * - topic, 主题
 * - author, 作者
 * - lastReply, 最后回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */

function doLotsWork(records,callback){
    async.eachSeries(records, function(item, callback){
        client.create({
            index: 'schools',
            type:item.from_school_en_name,
            id:item._id+"",
            body: {
                content:item.content0,
                publish_date:item.create_at
            }
        }, function (error, response) {
            console.log(error)
            console.log(item.from_school_en_name);
            console.log(item.create_at)
            // ...
             callback();

        });

    },function(err){
        process.nextTick(function(){
            callback();
        });
    });
}



exports.search=function(s,name,callback){
    client.search({
        index: 'schools',
        type:s,
        body: {
            'min_score':6,
            "query" :{
                "match" :{"content": name}
            },
            "highlight" : {
                "pre_tags" : ["<span style='color:red'>"],
                "post_tags" : ["</span>"],
                "fields" : {
                    "content" : {}
                }
            }
        }
    }).then(function (response) {
        var hits = response.hits.hits;
        if(hits.length>0){
            return callback(null,hits);
        }else{

        }

    }).catch(function(err){
        console.log(err)
    });
}

exports.exporttoes=function(school_name,callback){
    console.log("-----------"+school_name)
    var sort = [
        [ 'create_at', 'desc' ]
    ];
    var options = {sort: sort};
    var stream=PostEx.find({},[], options).stream(),cache=[];
    stream.on('data',function(item){
        console.log(item.create_at)
        if(item.type=="confess"){
            cache.push(item);
        }
        if(cache.length==10){
            /** signal mongo to pause reading **/
            stream.pause();
            process.nextTick(function(){
                doLotsWork(cache,function(){
                    cache=[];
                    /** signal mongo to continue, fetch next record **/
                    stream.resume();
                });
            });
        }
    });
    stream.on('end',function(){ console.log('query ended---------------------------------'); });
    stream.on('close',function(){ console.log('query closed'); });
}

exports.newAndSave = function (word_less,sensitive,type,from_school_cn_name,from_school_en_name,image,title,content0,content1,content2,content3,content4,content5,content6,callback) {
      var postEx = new PostEx();
      postEx.type = type;
	  postEx.word_less=word_less;
	  postEx.sensitive = sensitive;
	  postEx.title = title;
      postEx.content0 = content0;
	  postEx.content1 = content1;
      postEx.content2 = content2;
      console.log(content1);
	  postEx.content3 = content3;
	  postEx.content4 = content4;
      postEx.content5 = content5;
      postEx.content6 = content6;   
	  postEx.from_school_en_name = from_school_en_name;
	  postEx.from_school_cn_name = from_school_cn_name;
	  postEx.image = image;
	  postEx.image_from ="local";
      postEx.save(callback);
};

exports.newAndSaveEx=function(post,callback){
     var postEx = new PostEx();
      postEx.type = post.type;
	  postEx.common=true;
	  postEx.word_less= post.word_less;
	  postEx.sensitive =  post.sensitive;
	  postEx.title =  post.title;
      postEx.content0 =  post.content0;
	  postEx.content1 =  post.content1;
      postEx.content2 =  post.content2;
	  postEx.content3 =  post.content3;
	  postEx.content4 =  post.content4;
      postEx.content5 =  post.content5;
      postEx.content6 =  post.content6;   
	  postEx.from_school_en_name =  post.from_school_en_name;
	  postEx.from_school_cn_name =  post.from_school_cn_name;
	  postEx.image =  post.image;
	  postEx.create_at =  post.create_at;
	  postEx.image_from ="local";
      postEx.save(callback);

}


exports.newAndSaveTopConfess=function(post,callback){
    var postEx = new PostEx();
    postEx.type = post.type;
    postEx.common=false;
    postEx.word_less= post.word_less;
    postEx.sensitive =  post.sensitive;
    postEx.title =  post.title;
    postEx.content0 =  post.content1;
    postEx.content1 =  "";
    postEx.content2 =  "";
    postEx.content3 =  "";
    postEx.content4 =  "";
    postEx.content5 =  "";
    postEx.content6 =  "";
    postEx.from_school_en_name =  post.from_school_en_name;
    postEx.from_school_cn_name =  post.from_school_cn_name;
    postEx.image =  post.image;
    postEx.create_at =  post.create_at;
    postEx.image_from ="local";
    postEx.save(callback);

}


exports.getPostExById = function (id, callback) {
        PostEx.findOne({_id:id}, callback);

};

exports.getPostExsByQuery = function (query, opt, callback) {
        PostEx.find(query, [], opt, function (err, docs) {
            if (err) {
                return callback(err);
            }
            if (docs.length === 0) {
                return callback(null, []);
            }
            return callback(null,docs);
        });
};

function showdate(n)
{
    var uom = new Date(new Date()-0+n*86400000);
    uom = uom.getFullYear() + "-" + (uom.getMonth()+1) + "-" + uom.getDate();
    return uom;
}


exports.exist = function (content,en_name,callback) {
    PostEx.count({'content0':content,'from_school_en_name':en_name,'create_at':{"$gte":showdate(-1)}}, callback);
};

exports.getCountByQuery = function (query, callback) {
        PostEx.count(query, callback);
};

exports.countByschool=function (school,create_at,callback) {
    var query={};
    if(create_at!=undefined||create_at!=null){
    //if(!typeof (create_at)   ==   "undefined"){
        query.create_at=create_at;
        console.log("create_at is not null 2")
    }

    var amount={};
    amount.en_name=school.en_name;
    async.series([
        function (cb) {
            query.from_school_en_name=school.en_name;
            query.type="confess";
            PostEx.count(query, function (err,count){
                amount.confess=count;
                console.log(school.en_name+"的表白数量:"+amount.confess)
                cb();
            })
        },
        function (cb) {
            query.from_school_en_name=school.en_name;
            query.type="shudong";
            PostEx.count(query, function (err,count){
                amount.shudong=count;
                console.log(school.en_name+"的树洞数量:"+amount.shudong);
                cb();
            })
        },
        function (cb) {
            query.from_school_en_name=school.en_name;
            query.type="photo_guess";
            PostEx.count(query, function (err,count){
                amount.photo_guess=count;
                console.log(school.en_name+"的缘分数量:"+amount.photo_guess);
                cb();
            })
        },
        function (cb) {
            query.from_school_en_name=school.en_name;
            query.type="topic";
            PostEx.count(query, function (err,count){
                amount.topic=count;
                console.log(school.en_name+"的话题数量:"+amount.topic);
                cb();
            })
        },
        function (cb) {
            query.from_school_en_name=school.en_name;
            delete query.type;
            PostEx.count(query, function (err,count){
                amount.total=count;
                console.log(school.en_name+"的总共数量:"+amount.total);
                cb();
            })
        },
        function (cb) {
            //cb();
            callback(amount);
        }

    ])

}
exports.countLastBySchool=function (school,dates,callback) {
    var query={};
    var datasets=new  Array();
    async.eachSeries(dates,function (item,callback) {
        var data={}
        async.series([
            function (cb) {
                console.log('item'+item);
                query.from_school_en_name=school;
                query.type="confess";
                query.create_at={ "$gt": item.setHours(0, 0, 0, 0),
                    "$lt": item.setHours(23, 59, 0, 0)};
                PostEx.count(query, function (err,count){
                    data.confess=count;
                    console.log(school+"的表白数量:"+data.confess)
                    cb();
                })
            },
            function (cb) {
                query.from_school_en_name=school;
                query.type="shudong";
                query.create_at={ "$gt": item.setHours(0, 0, 0, 0),
                    "$lt": item.setHours(23, 59, 0, 0)};
                PostEx.count(query, function (err,count){
                    data.shudong=count;
                    console.log(school+"的树洞数量:"+data.shudong);
                    cb();
                })
            },
            function (cb) {
                console.log('item'+item);
                query.from_school_en_name=school;
                query.type="photo_guess";
                query.create_at={ "$gt": item.setHours(0, 0, 0, 0),
                    "$lt": item.setHours(23, 59, 0, 0)};
                PostEx.count(query, function (err,count){
                    data.photo_guess=count;
                    console.log(school+"的缘分墙数量:"+data.photo_guess)
                    cb();
                })
            },
            function (cb) {
                console.log('item'+item);
                query.from_school_en_name=school;
                query.type="topic";
                query.create_at={ "$gt": item.setHours(0, 0, 0, 0),
                    "$lt": item.setHours(23, 59, 0, 0)};
                PostEx.count(query, function (err,count){
                    data.topic=count;
                    console.log(school+"的话题数量:"+data.topic)
                    cb();
                })
            },
            function (cb) {
                query.from_school_en_name=school;
                delete query.type;
                query.create_at={ "$gt": item.setHours(0, 0, 0, 0),
                    "$lt": item.setHours(23, 59, 0, 0)};
                PostEx.count(query, function (err,count){
                    data.total=count;
                    console.log(school+"的总共数量:"+data.total);
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
/*
Model.find({}, [fields], {'group': 'FIELD'}, function(err, logs) {
    ...
});
*/


