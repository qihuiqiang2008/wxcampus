var EventProxy = require('eventproxy');
var models = require('../models');
var PostReply = models.PostReply;
var User = require('./user');
var Util = require('../libs/util');

exports.newAndSave = function (post_id,content,post_user_id,main_id,reply_id,from_user,to_user,callback) {
   var postreply = new PostReply();
    postreply.post = post_id;
    postreply.content =content;
    postreply.post_user_id=post_user_id;
    postreply.main_id=main_id;
    postreply.reply =reply_id;
    postreply.from_user =from_user;
    postreply.to_user = to_user;
    postreply.save(callback);
};

exports.getReply = function (id, callback) {
    PostReply.findOne({_id: id}, callback);
};

exports.removeByPostId = function (post_id, callback) {
        PostReply.remove({post: post_id}, callback);
};

exports.getPostReplysByQuery = function (query, opt, callback) {
        PostReply.find(query, [], opt, function (err, replies) {
            if (err) {
                return callback(err);
            }
            if (replies.length === 0) {
                return callback(null, []);
            }
            var ReplyArray = new Array();
            replies.forEach(function (reply, i) {
                reply.friendly_create_at = Util.format_date(reply.create_at, true);
                if(reply.main_id==null) {
                    ReplyArray.push(reply);
                }else
                {
                    ReplyArray.forEach(function (mainreply, i) {
                        if(mainreply._id.toString()==reply.main_id.toString())
                        {
                            mainreply.children_list.push(reply);
                        }
                        return mainreply;
                    })
                }
                // return secret;
            });
            return callback(null,ReplyArray);
        });
};

exports.getCountByQuery = function (query, callback) {
    PostReply.count(query, callback);
};

exports.getRepliesByQuery = function (query, opt, callback) {
    PostReply.find(query, [], opt).populate('post').populate("reply").exec(callback);

};

exports.getRepliesByQueryEx= function (query, opt, callback) {
    PostReply.find(query, [], opt, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });

};

exports.getNotReadCount = function (user_id, callback) {
    PostReply.count({ $or:[{ 'post_user_id' :user_id,'main_id':null,'to_user_read':false} ,{'to_user._id':user_id,'to_user_read':false}]}, callback);
};



exports.getYestodayReplyCountBySchool = function (school_id,callback) {
    PostReply.count({'from_user.school_id':school_id,'create_at':{"$gte":showdate(-1), "$lt":showdate(0)}}, callback);
};

exports.getYestodayReplyCountByGroup = function (group,callback) {
    PostReply.count({'from_user.belong_group':group,'create_at':{"$gte":showdate(-1), "$lt":showdate(0)}}, callback);
};
function showdate(n)
{
    var uom = new Date(new Date()-0+n*86400000);
    uom = uom.getFullYear() + "-" + (uom.getMonth()+1) + "-" + uom.getDate();
    return uom;
}
exports.removeAll = function (callback) {
    PostReply.remove({}, callback);
};
