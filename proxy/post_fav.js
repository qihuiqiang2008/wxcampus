var models = require('../models');
var PostFav = models.PostFav;
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
 */

exports.newAndSave = function (post_id, from_user_id, from_user_name, to_user_id,post_type, callback) {
    var postfav = new PostFav();
    postfav.post = post_id;
    postfav.post_type = post_type;
    postfav.from_user = from_user_id;
    postfav.from_user_name = from_user_name;
    postfav.to_user = to_user_id;
    postfav.save(callback);
};

exports.exsitFavRecord = function (userId, post_id, callback) {
    PostFav.findOne({from_user: userId, post: post_id}, callback);
};


exports.removeByPostId = function (post_id, callback) {
      PostFav.remove({post: post_id}, callback);

};

exports.getCountByQuery = function (query, callback) {
    PostFav.count(query, callback);
};

exports.getPostFavsByQuery = function (query, opt, callback) {
     PostFav.find(query, [], opt).populate('post').exec(callback);
};

exports.getPostFavsByPostId= function (post_id, callback) {
    PostFav.find({post: post_id},callback)
};

exports.removeAll = function (callback) {
    PostFav.remove({}, callback);
};
