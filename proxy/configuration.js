var EventProxy = require('eventproxy');
var Configuration = require('../models').Configuration;

exports.getCountByQuery = function (query, callback) {
    Configuration.count(query, callback);
};

exports.getConfigurationByQuery = function (query, opt, callback) {
    Configuration.find(query,[], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0){
            return callback(null,[]);
        }
        return callback(null,docs);
    });
};

exports.newAndSave = function (type,key,value,description,callback) {
    var configuration = new Configuration();
    configuration.key = key;
    configuration.type = type;

    configuration.value =value;
    configuration.description=description;
    configuration.save(callback);
};
exports.removeById = function (key, callback) {
    Configuration.remove({key:key}, callback);
};

exports.getConfigurationByCode= function (key, callback) {
    Configuration.findOne({key:key}, callback);
};

exports.removeAll = function (callback) {
    Configuration.remove({}, callback);
};
