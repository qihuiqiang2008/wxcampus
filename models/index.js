var mongoose = require('mongoose');
var config = require('../config').config;

mongoose.connect(config.is_dev?config.dev_db:config.db, function (err) {
    console.log(config.is_dev?config.dev_db:config.db);
  if (err) {
    console.error('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});

require('./user');
require('./message');
require('./school');
require('./schoolEx');
require('./post');
require('./postEx');
require('./college');
require('./friend_board');
require('./trade_board');
require('./advise');
require('./region');
require('./group');
require('./resource');
require('./filterword');
require('./configuration');
require('./question');
require('./AD');
require('./PV');
require('./articleInfo')
require('./comment')

exports.User = mongoose.model('User');
exports.Message = mongoose.model('Message');
exports.School = mongoose.model('School');
exports.SchoolEx = mongoose.model('SchoolEx');
exports.College = mongoose.model('College');
exports.Post = mongoose.model('Post');
exports.PostEx = mongoose.model('PostEx');
exports.PostReply = mongoose.model('PostReply');
exports.PostLike= mongoose.model('PostLike');
exports.PostFav= mongoose.model('PostFav');
exports.ConfessInform= mongoose.model('ConfessInform');
exports.FriendBoard= mongoose.model('FriendBoard');
exports.TradeBoard= mongoose.model('TradeBoard');
exports.Advise= mongoose.model('Advise');
exports.Region= mongoose.model('Region');
exports.Group= mongoose.model('Group');
exports.Resource= mongoose.model('Resource');
exports.FilterWord= mongoose.model('FilterWord');
exports.Configuration= mongoose.model('Configuration');
exports.Question= mongoose.model('Question');
exports.Answer= mongoose.model('Answer');
exports.AD = mongoose.model('AD');
exports.PV= mongoose.model('PV');
exports.ArticleInfo= mongoose.model('ArticleInfo');
exports.Comment = mongoose.model('Comment');
//exports. Photo_Guess1= mongoose.model('Photo_Guess1');
//exports. Photo_Guess_Wgateid= mongoose.model('Photo_Guess_Wgateid');
