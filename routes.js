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
var postEx = require('./controllers/postEx');
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
var filterword = require('./controllers/filterword')
var Mail = require('./controllers/mail')
var configuration = require('./controllers/configuration')
var getSource = require('./controllers/getSource');
var uploadSingle = require('./controllers/uploadSingle');
var uploadSingle1 = require('./controllers/uploadSingle1');
var uploadArticle = require('./controllers/uploadArticle');
var previewMessage = require('./controllers/previewMessage');
var delMessage = require('./controllers/delMessage');
var pushMessage = require('./controllers/pushMessage');
var getMessage = require('./controllers/getMessage');
var sendMessage = require('./controllers/sendMessage');
var addGoodSound = require('./controllers/addGoodSound');
var addKeyword = require('./controllers/addKeyword');
var uploadPicture = require('./controllers/uploadPicture');
var question = require('./controllers/question');
var answer = require('./controllers/answer');
var photo_guess = require('./controllers/photo_guess');
var count = require('./controllers/count');
var login = require('./controllers/wxLogin');
var wxmsg = require('./controllers/getWxArticleMsg');

var passport = require('passport');
var configMiddleware = require('./middlewares/conf');
var config = require('./config');
var ADManage = require('./controllers/ADManage');
var getArticle = require('./controllers/getArticle');
var price = require('./controllers/price');

var record=require('./controllers/record');
var PVManage=require('./controllers/PVManage');

var markdown = require('./controllers/markdown');


