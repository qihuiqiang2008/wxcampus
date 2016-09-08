var models = require('../models');
var School = models.School;
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
    School.count(query, callback);
};

exports.getSchoolsByQuery = function (query, opt, callback) {
    School.find(query, [], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};

exports.getSchoolExist= function (id, callback) {
    School.count({_id:id}, callback);
};

exports.removeById = function (id, callback) {
    School.remove({_id: id}, callback);
};

exports.removeByEnname = function (Enname, callback) {
    School.remove({en_name: Enname}, callback);
};

exports.updateBoardById = function (id,board,callback) {
   // console.log(board)
    School.update({_id:id}, {$set:{board:board}}, function(err){
         myCache.flushAll();
         return callback(err);
    })
};

exports.newAndSave = function (cn_name, en_name,cn_short_name, region_code,wx_account_url,wx_account_name,wx_account_id,belong_group,callback) {
    var school = new School();
    school.cn_name = cn_name;
    school.en_name = en_name;
    school.cn_short_name = cn_short_name;
    school.region_code = region_code;
    school.belong_group = belong_group;
    school.wx_account_url = wx_account_url;
    school.wx_account_name = wx_account_name;
    school.wx_account_id = wx_account_id;
    school.save(callback);
};

exports.newAndSaveEx= function (_id,cn_name, en_name,cn_short_name, region_code,wx_account_url,wx_account_name,wx_account_id,belong_group,callback) {
    var school = new School();
    school._id=_id;
    school.cn_name = cn_name;
    school.en_name = en_name;
    school.cn_short_name = cn_short_name;
    school.region_code = region_code;
    school.belong_group = belong_group;
    school.wx_account_url = wx_account_url;
    school.wx_account_name = wx_account_name;
    school.wx_account_id = wx_account_id;
    school.save(callback);
};

exports.getAllSchools = function (callback) {
    School.find({}, [], {sort: [['create_at', 'asc']]}, callback);
};

exports.getSchoolsByRegion = function (query, opt, callback) {
    School.find(query,'_id cn_name en_name', opt, function (err, docs) {
        //console.log(docs)
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
    School.findOne({en_name:ename}, callback);
};

exports.getSchoolById = function (id, callback) {
    School.findOne({_id:id}, callback);
};

exports.getSchoolBywxId = function (id, callback) {
    School.findOne({wx_account_id:id}, callback);
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
                //console.log("缓存啦");
                return callback(null, value[id]);
            }
        });
    }
};

exports.getSchoolCacheByEname = function (ename, callback) {
    if((!ename)||ename.length<=0){callback(null,'')}else {
        myCache.get(ename, function (err, value) {
            if (err) {
                return callback(null, "");
            }
            if (typeof(value[ename]) == 'undefined') {
                School.findOne({en_name: ename}, "", function (err, value) {
                    myCache.set(ename, value, function (err, success) {
                    });
                    return  callback(null, value);
                });
            } else {
                return callback(null, value[ename]);
            }
        });
    }
};


exports.flush_borad_cache= function () {
   return  myCache.flushAll();
}
exports.removeAll = function (callback) {
    School.remove({}, callback);
};
