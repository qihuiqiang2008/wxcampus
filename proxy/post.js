var EventProxy = require('eventproxy');

var models = require('../models');
var Post = models.Post;
var User = require('./user');
var Util = require('../libs/util');
var mongoose = require('mongoose');
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

exports.newAndSave = function (type,content,from_user,confess_to,callback) {
      var post = new Post();
      post.content = content;
      post.type = type;
      post.from_user=from_user;
      post.last_update_type="create";
      post.confess_to=confess_to;
      post.save(callback);
};

exports.addReply = function (id,reply,callback) {
        Post.update({_id:id},{$push:{"replylist":reply}},callback)

};

exports.removeReply = function (id,replyid,callback) {
     Post.update({_id:id},{$pull:{replylist:{_id:new mongoose.Types.ObjectId(replyid)}}},callback);

};

exports.getCountByQuery = function (query, callback) {
        Post.count(query, callback);
};

exports.getPostsByQuery = function (query, opt, callback) {

        Post.find(query, [], opt, function (err, docs) {
            if (err) {
                return callback(err);
            }
            if (docs.length === 0) {
                return callback(null, []);
            }
            return callback(null,docs);
        });

};

exports.getPostById = function (id, callback) {
        Post.findOne({_id:id}, callback);

};

/**
 * 更新赞的人数
 * @param {String} topicId 主题ID
 * @param {String} replyId 回复ID
 * @param {Function} callback 回调函数
 */
exports.updateLikeCount= function (post_id,callback) {
        Post.findOne({_id: post_id}, function (err, post) {
            if (err || !post) {
                return callback(err);
            }
            post.like_count += 1;
            post.save(callback);
        });
};

exports.test = function ( callback) {
  Post.remove({create_at:{$lt:new Date(showdate(0))}}, function (err,doc) {
      console.log(err);
  })
}
exports.confessToInform = function (college_id,field,callback) {
    Post.find({type:"confess",'confess_to.college_id':college_id,create_at:{$gt:new Date(showdate(-7))}},field,{ sort: [ 'create_at', 'desc' ] }, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return  callback(null,docs);
    })
};


function showdate(n)
{
    var uom = new Date(new Date()-0+n*86400000);
    uom = uom.getFullYear() + "-" + (uom.getMonth()+1) + "-" + uom.getDate();
    return uom;
}


exports.getYestodayPostCountBySchool = function (type,school_id,callback) {
    Post.count({'type':type,'from_user.school_id':school_id,'create_at':{"$gte":showdate(-1), "$lt":showdate(0)}}, callback);
};

exports.getYestodayPostCountByGroup = function (type,group,callback) {
    Post.count({'type':type,'from_user.belong_group':group,'create_at':{"$gte":showdate(-1), "$lt":showdate(0)}}, callback);
};

exports.removeAll = function (callback) {
    Post.remove({}, callback);
};
/*
Model.find({}, [fields], {'group': 'FIELD'}, function(err, logs) {
    ...
});
*/


