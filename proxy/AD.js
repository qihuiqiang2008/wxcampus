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
    AD.find({'del':false, 'slot.date':{'$gte':begin, '$lte':end}}, callback);
}

exports.getCountByQuery = function (query, callback) {
    AD.count(query, callback);
};

exports.getAd = function(start, page_size, callback){
    AD.find({'del':false}).sort('create_at', 'descending').skip(start).limit(page_size).exec(callback);
};

exports.getAdById = function(id, callback){
    AD.find({'_id':id}).exec(callback);
};

exports.getCount = function(callback){
    AD.count({'del':false}, callback);
};

exports.delAd = function(id, callback){
    AD.update({'_id':id}, {'del':true}, {}, callback);
}

exports.clearAd = function(id, callback){
        AD.update({'_id':id, 'del':false}, {'is_clear':true}, {}, callback);
}

exports.updateAd = function(conditions, query, opt, callback){
    AD.update(conditions, query, opt, callback);
}

exports.update = function (id, name, slot, custom, discount, price, sponsor, is_clear, remark, callback){
    var ad = {};
    ad.name = name;
    ad.slot = slot;
    ad.custom = custom;
    ad.discount = discount;
    ad.price = price;
    ad.sponsor = sponsor;
    ad.is_clear = is_clear;
    ad.remark = remark;
    var query = JSON.stringify(ad);
    var conditions = {'_id': id};
    console.log(query);
    console.log(conditions);
    AD.update(conditions, ad, {}, callback);
}

exports.newAndSave = function (name, slot, custom, discount, price, sponsor, is_clear, remark, callback) {
    var ad = new AD();
    ad.name = name;
    ad.slot = slot;
    ad.custom = custom;
    ad.discount = discount;
    ad.price = price;
    ad.sponsor = sponsor;
    ad.is_clear = is_clear;
    ad.remark = remark;
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
