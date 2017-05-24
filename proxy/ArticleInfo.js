/**
 * Created by yiweiguo on 2017/2/17.
 */
var EventProxy = require('eventproxy');
var ArticleInfo = require('../models').ArticleInfo;
var ReadUtils=require('../wx_helpers/read_num')
var smsUtils=require('../wx_helpers/smsUtils')

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

exports.saveOrUpdate=function (url, date_time, positon, type, school,school_cn_name,fans,title,digest,cover,read_num,like_num,callback) {
    //ArticleInfo.find({date_time:{"$gt": new Date("2017-01-08").setHours(0,0,0,0), "$lt": new Date("2017-01-08").setHours(23,59,0,0)},
    ArticleInfo.find({url:url},function (err,article) {
        if(err){
            console.log(err);
        }
        if(article!=null&&article.length>0){
            ArticleInfo.update({'_id':article[0]._id},{'read_num':read_num,'like_num':like_num,"hasSyn":0},{},function (err) {
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
            article.digest=digest;
            article.cover=cover;
            article.read_num=read_num;
            article.like_num=like_num;
            article.hasSyn=0;
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

exports.sumByDate=function (dates,callback) {
    console.log("============开始按照日期统计推文阅读情况============")
    var query={};
    var datasets=new  Array();
    async.eachSeries(dates,function (item,callback) {
            var data={}
            async.series([
                function (cb) {
                    query.type="confess";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['fans','like_num'],function (err,articles){
                        console.log("articles的数量+"+articles.length)
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].fans;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.fans=readSum;
                        console.log("所有的粉丝数量:"+data.fans)
                        cb();
                    })
                },
                function (cb) {
                    console.log('item'+item);
                    query.type="confess";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['read_num','like_num'],function (err,articles){
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].read_num;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.confess_sum=readSum;
                        data.confess_per=Math.floor(readSum/data.fans* 100*100) / 100;
                        console.log("所有的表白数量:"+data.confess_sum)
                        cb();
                    })
                },
                function (cb) {
                    query.type="shudong";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['read_num','like_num'],function (err,articles){
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].read_num;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.shudong_sum=readSum;
                        data.shudong_per=Math.floor(readSum/data.fans* 100*100) / 100;
                        console.log("所有的树洞:"+data.shudong_sum)
                        cb();
                    })
                },
                function (cb) {
                    query.type="photo_guess";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['read_num','like_num'],function (err,articles){
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].read_num;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.photo_guess_sum=readSum;
                        data.photo_guess_per=Math.floor(readSum/data.fans* 100*100) / 100;
                        console.log("所有的树洞:"+data.photo_guess_sum)
                        cb();
                    })
                },
                function (cb) {
                    query.type="topic";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['read_num','like_num'],function (err,articles){
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].read_num;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.topic_sum=readSum;
                        data.topic_per=Math.floor(readSum/data.fans* 100*100) / 100;
                        console.log("所有的话题:"+data.topic_sum)
                        cb();
                    })
                },
                function (cb) {
                    query.type="wanan";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['read_num','like_num'],function (err,articles){
                        console.log("articles的数量+"+articles.length)
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].read_num;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.wanan_sum=readSum;
                        data.wanan_per=Math.floor(readSum/data.fans* 100*100) / 100;
                        console.log("所有的晚安数量:"+data.wanan_sum)
                        cb();
                    })
                },
                function (cb) {
                    query.type="other";
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['read_num','like_num'],function (err,articles){
                        console.log("articles的数量+"+articles.length)
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].read_num;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.other_sum=readSum;
                        data.other_per=Math.floor(readSum/data.fans* 100*100) / 100;
                        console.log("所有的其他数量:"+data.other_sum)
                        cb();
                    })
                },

                function (cb) {
                    delete query.type;
                    query.date_time={ "$gt": item.setHours(0, 0, 0, 0),
                        "$lt": item.setHours(23, 59, 0, 0)};
                    ArticleInfo.find(query,['read_num','like_num'],function (err,articles){
                        console.log("articles的数量+"+articles.length)
                        var readSum=0,likeSum=0;
                        if(articles){
                            for(var i=0;i<articles.length;i++){
                                readSum=readSum+articles[i].read_num;
                                likeSum=likeSum+articles[i].like_num;
                            }
                        }
                        data.total_sum=readSum;
                        data.total_per=Math.floor(readSum/data.fans* 100*100) / 100;
                        console.log("所有的数量:"+data.total_sum)
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
            console.log("============按照日期统计推文阅读情况============")
            callback(err,datasets);
        })
}

exports.getAdvertByData=function (data,callback) {
    console.log("there is proxy.Article.getAdvertByData")
    var query={}
    query.type="advert";
    query.date_time={ "$gt": data.setHours(0, 0, 0, 0),
        "$lt": data.setHours(23, 59, 0, 0)};
    console.log("时间："+data)
    ArticleInfo.find(query,['_id','url','title','fans','school_cn_name'],function (err,articles) {
        var readSum = 0, likeSum = 0;
        var adInfo={}
        var adArrArray=[]
        if (articles) {
            console.log("articles.length="+articles.length)
            async.series([
                function (cb) {
                    async.eachSeries(articles,function(ad,cb) {
                        ReadUtils.getReadNow(ad.url,function (err,data) {
                            console.log("data"+data)
                            if(err||!data){
                                console.log(err);
                                cb();
                            }
                            else{
                                ad.read_num=data.readnums;
                                ad.like_num=data.zannums;
                                adInfo=ad;
                                ArticleInfo.update({'_id':ad._id},{'read_num':ad.read_num,'like_num':ad.like_num},{},function (err) {
                                    if(err){
                                        console.log(err);
                                    }
                                })
                                adInfo.expect=Math.ceil(ad.fans*0.07) ;
                                adArrArray.push(adInfo);
                                console.log("广告:"+adInfo.school_cn_name+','+adInfo.title+','+adInfo.read_num+','+adInfo.expect)
                                cb();
                            }
                        })
                    },function (err) {
                        if(err){
                            console.log(err)
                        }
                        else {
                            console.log("===============统计结束===============")
                            cb();
                        }
                    })

                },
                function (cb) {
                    adArrArray.every(function (ad,index) {
                        if(ad.expect<ad.read_num&&ad.read_num>0){
                            console.log("============有异常数据，发送预警信息============")
                            smsUtils.sendSms("广告数据异常请查看",smsUtils.phone,function (err) {
                                if(err){
                                    console.log(err);
                                }
                                else {
                                    console.log("预警信息发送成功")
                                }
                            })
                            return false;
                        }
                    })
                    cb()
                }

            ],function (err) {
                if(err){
                    console.log(err);
                }
                console.log("=================广告阅读量统计预警任务结束=================")
            })

        }
    })
}
exports.updateAdvertByUrl=function (url,callback) {
    console.log("there is proxy.Article.updateAdvertByUrl")
    var query={}
    query.type="advert";
    query.url=url;
    var ad={}
    ArticleInfo.findOne(query,['_id','url'],function (err,article) {
        if (article) {
            console.log("articles.url=" + article.url)

            ReadUtils.getReadNow(article.url, function (err, data) {
                console.log("data" + data)
                if (err || !data) {
                    console.log(err);
                }
                else {
                    ad.read_num = data.readnums;
                    ad.like_num = data.zannums;
                    ArticleInfo.update({'_id': ad._id}, {
                        'read_num': ad.read_num,
                        'like_num': ad.like_num
                    }, {}, function (err) {
                        if (err) {
                            console.log(err);
                            callback(err,null);
                        }
                        callback(null,ad);
                    })
                }

            })
        }
    })
}