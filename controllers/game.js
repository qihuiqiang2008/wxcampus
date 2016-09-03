var User = require('../proxy').User;

var utility = require('utility');

var message = require('../services/message');
var Util = require('../libs/util');
var config = require('../config').config;
var EventProxy = require('eventproxy');
var check = require('validator').check;
var sanitize = require('validator').sanitize;
var crypto = require('crypto');


exports.plane = function (req, res, next) {
    res.render('front/discover/plane');
}


