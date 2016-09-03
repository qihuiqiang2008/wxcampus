var EventProxy = require('eventproxy');
var Resource = require('../models').Resource;


exports.getCountByQuery = function (query, callback) {
    Resource.count(query, callback);
};

exports.getAResourceByQuery = function (query, opt, callback) {
    Resource.find(query, [], opt, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};

exports.newAndSave = function (belong_group,content,callback) {
    var resource = new Resource();
    resource.content = content;
   // console.log(resource.content);
    resource.belong_group = belong_group;
    resource.save(callback);
};

exports.removeAll = function (callback) {
    Resource.remove({}, callback);
};

exports.removeByResourceId = function (resource_id, callback) {
    Resource.remove({_id: resource_id}, callback);
};

exports.getResourceById = function (id, callback) {
    Resource.findOne({_id:id}, callback);

};

exports.getTodayResource = function (callback) {
    Resource.findOne({},callback);
};

exports.getTodayResourceCount = function (belong_group,created_at, callback) {
    Resource.count({belong_group:belong_group,create_at:created_at}, callback);

};