module.exports = function (app) {



    app.get('/scan/:from_school_en_name', login.wxLogin);
    app.get('/msg/:en_name', getMessage.getMessage);
    // app.get('/controllers/checkLogin', login.checkLogin);

    app.get('/back/uploadSingle', auth.adminRequired,uploadSingle.uploadSingle);
    app.get('/back/uploadSingle1', auth.adminRequired,uploadSingle1.uploadSingle);
    app.get('/back/previewMessage', auth.adminRequired,previewMessage.previewMessage);
    app.get('/back/pushMessage', auth.adminRequired,pushMessage.pushMessage);
    app.get('/back/getMessage',getMessage.getMessage);
    app.get('/back/sendMessage', auth.adminRequired,sendMessage.sendMessage);
    app.post('/back/uploadFile', auth.adminRequired,addGoodSound.addFile);
    app.get('/back/addKeyword', auth.adminRequired,addKeyword.addKeyword);
    app.get('/back/addGoodSound', auth.adminRequired,addGoodSound.addGoodSound);
    app.get('/back/addBlacklist', auth.adminRequired,sendMessage.addBlacklist);
    app.get('/back/delMessage', auth.adminRequired,delMessage.delMessage);
    app.get('/back/delOneSchoolMessage', auth.adminRequired, delMessage.delOneSchoolMsg);

    app.get('/back/getSource', auth.adminRequired,getSource.getSource);
    app.get('/back/checkResource', auth.adminRequired,getSource.checkResource);
    app.get('/back/uploadPic', auth.adminRequired,uploadPicture.uploadPicture);
    app.get('/back/serverDo',school.serverDo);

    app.get('/back/upload', auth.adminRequired,uploadArticle.upload);


    app.get('/back/edit', auth.adminRequired,edit.show_create);
    app.post('/back/edit', auth.adminRequired,edit.create);
    //地区相关
    app.get('/back/group/create', auth.adminRequired,group.show_create);
    app.post('/back/group/create', auth.adminRequired,group.create);
    app.get('/back/groups', auth.adminRequired,group.groups);


    //过滤词相关
    app.get('/back/filterword/create', auth.adminRequired,filterword.show_create);
    app.post('/back/filterword/create', auth.adminRequired,filterword.create);
    app.get('/back/filterwords', auth.adminRequired,filterword.filterwords);
    app.get('/back/filterword/del', auth.adminRequired,filterword.del);
    //配置相关
    app.get('/back/configuration/create', auth.adminRequired,configuration.show_create);
    app.post('/back/configuration/create', auth.adminRequired,configuration.create);
    app.post('/back/configuration/update', auth.adminRequired,configuration.update);
    app.get('/back/configuration/update', auth.adminRequired,configuration.show_update);
    app.get('/back/configurations', auth.adminRequired,configuration.index);
    app.get('/back/configuration/del', auth.adminRequired,configuration.del);

    app.post('/back/all_title_update', auth.adminRequired,school.all_title_updating);
    app.get('/back/all_title_update', auth.adminRequired,school.all_title_update);
    app.get('/back/all_title_edit', auth.adminRequired,school.all_title_edit);

    app.post('/back/update_all_title_by_school', auth.adminRequired,school.update_all_title_by_school);

    app.post('/back/postEx/update_content', auth.adminRequired,postEx.update_content);

    app.post('/back/result_post', auth.adminRequired,postEx.result_post);
    app.get('/back/result_post', auth.adminRequired,postEx.get_result_post);
    app.post('/back/start_edit', auth.adminRequired,postEx.start_edit);

    app.get('/back/posts',auth.adminRequired,post.back);

    app.get('/testmodel',configuration.indexEx);
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
    app.get('/back/count',count.count_number);
    app.get('/back/count11', auth.adminRequired,count.count_number1);
    //问题相关
    app.get('/back/question/create', auth.adminRequired,question.show_create);
    app.post('/back/question/create', auth.adminRequired,question.create);
    app.get('/back/question/index', auth.adminRequired,question.index);
    app.get('/back/question/del', auth.adminRequired,question.del);
    app.get('/back/question/back_handler', auth.adminRequired,question.back_handler);

    //问题答案相关
    app.get('/back/answer/create', auth.adminRequired,answer.show_create);
    app.post('/back/answer/create', auth.adminRequired,answer.create);
    app.get('/back/answer/index', auth.adminRequired,answer.index);
    app.get('/back/answer/del', auth.adminRequired,answer.del);

    //问题话题相关
    app.get('/create/:from_school_en_name/topic',postEx.show_topic);
    app.get('/back/topic/result_topic', auth.adminRequired,postEx.get_result_topic);
    app.post('/back/result_topic', auth.adminRequired,postEx.result_topic);
    app.get('/topic_suggest/create', postEx.show_topic_suggest);
    app.post('/topic_suggest/create',postEx.create_topic_suggest);
//    app.post('/back/answer/create', auth.adminRequired,answer.create);
//    app.get('/back/answer/index', auth.adminRequired,answer.index);
//    app.get('/back/answer/del', auth.adminRequired,answer.del);

    //提交图片相关
    // app.get('/create/:from_school_en_name/:type',postEx.get_postExing_page);
    app.get('/photo_guess/:region_code/:start/:end', photo_guess.index);
    app.get('/create/:en_school/photo_guess',photo_guess.show_create);


    app.get('/create/:en_school/zipai',photo_guess.show_createzipai);
    app.get('/photo_guesses',photo_guess.indexEx);
    app.get('/front/photo_guess/test',photo_guess.test);
    app.get('/back/photo_guess/genertor_images',photo_guess.genertor_images);
    app.get('/back/photo_guess/merge_one_image',photo_guess.merge_one_image);
    app.get('/back/photo_guess/barcode_result',photo_guess.barcode_result);
    app.get('/back/photo_guess/upload',photo_guess.upload);

    app.post('/front/photo_guess/create', photo_guess.create);
    app.get('/front/photo_guess/index', photo_guess.index);
    app.get('/front/photo_guess/del',photo_guess.del);
    app.get('/pd/:id',photo_guess.detail);
    app.post('/front/photo_guess/up_answer',photo_guess.up_answer);
    app.get('/back/photo_guess/index',photo_guess.back_index);
    app.get('/back/photo_guess/handler',photo_guess.handler);
    app.get('/back/photo_guess/result',photo_guess.show_result);
    app.post('/back/photo_guess/result',photo_guess.result_photo_guess);

    app.get('/back/ershou/remove',photo_guess.remove);
    app.get('/back/ershou/result',photo_guess.show_result_ershou);
    app.post('/back/ershou/result',photo_guess.result_ershou_region);

    app.post('/front/complain/create', photo_guess.create_complain);
    app.get('/create/:en_school/complain',photo_guess.show_create_complain);
    app.get('/back/photo_guess/index',photo_guess.back_index);

    app.post('/article_recommand/create', postEx.create_article_recommand);
    app.get('/create/:from_school_en_name/article_recommand',postEx.show_article_recommand);


    app.post('/topconfess/create', postEx.create_topconfess);
    app.get('/create/:from_school_en_name/topconfess',postEx.show_topconfess);


    app.post('/hudong/create', postEx.create_hudong);
    app.get('/back/postEx/index', postEx.index);
    app.get('/create/:from_school_en_name/hudong',postEx.show_hudong);


    app.get('/exporttoes', postEx.exporttoes);
    app.get('/search', postEx.search);


    app.get('/back/ershou/index',photo_guess.back_ershou_index);
    app.get('/create/:en_school/ershou',photo_guess.show_create_ershou);
    app.post('/front/ershou/create', photo_guess.create_ershou);
    //学校相关
    app.get('/back/school/test', auth.adminRequired,upload_article.upload);
    app.get('/back/school/source_show', auth.adminRequired,school.source_show);


    app.get('/back/school/tagreset', auth.adminRequired,school.tagreset);

    app.get('/back/addTag', auth.adminRequired,school.addTag);

    app.get('/back/school/update_source',school.update_source);
    app.get('/back/school/source_edit_show',school.source_edit_show);
    app.post('/back/school/source_edit_save',school.source_edit_save);
    app.get('/back/school/title_edit_show',school.title_edit_show);
    app.post('/back/school/title_edit_save',school.title_edit_save);
    app.get('/back/school/create', auth.adminRequired,school.show_create);
    app.post('/back/school/create', auth.adminRequired,school.create);

    app.get('/back/school/update', auth.adminRequired,school.show_update);
    app.post('/back/school/update', auth.adminRequired,school.update);
    app.get('/back/schools', auth.adminRequired,school.schools);
    app.get('/m/:admin',school.mschools);
    app.get('/back/school/del', auth.adminRequired,school.del);
    app.get('/back/school/board', auth.adminRequired,school.board_show);
    app.post('/back/school/board', auth.adminRequired,school.board_update);
    app.get('/back/school/wx_account', auth.adminRequired,school.account_show);
    app.post('/back/school/wx_account', auth.adminRequired,school.account_update);

    app.get('/back/school/erweima', auth.adminRequired,school.erweima_show);
    app.post('/back/school/erweima', auth.adminRequired,school.erweima_update);

    app.get('/back/school/cookie', auth.adminRequired,school.cookie_show);

    app.get('/back/price',school.back_price);

    app.get('/school/search',school.showSearch);

    app.post('/school/search',school.Createsearch);



    app.post('/back/school/cookie', auth.adminRequired,school.cookie_update);


    app.post('/back/school/cookie_update_chrome',school.cookie_update_chrome);





    app.get('/schools',school.schools_json);
    app.get('/mail',Mail.mail);
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



    //app.get('/create/:from_school_en_name',postEx.show_create_news);
    app.get('/create/:from_school_en_name/:type',postEx.get_postExing_page);
    app.post('/postEx/create',postEx.handler_postEx);
    app.get('/back/postEx/index',postEx.index);

    app.get('/back/postEx/confess_count',postEx.confess_count);
    app.post('/postEx/create',postEx.handler_postEx);
    app.get('/postEx/:from_school_en_name/choose',postEx.choose);
    app.get('/postEx/back_handler',postEx.back_handler);


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
    app.post("/wxmsg",wxmsg.wxmsg)
    app.get("/wxmsgadd",wxmsg.wxmsgadd)
    app.get("/tt",login.download)
    app.get("/tt1",postEx.tt)
    app.get("/tu",uploadSingle1.uploadTest)
    app.post('/signin', sign.login);

    app.get('/flex',postEx.flex);

    //广告相关 
    app.get('/back/school/getPriceExcel', auth.signinRequired, price.getPriceExcel);
    app.get('/back/school/getPrice', auth.signinRequired, price.getPrice);
    app.get('/back/school/addAD', auth.signinRequired, ADManage.showGetAD);
    app.post('/back/school/addAD', auth.signinRequired, ADManage.addAD);
    app.get('/back/school/getAD', auth.signinRequired, ADManage.getAD);
    app.get('/back/school/testAdd', auth.signinRequired, ADManage.testAdd);
    app.get('/back/school/getADByTime', auth.signinRequired, ADManage.getAdByTime);
    app.get('/back/school/todayAD', auth.signinRequired, ADManage.getTodayAD);
    app.get('/back/school/listAD', auth.signinRequired, ADManage.listAD);
    app.get('/back/school/detailAD', auth.signinRequired, ADManage.detailAD);
    app.get('/back/school/removeAD', auth.signinRequired, ADManage.removeAD);
    app.get('/back/school/clearAD', auth.signinRequired, ADManage.clearAD);
    app.get('/back/school/updateAD', auth.signinRequired, ADManage.showUpdateAD);
    app.post('/back/school/updateAD', auth.signinRequired, ADManage.updateAD);
    app.get('/back/school/syncADTag', auth.signinRequired, ADManage.syncADTag);
    app.get('/back/school/getArticle', auth.signinRequired, getArticle.getArticleAD);
    app.get('/back/school/getTodayADBrush', auth.signinRequired, getArticle.getTodayAdBrush);

    //统计分析相关
    app.get('/back/record/posts', auth.signinRequired, record.getPostsRecord);
    app.get('/back/record/pvs',auth.adminRequired,record.getPvs);
    app.post('/back/record/saveArticle',record.saveArticle);
    app.get('/back/record/gotoSaveArticle',record.gotoSaveArticle);
    app.get('/back/record/getArticle',record.getArticle);
    app.get('/back/record/getPostsChart',record.getPostsChart);
    app.get('/back/record/getArticleChart',record.getArticleChart);
    app.get('/back/record/getPostsByDate',record.getPostsByDate);
    app.post('/back/record/getReadNow',record.getReadNow);
    app.get('/back/record/getArticleByDate',record.getArticleByDate);
    app.get('/back/record/warnAdvertRead',record.warnAdvertRead);
    app.get('/back/record/saveArticleSchedule',record.saveArticleSchedule);
    app.get('/back/record/getAdverts',record.getAdverts);

    app.get('/back/markdown/edit',  markdown.edit);
    app.get('/back/markdown/show', markdown.view);
    app.post('/back/markdown/save',markdown.save);

};
