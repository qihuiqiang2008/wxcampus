var TradeBoard = require('../models').TradeBoard;


exports.getCountByQuery = function (query, callback) {
    TradeBoard.count(query, callback);
};

exports.getTradeBoardByQuery = function (query, opt, callback) {
    TradeBoard.find(query, [], opt, function (err, docs) {
        if (err) {
            return callback(err);
        }
        if (docs.length === 0) {
            return callback(null, []);
        }
        return callback(null,docs);
    });
};

exports.newAndSave = function (content, contact_type, contact, show_condition, from_user,title,type,price,trade_address,contact_person,callback) {
    var tradeboard = new TradeBoard();
    tradeboard.from_user= from_user;
    tradeboard.content = content;
    tradeboard.contact_type = contact_type;
    tradeboard.contact = contact;
    tradeboard.show_condition = show_condition;
    tradeboard.title = title;
    tradeboard.type = type;
    tradeboard.trade_address = trade_address;
    tradeboard.contact_person = contact_person;
    tradeboard.price = price;
    tradeboard.save(callback);
};


exports.removeByTradeBoardId = function (tradeborad_id, callback) {
    TradeBoard.remove({_id: tradeborad_id}, callback);
};

exports.getTradeBoardById = function (id, callback) {
    TradeBoard.findOne({_id:id}, callback);

};
exports.removeAll = function (callback) {
    TradeBoard.remove({}, callback);
};
