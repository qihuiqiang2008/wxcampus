var Stati = require('../models').Stati;
var Util = require('../libs/util');



exports.newAndSave = function (cn_name, en_name,date,wanancount,wananrate,biaobaicount,biaobairate,shudongcount,shudongrate,yuanfengcount,yuanfenrate,ershoucount,ershourate,allcount,callback) {
    var stati = new Stati();
    stati.cn_name = cn_name;
    stati.en_name = en_name;

    stati.date = date;
    stati.wanancount = wanancount;
    stati.wananrate = wananrate;

    stati.biaobaicount = biaobaicount;
    stati.biaobairate = wananrate;

    stati.shudongcount = wanancount;
    stati.shudongrate = wananrate;

    stati.yuanfengcount = wanancount;
    stati.yuanfenrate = wananrate;

    stati.ershoucount = wanancount;
    stati.ershourate = wananrate;

    stati.allcount = allcount;

    stati.save(callback);
};


exports.newAndSaveEx = function (cn_name, en_name,date,count,rate,type,allcount,callback) {
    var stati = new Stati();
    stati.cn_name = cn_name;
    stati.en_name = en_name;

    stati.date = date;
    if(type=="wanan"){
        stati.wanancount = count;
        stati.wananrate = rate;
    }
    if(type=="biaobai"){
        stati.biaobaicount = count;
        stati.biaobairate = rate;
    }
    if(type=="shudong"){
        stati.shudongcount = count;
        stati.shudongrate = rate;
    }
    if(type=="yuanfen"){
        stati.yuanfengcount = count;
        stati.yuanfenrate = rate;
    }
    if(type=="ershou"){
        stati.ershoucount = count;
        stati.ershourate = rate;
    }
    stati.allcount = allcount;
    stati.save(callback);
};

exports.getStatExist= function (en_name,date, callback) {
    Stati.count({en_name:en_name,date:date}, callback);
};

exports.getStat= function (en_name,date, callback) {
    Stati.findOne({en_name:en_name,date:date}, callback);
};

exports.getStatByQuery = function (query, opt, callback) {
    Stati.find(query,[], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0){
            return callback(null,[]);
        }
        return callback(null,docs);
    });
};