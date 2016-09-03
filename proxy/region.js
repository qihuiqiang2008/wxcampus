var EventProxy = require('eventproxy');
var Region = require('../models').Region;

exports.getCountByQuery = function (query, callback) {
    Region.count(query, callback);
};

exports.getRegionByQuery = function (query, opt, callback) {
    Region.find(query,[], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0){
            return callback(null,[]);
        }
        return callback(null,docs);
    });
};

exports.newAndSave = function (name,region_code,belong_group,callback) {
    var region = new Region();
    region.name = name;
    region.region_code =region_code;
    region.belong_group=belong_group;
    region.save(callback);
};
exports.removeById = function (id, callback) {
    Region.remove({_id: id}, callback);
};

exports.getRegionByCode= function (region_code, callback) {
    Region.findOne({region_code:region_code}, callback);
};

exports.removeAll = function (callback) {
    Region.remove({}, callback);
};
