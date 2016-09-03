/*!
 * nodeclub - route.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sign = require('./controllers/sign');
var user = require('./controllers/user');
var message = require('./controllers/message');
var reply = require('./controllers/reply');
var post = require('./controllers/post');
var school = require('./controllers/school');
var region = require('./controllers/region')
var college = require('./controllers/college');
var statistic = require('./controllers/statistic');
var auth = require('./middlewares/auth');
var limit = require('./middlewares/limit');
var discover = require('./controllers/discover');
var friend_board = require('./controllers/friend_board');
var trade_board = require('./controllers/trade_board');
var upload_article = require('./controllers/uploadArticle');
var advise = require('./controllers/advise');
var game = require('./controllers/game');
var collection = require('./controllers/collection');
var group = require('./controllers/group');
var edit = require('./controllers/edit');


var getSource = require('./controllers/getSource');
var uploadSingle = require('./controllers/uploadSingle');
var uploadSingle1 = require('./controllers/uploadSingle1');
var uploadArticle = require('./controllers/uploadArticle');
var previewMessage = require('./controllers/previewMessage');
var pushMessage = require('./controllers/pushMessage');
var getMessage = require('./controllers/getMessage');
var sendMessage = require('./controllers/sendMessage');

var passport = require('passport');
var configMiddleware = require('./middlewares/conf');
var config = require('./config');

module.exports = function (app) {
     app.get('/back/uploadSingle', auth.adminRequired,uploadSingle.uploadSingle);
    app.get('/back/uploadSingle1', auth.adminRequired,uploadSingle1.uploadSingle);
    app.get('/back/previewMessage', auth.adminRequired,previewMessage.previewMessage);
    app.get('/back/pushMessage', auth.adminRequired,pushMessage.pushMessage);
    app.get('/back/getMessage', auth.adminRequired,getMessage.getMessage);
    app.get('/back/sendMessage', auth.adminRequired,sendMessage.sendMessage);


    app.get('/back/getSource', auth.adminRequired,getSource.getSource);
    app.get('/back/checkResource', auth.adminRequired,getSource.checkResource);


    app.get('/back/upload', auth.adminRequired,uploadArticle.upload);


    app.get('/back/edit', auth.adminRequired,edit.show_create);
    app.post('/back/edit', auth.adminRequired,edit.create);
    //地区相关
    app.get('/back/group/create', auth.adminRequired,group.show_create);
    app.post('/back/group/create', auth.adminRequired,group.create);
    app.get('/back/groups', auth.adminRequired,group.groups);


    app.get('/back/posts',auth.adminRequired,post.back);

    app.get('/back/replies',auth.adminRequired,reply.index);
    app.get('/back/exportSchoolEx',auth.adminRequired,collection.exportSchoolEx);
    app.get('/back/importSchoolEx',auth.adminRequired,collection.importSchoolEx);
    app.get('/back/importSchool',auth.adminRequired,collection.importSchool);
    app.get('/back/exportSchool',auth.adminRequired,collection.exportSchool);
    app.get('/back/collections',auth.adminRequired,collection.index);
    app.get('/back/collection/drop',auth.adminRequired,collection.drop);
    app.get('/back/advises',auth.adminRequired,advise.index);
  // home page
    app.get('/back/statistic',auth.adminRequired,statistic.show);

    app.get('/back/initadmin',sign.initadmin);

    app.get('/back/signin',sign.show_admin_login);
    app.post('/back/signin',sign.admin_login);
   //地区相关
    app.get('/back/region/create', auth.adminRequired,region.show_create);
    app.post('/back/region/create', auth.adminRequired,region.create);
    app.get('/back/regions', auth.adminRequired,region.regions);
    app.get('/back/region/del', auth.adminRequired,region.del);

   //学校相关
    app.get('/back/school/test', auth.adminRequired,upload_article.upload);
    app.get('/back/school/source_show', auth.adminRequired,school.source_show);
    app.get('/back/school/update_source',school.update_source);
    app.get('/back/school/source_edit_show',school.source_edit_show);
    app.post('/back/school/source_edit_save',school.source_edit_save);
    app.get('/back/school/title_edit_show',school.title_edit_show);
    app.post('/back/school/title_edit_save',school.title_edit_save);
    app.get('/back/school/create', auth.adminRequired,school.show_create);
    app.post('/back/school/create', auth.adminRequired,school.create);
    app.get('/back/schools', auth.adminRequired,school.schools);
    app.get('/back/school/del', auth.adminRequired,school.del);
    app.get('/back/school/board', auth.adminRequired,school.board_show);
    app.post('/back/school/board', auth.adminRequired,school.board_update);
    app.get('/back/school/wx_account', auth.adminRequired,school.account_show);
    app.post('/back/school/wx_account', auth.adminRequired,school.account_update);
    app.get('/schools',school.schools_json);
    app.get('/schoolExs',school.schoolExs_json);
    //学院相关
    app.get('/back/college/create', auth.adminRequired,college.show_create);
    app.post('/back/college/create', auth.adminRequired,college.create);
    app.get('/back/colleges', auth.adminRequired,college.colleges);
    app.get('/back/college/del', auth.adminRequired,college.del);
    app.get('/colleges',college.colleges_json);

    app.get('/back/users', auth.adminRequired,user.users);
    app.get('/back/user/role', auth.adminRequired, user.set_role);
    //用户相关
    app.get('/user/like',auth.userRequired,user.getPostLike);
    app.get('/user/replied',auth.userRequired,user.getReplied);
    app.get('/user/fav',auth.userRequired,user.getPostFav);
    app.get('/user/liked',auth.userRequired,user.getPostLiked);
    app.get('/user/index', auth.signinRequired, user.index);
    app.get('/user', auth.signinRequired, user.index);


    app.get('/user/user_setting', sign.user_setting_show);
    app.post('/user/user_setting', sign.user_setting_save);
    //app.get('/user/reg', user.reg);
    app.get('/user/lock', auth.userRequired,user.userlock);
    app.post('/message/create', auth.userRequired,user.send_message);
    app.get('/user/message',auth.userRequired, user.messages);
    app.get('/user/confess_inform',auth.userRequired, user.confess_inform);
    app.get('/user/show_update', auth.signinRequired, user.show_update);
    app.post('/user/update', auth.signinRequired, user.input_update);
    app.get('/user/trade_board', auth.signinRequired, user.trade_boards);
    app.get('/user/friend_board', auth.signinRequired, user.friend_boards);

    app.get('/',post.index);
    app.get('/post/index',post.index);

    app.get('/post', post.index);
    app.post('/post/create', auth.userRequired,post.create);
	app.get('/post/create/:type',post.get_posting_page);

    app.get('/detail/:post_id',post.detail);
    app.post('/reply/create', auth.userRequired,reply.create);
    app.get('/reply/del', auth.userRequired,reply.delete);
    app.get('/postlike', auth.userRequired,post.postlike);
    app.get('/postfav', auth.signinRequired,post.postfav);
    app.get('/post/del',  auth.signinRequired,post.delete);
    app.post('/post/plus',  auth.signinRequired,post.plus);
    app.get('/post/update_status',  auth.userRequired,post.update_status);
    app.get('/post/get_posting_confess_page',  auth.userRequired,post.get_posting_confess_page);
    app.get('/post/get_posting_page',  auth.userRequired,post.get_posting_pageEx);
    app.get('/post/get_college_select_page',  auth.userRequired,post.get_college_select_page);
  // sign up, login, logout
    app.get('/discover',discover.index);
    app.get('/discover/plane',  auth.signinRequired,game.plane);
    app.get('/discover/top100',discover.top100);
    app.get('/friend_board',auth.signinRequired,friend_board.index);
    app.get('/create_friend_board',auth.signinRequired,friend_board.show_create);
    app.get('/friend_board/del',auth.signinRequired,friend_board.delete);
    app.post('/create_friend_board',auth.signinRequired,friend_board.create);

    app.get('/create_advise',auth.signinRequired,advise.show_create);
    app.post('/create_advise',auth.signinRequired,advise.create);

  app.get('/trade_board',auth.signinRequired,trade_board.index);
  app.get('/create_trade_board',auth.signinRequired,trade_board.show_create);
  app.get('/trade_board/del',auth.signinRequired,trade_board.delete);
  app.post('/create_trade_board',auth.signinRequired,trade_board.create);
  app.get('/signup', sign.showSignup);
  app.post('/signup', sign.signup);
  app.get('/signout', sign.signout);
  app.get('/signin', sign.showLogin);
  app.post('/signin', sign.login);

};
