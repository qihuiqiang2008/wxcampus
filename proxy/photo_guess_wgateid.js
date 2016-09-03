var EventProxy = require('eventproxy');
var Photo_Guess_Wgateid = require('../models').Photo_Guess_Wgateid;
var mongoose = require('mongoose');

exports.getCountByQuery = function (query, callback) {
    Photo_Guess_Wgateid.count(query, callback);
};



exports.getCountBywgateid= function (photo_guess_id,wgateid, callback) {
    Photo_Guess_Wgateid.findOne({photo_guess_id:photo_guess_id,wgateid:wgateid}, callback);
};

exports.getPhoto_Guess_WgateidByQuery = function (query, opt, callback) {
    Photo_Guess_Wgateid.find(query,[], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0){
            return callback(null,[]);
        }
        return callback(null,docs);
    });
};

exports.getPhoto_Guess_WgateidById = function (id, callback) {
    Photo_Guess_Wgateid.findOne({id:id}, callback);
};



exports.newAndSave = function (photo_guess_id,wgateid,pass,callback) {
    var photo_guess_wgateid = new Photo_Guess_Wgateid();
    photo_guess_wgateid.photo_guess_id = photo_guess_id;
    photo_guess_wgateid.wgateid = wgateid;
    photo_guess_wgateid.pass = pass;
    photo_guess_wgateid.save(callback);
};
exports.removeById = function (id, callback) {
    Photo_Guess_Wgateid.remove({_id: id}, callback);
};
