/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var sanitize = require('validator').sanitize;
var User = require('../proxy').User;
var Post = require('../proxy').Post;
var PostReply = require('../proxy').PostReply;
var PostLike = require('../proxy').PostLike;
var EventProxy = require('eventproxy');
var Util = require('../libs/util');
var School = require('../proxy').School;
var College = require('../proxy').College;
var Region = require('../proxy').Region;
var Advise = require('../proxy').Advise;
var TradeBoard = require('../proxy').TradeBoard;
var FriendBoard = require('../proxy').FriendBoard;
var PostFav = require('../proxy').PostFav;
var Message = require('../proxy').Message;
var SchoolEx = require('../proxy').SchoolEx;
var ConfessInform = require('../proxy').ConfessInform;
var Group = require('../proxy').Group;
var Resource = require('../proxy').Resource;
var fs= require('fs');
var path = require('path');
/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */

exports.exportSchool = function (req, res, next) {
    School.getAllSchools(function(err,schools){
        fs.writeFile( "./data/school.json",JSON.stringify(schools,null,4),"utf8",function(err){
            var file ="./data/school.json";
            res.download(file); // S
         //   res.sendfile('./data/school.json');
        })
    });
};
exports.exportSchoolEx = function (req, res, next) {
    SchoolEx.getAllSchoolExsByField('_id appmsgid belong_group cn_name cn_short_name en_name region_code wx_account_id wx_account_name wx_account_password',function(err,schools){
        fs.writeFile( "./data/schoolEx.json",JSON.stringify(schools,null,4),"utf8",function(err){
            var file ="./data/schoolEx.json";
            res.download(file); // S
            //   res.sendfile('./data/school.json');
        })
    });
};


//(_id, cn_name,en_name,cn_short_name, wx_account_name, wx_account_id,wx_account_password,appmsgid,region_code,belong_group
exports.importSchoolEx = function (req, res, next) {
    fs.readFile( "./data/schoolEx.json","utf8",function(err,data){
        var jsonobj=JSON.parse(data);
        for(var i=0;i<jsonobj.length;i++) {
             (function (arg) {
                 SchoolEx.getSchoolExist(jsonobj[arg]._id,function(err,count){
                     if(count==0) {
                         SchoolEx.newAndSave(jsonobj[arg]._id,jsonobj[arg].cn_name,jsonobj[arg].en_name,jsonobj[arg].cn_short_name,jsonobj[arg].wx_account_name,jsonobj[arg].wx_account_id,jsonobj[arg].wx_account_password,jsonobj[arg].appmsgid,jsonobj[arg].region_code,jsonobj[arg].belong_group,function(){
                            console.log("插入中"+jsonobj[arg]._id);
                         });
                     }
                 })
               })(i);
        }
        res.send("true");
    })
};

//(_id, cn_name,en_name,cn_short_name, wx_account_name, wx_account_id,wx_account_password,appmsgid,region_code,belong_group
exports.importSchool= function(req, res, next) {
    fs.readFile( "./data/school.json","utf8",function(err,data){
        var jsonobj=JSON.parse(data);
        for(var i=0;i<jsonobj.length;i++) {
            (function(arg){
                School.getSchoolExist(jsonobj[arg]._id,function(err,count){
                    if(count==0) {
                        //_id,cn_name, en_name,cn_short_name, region_code,wx_account_url,wx_account_name,wx_account_id,belong_group
                        School.newAndSaveEx(jsonobj[arg]._id,jsonobj[arg].cn_name,jsonobj[arg].en_name,jsonobj[arg].cn_short_name,jsonobj[arg].region_code,jsonobj[arg].wx_account_url,jsonobj[arg].wx_account_name,jsonobj[arg].wx_account_id,jsonobj[arg].belong_group,function(){
                            console.log("插入中"+jsonobj[arg]._id);
                        });
                    }
                });
            })(i);
        }
       res.send("true");
    })
};


exports.index = function (req, res, next){
    res.render('back/collection/index',{name:req.query.name||"",count:req.query.count||""});
};
/*exports.User = mongoose.model('User');
exports.Message = mongoose.model('Message');
exports.School = mongoose.model('School');
exports.College = mongoose.model('College');
exports.Post = mongoose.model('Post');
exports.PostReply = mongoose.model('PostReply');
exports.PostLike= mongoose.model('PostLike');
exports.PostFav= mongoose.model('PostFav');
exports.ConfessInform= mongoose.model('ConfessInform');
exports.FriendBoard= mongoose.model('FriendBoard');
exports.TradeBoard= mongoose.model('TradeBoard');
exports.Advise= mongoose.model('Advise');
exports.Region= mongoose.model('Region');*/
exports.drop = function (req, res, next) {
    var collection_name =req.query.collection_name;
    if(collection_name=='post'){
        Post.removeAll(function(err,count){
            res.redirect("/back/collections?name=post&count="+count);
        });
    }else  if(collection_name=='user'){
        User.removeAll(function(err,count){
            res.redirect("/back/collections?name=user&count="+count);
        });
    }else  if(collection_name=='postreply'){
        PostReply.removeAll(function(err,count){
            res.redirect("/back/collections?name=PostReply&count="+count);
        });
    }else  if(collection_name=='postlike'){
        PostLike.removeAll(function(err,count){
            res.redirect("/back/collections?name=PostLike&count="+count);
        });
    }else  if(collection_name=='postfav'){
        PostFav.removeAll(function(err,count){
            res.redirect("/back/collections?name=PostFav&count="+count);
        });
    }else  if(collection_name=='school'){
        School.removeAll(function(err,count){
            res.redirect("/back/collections?name=School&count="+count);
        });
    }else  if(collection_name=='region'){
        Region.removeAll(function(err,count){
            res.redirect("/back/collections?name=Region&count="+count);
        });
    }else  if(collection_name=='college'){
        Region.removeAll(function(err,count){
            res.redirect("/back/collections?name=college&count="+count);
        });
    }else  if(collection_name=='tradeboard'){
        TradeBoard.removeAll(function(err,count){
            res.redirect("/back/collections?name=TradeBoard&count="+count);
        });
    }else  if(collection_name=='friendboard'){
        FriendBoard.removeAll(function(err,count){
            res.redirect("/back/collections?name=FriendBoard&count="+count);
        });
    }else  if(collection_name=='confessinform'){
        ConfessInform.removeAll(function(err,count){
            res.redirect("/back/collections?name=ConfessInform&count="+count);
        });
    }else  if(collection_name=='message'){
        Message.removeAll(function(err,count){
            res.redirect("/back/collections?name=Message&count="+count);
        });
    }else  if(collection_name=='advise'){
        Advise.removeAll(function(err,count){
            res.redirect("/back/collections?name=advise&count="+count);
        });
    }else  if(collection_name=='group'){
        Group.removeAll(function(err,count){
            res.redirect("/back/collections?name=group&count="+count);
        });
    }else  if(collection_name=='schoolEx'){
        SchoolEx.removeAll(function(err,count){
            res.redirect("/back/collections?name=SchoolEx&count="+count);
        });
    }else  if(collection_name=='source'){
        Resource.removeAll(function(err,count){
            res.redirect("/back/collections?name=source&count="+count);
        });
    }
    else{res.render('back/collection/index');}
};