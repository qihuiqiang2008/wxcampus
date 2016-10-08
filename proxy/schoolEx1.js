var models = require('../models');
var School = models.School;
var SchoolEx = models.SchoolEx;
var SchoolEx1 = models.SchoolEx1;
var User = require('./user');
var Util = require('../libs/util');
var NodeCache = require( "node-cache" );
var myCache = new NodeCache();

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

exports.getCountByQuery = function (query, callback) {
    SchoolEx1.count(query, callback);
};

exports.getSchoolsByQuery = function (query, opt, callback) {
    SchoolEx1.find(query, [], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};

exports.removeById = function (id, callback) {
    SchoolEx1.remove({_id: id}, callback);
};

exports.updateBoardById = function (id,board,callback) {
    console.log(board)
    SchoolEx1.update({_id:id}, {$set:{board:board}}, function(err){
         myCache.flushAll();
         return callback(err);
    })
};

/*_id:{type: ObjectId },
cn_name:{ type: String },
cn_short_name:{type: String },
wx_account_name: {type: String },
wx_account_password: {type: String },
appmsgid: {type: String },
secret_title: {type: String },
secret_content: {type: String },
confess_title: {type: String },
confess_data: {type: String },
region_code: { type: String },
belong_group:{type: Number, default: 0},
create_at: { type: Date, default: Date.now }*/
exports.newAndSave = function (_id, cn_name,en_name,cn_short_name, wx_account_name, wx_account_id,wx_account_password,appmsgid,region_code,belong_group,callback) {
    var schoolEx = new SchoolEx1();
    schoolEx._id = _id;
    schoolEx.cn_name = cn_name;
    schoolEx.en_name = en_name;
    schoolEx.cn_short_name = cn_short_name;
    schoolEx.wx_account_name = wx_account_name;
    schoolEx.wx_account_id = wx_account_id;
    schoolEx.wx_account_password = wx_account_password;
    schoolEx.appmsgid = appmsgid;
    schoolEx.region_code = region_code;
    schoolEx.belong_group = belong_group;
    schoolEx.save(callback);
};

exports.getAllSchoolExs = function (callback) {
    SchoolEx1.find({}, [], {sort: [['create_at', 'asc']]}, callback);
};

exports.getAllSchoolExsByField = function (field,callback) {
    SchoolEx1.find({}, field, {sort: [['create_at', 'asc']]}, callback);
};

exports.getSchoolsByRegion = function (query, opt, callback) {
    SchoolEx1.find(query,'_id cn_name en_name', opt, function (err, docs) {
        console.log(docs)
        if (err) {
            console.log("error")
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(err, docs);
    });
};

exports.getSchoolByEname = function (ename, callback) {
    SchoolEx1.findOne({en_name:ename}, callback);
};


exports.getSchoolBywxId = function (id, callback) {
    SchoolEx1.findOne({wx_account_id:id}, callback);
};



exports.getSchoolById = function (id, callback) {
    SchoolEx1.findOne({_id:id}, callback);
};

exports.getSchoolExExist= function (id, callback) {
    SchoolEx1.count({_id:id}, callback);
};

exports.getSchoolCacheById = function (id, callback) {
    if((!id)||id.length<=0){callback(null,'')}else {
        myCache.get(id, function (err, value) {
            if (err) {
                return   callback(null, "");
            }
            if (typeof(value[id]) == 'undefined') {
                School.findOne({_id: id}, "", function (err, value) {
                    myCache.set(id, value, function (err, success) {

                    });
                    return  callback(null, value);
                });
            } else {
                console.log("缓存啦");
                return callback(null, value[id]);
            }
        });
    }
};


exports.flush_borad_cache= function () {
   return  myCache.flushAll();
}
exports.removeAll = function (callback) {
    SchoolEx.remove({}, callback);
};


exports.getSchoolExsByQuery = function (query, opt, callback) {
    SchoolEx.find(query, [], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};