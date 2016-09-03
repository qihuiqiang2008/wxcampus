var EventProxy = require('eventproxy');

var models = require('../models');
var PostLike = models.PostLike;
var User = require('./user');
var Util = require('../libs/util');

/**
 * 根据主题ID获取主题
 * Callback:
 * - err, 数据库错误
 * - topic, 主题
 * - author, 作者
 * - lastReply, 最后回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */                            //post_id,from_user_id,from_user_name,post.author_id

exports.newAndSave = function (post_id, from_user_id, from_user_name, to_user_id,post_type, callback) {
    var postlike = new PostLike();
    postlike.post = post_id;
    postlike.post_type = post_type;
    postlike.from_user = from_user_id;
    postlike.from_user_name = from_user_name;
    postlike.to_user = to_user_id;
    postlike.save(callback);
};

exports.exsitLikeRecord = function (userId, post_id, callback) {

        PostLike.findOne({from_user: userId, post: post_id}, callback);
};


exports.removeByPostId = function (post_id, callback) {
        PostLike.remove({post: post_id}, callback);

};

exports.getCountByQuery = function (query, callback) {
    PostLike.count(query, callback);
};

exports.getPostLikesByQuery = function (query, opt, callback) {
    PostLike.find(query, [], opt).populate('post').exec(callback);
};

exports.getPostLikesByQueryEx = function (query, opt, callback) {
    PostLike.find(query, [], opt).populate('post').exec(callback);
};

exports.getPostLikesByPostId= function (post_id, callback) {
    PostLike.find({post: post_id},callback)
};

exports.getNotReadCount= function (user_id, callback) {
    PostLike.count({to_user:user_id,to_user_read:false},callback)
};

exports.removeAll = function (callback) {
    PostLike.remove({}, callback);
};
