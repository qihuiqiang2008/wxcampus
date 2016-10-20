var models = require('../models');
var School = models.School;
var SchoolEx = models.SchoolEx;
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
    SchoolEx.count(query, callback);
};

exports.getSchoolsByQuery = function (query, opt, callback) {
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

exports.removeById = function (id, callback) {
    SchoolEx.remove({_id: id}, callback);
};
exports.removeByEnname = function (Enname, callback) {
    SchoolEx.remove({en_name: Enname}, callback);
};


exports.updateBoardById = function (id,board,callback) {
    console.log(board)
    SchoolEx.update({_id:id}, {$set:{board:board}}, function(err){
         myCache.flushAll();
         return callback(err);
    })
};

exports.updateAllConfessTitle = function (confess_title,callback) {
	console.log(confess_title);
    SchoolEx.update({$or:[{belong_group:2}, {belong_group:1}]},{$set:{confess_title:confess_title}}, { multi: true }, function(err){
         return callback(err);
    })
};

exports.updateAlltag = function (tag,callback) {
    console.log("..");
    School.update({$or:[{belong_group:2}, {belong_group:1}]},{$set:{active:false}}, { multi: true }, function(err){
        return callback(err);
    })
};

exports.updateAllSecretTitle = function (secret_title,callback) {
    console.log(secret_title);
    SchoolEx.update({$or:[{belong_group:2}, {belong_group:1}]},{$set:{secret_title:secret_title}}, { multi: true }, function(err){
        return callback(err);
    })
};
	



exports.updateAllPhoto_guessTitle = function (photo_guess_title,callback) {
    SchoolEx.update({$or:[{'belong_group':2}, {'belong_group':1}]},{$set:{photo_guess_title:photo_guess_title}}, { multi: true }, function(err){
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
    var schoolEx = new SchoolEx();
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
    SchoolEx.find({}, [], {sort: [['create_at', 'asc']]}, callback);
};

exports.getAllSchoolExsByField = function (field,callback) {
    SchoolEx.find({}, field, {sort: [['create_at', 'asc']]}, callback);
};


exports.getSchoolBywxId = function (id, callback) {
    SchoolEx.findOne({wx_account_id:id}, callback);
};

exports.getSchoolExist= function (id, callback) {
    SchoolEx.count({_id:id}, callback);
};

exports.getSchoolsByRegion = function (query, opt, callback) {
    SchoolEx.find(query,'_id cn_name en_name', opt, function (err, docs) {
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
     SchoolEx.findOne({en_name:ename}, callback);
};

exports.getSchoolById = function (id, callback) {
     SchoolEx.findOne({_id:id}, callback);
};

exports.getSchoolCacheById = function (id, callback) {
    if((!id)||id.length<=0){callback(null,'')}else {
        myCache.get(id, function (err, value) {
            if (err) {
                return callback(null, "");
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

exports.getSchoolExsByQueryAndField = function (query,field, opt, callback) {
    SchoolEx.find(query, field, opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};