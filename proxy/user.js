var models = require('../models');
var User = models.User;

/**
 * 根据用户名列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} names 用户名列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByNames = function (names, callback) {
  if (names.length === 0) {
    return callback(null, []);
  }
  User.find({ name: { $in: names } }, callback);
};

/**
 * 根据登录名查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} loginName 登录名
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName = function (loginName, callback) {
  User.findOne({'loginname': loginName}, callback);
};

exports.getUserByEmail = function (email, callback) {
    User.findOne({'email': email}, callback);
};

/**
 * 根据用户ID，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
  User.findOne({_id: id}, callback);
};


exports.getUserByWgateid = function (wgateid, callback) {
  User.findOne({wgateid: wgateid}, callback);
};
/**
 * 根据用户名，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} name 用户名
 * @param {Function} callback 回调函数
 */
exports.getUserByName = function (name, callback) {
  User.findOne({name: name}, callback);
};

/**
 * 根据邮箱，查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */
exports.getUserByMail = function (email, callback) {
  User.findOne({email: email}, callback);
};

/**
 * 根据用户ID列表，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} ids 用户ID列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds = function (ids, callback) {
  User.find({'_id': {'$in': ids}}, callback);
};

/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, opt, callback) {
  User.find(query, [], opt, callback);
};

/**
 * 根据查询条件，获取一个用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} name 用户名
 * @param {String} key 激活码
 * @param {Function} callback 回调函数
 */
exports.getUserByQuery = function (name, key, callback) {
  User.findOne({name: name, retrieve_key: key}, callback);
};

exports.newAndSave = function (name,sex, pwd, email,location,callback) {
  var user = new User();
  user.name = name;
  user.sex=sex;
  user.pass = pwd;
  user.email = email;
  user.location=location;
  user.save(callback);
};
exports.newAndSave = function (wgateid,name,sex, pwd, email,location,callback) {
    var user = new User();
    user.wgateid = wgateid;
    user.name = name;
    user.sex=sex;
    user.pass = pwd;
    user.email = email;
    user.location=location;
    user.save(callback);
};
exports.getCountByQuery = function (query, callback) {
    User.count(query, callback);
};

exports.getYestodayUserCountBySchool = function (school_id,callback) {
    User.count({'location.school_id':school_id,'create_at':{"$gte":showdate(-1), "$lt":showdate(0)}}, callback);
};

exports.getYestodayUserCountByGroup = function (group,callback) {
    User.count({'location.belong_group':group,'create_at':{"$gte":showdate(-1), "$lt":showdate(0)}}, callback);
};
function showdate(n)
{
    var uom = new Date(new Date()-0+n*86400000);
    uom = uom.getFullYear() + "-" + (uom.getMonth()+1) + "-" + uom.getDate();
    return uom;
}
exports.removeAll = function (callback) {
    User.remove({}, callback);
};
