var EventProxy = require('eventproxy');
var Advise = require('../models').Advise;


exports.getCountByQuery = function (query, callback) {
    Advise.count(query, callback);
};

exports.getAdviseByQuery = function (query, opt, callback) {
    Advise.find(query, [], opt, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};

exports.newAndSave = function (from_user,content,callback) {
    var advise = new Advise();
    advise.from_user = from_user;
    advise.content = content;
    advise.save(callback);
};

exports.removeAll = function (callback) {
    Advise.remove({}, callback);
};

exports.removeByAdviseId = function (advise_id, callback) {
    Advise.remove({_id: advise_id}, callback);
};

exports.getAdviseById = function (id, callback) {
    Advise.findOne({_id:id}, callback);

};
