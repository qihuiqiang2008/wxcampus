/*var User = require('../proxy').User;
var utility = require('utility');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');
var User = require('../proxy').User;
var Post = require('../proxy').Post;
var PostLike = require('../proxy').PostLike;
var PostFav = require('../proxy').PostFav;
var PostReply = require('../proxy').PostReply;
var Message = require('../proxy').Message;
var ConfessInform = require('../proxy').ConfessInform;
var School = require('../proxy').School;
var College = require('../proxy').College;
var FriendBoard = require('../proxy').FriendBoard;
var TradeBoard = require('../proxy').TradeBoard;
var Region = require('../proxy').Region;
exports.reg = function (req, res, next) {
    res.render('front/user/reg');
};*/
var Configuration = require('../proxy').Configuration;

exports.edit = function (req, res, next) {


    Configuration.getConfigurationByCode(req.query.name,{},function(err,configurations){
        if(configurations){
            res.render('back/school/markdownedit',{content:configurations.value,name:req.query.name});
        }else{
            res.render('back/school/markdownedit',{content:"### 请在在这里记录，格式具体参考markdown",name:req.query.name});
        }
    })
};


exports.save = function (req, res, next) {

   /* PostEx.getPostEx({type:"markdown",from_school_cn_name:req.body.name}, {}, function (err, postExs) {
        if(postExs){
             postExs[0].content0=req.body.content;
            postExs[0].save();
            res.render('back/school/markdownshow',{content:req.body.content,name:req.body.name});
        }else{
            PostEx.newAndSave(false, false, "markdown", "qihuiqiang", "nux", "image", "title",req.body.content, "content1", "content2", "content3", "content4", "content5", "content6", function (err) {
                res.render('back/school/markdownshow',{content:req.body.content,name:req.body.name});
            })
        }
    })*/


    Configuration.getConfigurationByCode(req.query.name,{},function(err,configurations){
        if(configurations){
            configurations.value=req.body.content;
            configurations.save()
            res.render('back/school/markdownedit',{content:configurations.value,name:req.query.name});
        }else{

            Configuration.newAndSave("",req.query.name,req.body.content,"", function (err) {
                res.render('back/school/markdownshow',{content:req.body.content,name:req.body.name});
            })
        }
    })


};


//首先查看
exports.view = function (req, res, next) {

    Configuration.getConfigurationByCode(req.query.name,{},function(err,configurations){
        if(configurations){
            res.render('back/school/markdownshow',{content:configurations.value,name:req.query.name});

        }else{
            res.render('back/school/markdownshow',{content:"### 请在在这里记录，格式具体参考markdown",name:req.query.name});

        }
    })

/*    PostEx.getPostEx({type:"markdown",from_school_cn_name:req.query.name}, {}, function (err, postExs) {
        console.log(err)
        if(postExs){
            res.render('back/school/markdownshow',{content:postExs[0].content0,name:req.query.name});
        }else{
            res.render('back/school/markdownshow',{content:"### 请在在这里记录，格式具体参考markdown",name:req.query.name});
        }
    })*/

};



exports.create_activity_show = function (req, res, next) {
    res.render('back/run/create_activity_show');
};

exports.activityList = function (req, res, next) {
    res.render('back/run/activityList');
};

exports.huiyuan = function (req, res, next) {
    res.render('back/run/huiyuan');
};

