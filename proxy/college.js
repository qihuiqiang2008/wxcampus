var EventProxy = require('eventproxy');

var models = require('../models');
var College = models.College;
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

exports.removeAll = function (callback) {
    College.remove({}, callback);
};


exports.removeById = function (id, callback) {
    College.remove({_id: id}, callback);
};

exports.newAndSave = function (name, school_id, callback) {
    var college = new College();
    college.name = name;
    college.school_id = school_id;
    college.save(callback);
};

exports.getCollegesBySchool = function (school_id, callback) {
    College.find({school_id: school_id}, callback);
};


exports.getCollegeById = function (id, callback) {
    College.findOne({_id:id}, callback);
};

