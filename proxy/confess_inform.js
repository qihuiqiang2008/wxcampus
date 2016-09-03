var EventProxy = require('eventproxy');

var models = require('../models');
var College = models.College;
var ConfessInform = models.ConfessInform;
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

exports.newAndSave = function (confess, user_id,status, callback) {
    var  confessinform= new ConfessInform();
    confessinform.confess = confess;
    confessinform.user_id = user_id;
    confessinform.status = status;
    confessinform.save(callback);
};

exports.removeAll = function (callback) {
    ConfessInform.remove({}, callback);
};


/*var ConfessInformSchema = new Schema({
 confess:{type: ObjectId, ref: 'Post'},
 user_id:{type: ObjectId},
 status:{type:String},
 create_at:{ type: Date, default: Date.now}
 });*/
exports.removeExpireConfess = function (user_id,callback) {
    ConfessInform.remove({create_at:{$lt:new Date(showdate(-7))}},callback);
};

exports.getConfessInformEx = function (user_id,field, callback) {
    console.log("user_id"+user_id);
    ConfessInform.find({user_id:user_id},field, { sort: [ 'create_at', 'desc' ] }).populate('confess').exec(callback);
};

exports.getConfessInform = function (user_id,field,callback) {
    ConfessInform.find({user_id:user_id},field, { sort: [ 'create_at', 'desc' ] }, function (err, docs) {
            if (err) {
                return callback(err);
            }
            if (docs.length === 0) {
                return callback(null, []);
            }
            return callback(null, docs);
        }
    )
};

function showdate(n)
{
    var uom = new Date(new Date()-0+n*86400000);
    uom = uom.getFullYear() + "-" + (uom.getMonth()+1) + "-" + uom.getDate();
    return uom;
}





/**
 * 获取关键词能搜索到的主题数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  Topic.count(query, callback);
};

/**
 * 根据关键词，获取主题列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */