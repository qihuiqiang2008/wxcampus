var EventProxy = require('eventproxy');
var AD = require('../models').AD;


exports.getAdviseByQuery = function (query, opt, callback){
    AD.find(query, [], opt, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
}

exports.getAdByTime = function (begin, end, opt, callback){
    AD.find({'slot.date':{'$gte':begin, '$lte':end}}, callback);
}

exports.getCountByQuery = function (query, callback) {
    AD.count(query, callback);
};

exports.newAndSave = function (name, slot, custom, discount, price, sponsor, is_clear, callback) {
    var ad = new AD();
    ad.name = name;
    ad.slot = slot;
    ad.custom = custom;
    ad.discount = discount;
    ad.price = price;
    ad.sponsor = sponsor;
    ad.is_clear = is_clear;
    ad.save(callback);
    console.log("new and save advertise!!");
};

exports.removeAll = function (callback) {
    AD.remove({}, callback);
};

exports.removeByADId = function (advise_id, callback) {
    AD.remove({_id: advise_id}, callback);
};

exports.getADById = function (id, callback) {
    AD.findOne({_id:id}, callback);

};
