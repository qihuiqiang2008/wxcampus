var Comment = require('../proxy').Comment;
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var async = require('async');
var fs = require('fs');
var School = require('../proxy').School;
var proc = require('process');


var BREAK_POINT_FILE = "break_point_comments.tmp";
var COMMENT_RETRY_LIMIT = 1;


var school_num;
var good_result = { status : 'ok'};
var error_result = { status : 'error'};
/*
* 显示留言审查界面
*/
exports.showAll = function(req, res, next){

	//查询留言
	view = 'back/comments/comments';
	var page = req.query.page;
	var limit = req.query.limit;
	var is_first_page = false;

	if(page == undefined || parseInt(page) == 1){
		is_first_page = true;
		page = 1;
	}
	
	Comment.getAllComments(function(err, comments){
		//console.log(comments);
		res.render(view, {
			comments: comments, 
			is_all:true, 
			is_first_page:is_first_page,
			url:"/back/comments/showAll"
		});
	}, page, limit);
}


/*
* 显示新留言
*/
exports.showNew = function(req, res, next){
	view = 'back/comments/comments';
	var page = req.query.page;
	var limit = req.query.limit;
	var is_first_page = false;

	if(page == undefined || parseInt(page) == 1){
		is_first_page = true;
		page = 1;
	}

	Comment.getNewComments(function(err, comments){
		res.render(view, {
			comments: comments, 
			is_all:false, 
			is_first_page:is_first_page,
			url:"/back/comments/showNew"
		});
	}, page, limit);
	

}

exports.showDelByUser  = function(req, res, next){
	view = 'back/comments/comments';
	var page = req.query.page;
	var limit = req.query.limit;
	var is_first_page = false;

	if(page == undefined || parseInt(page) == 1){
		is_first_page = true;
		page = 1;
	}

	Comment.getDelByUserComments(function(err, comments){
		res.render(view, 
			{
				comments: comments, 
				is_all:false, 
				is_first_page:is_first_page,
				url:"/back/comments/showDel"
			});
	}, page, limit);
}

/*
* 更改某一留言状态，并将其状态写入数据库
*/
function getCommentFromDB(content_id, callback){
	//首先从数据库提取该留言
	Comment.getCommentByContentId(content_id, function(err, comments){
		if(err || comments.length <1){
			console.log("错误！数据库读取错误！");
			return -1;
		}else {
			var comment = comments[0];
			callback(comment);
		} 
	});
}

exports.updateComment = function(req, res, next){

	var content_id = req.query.content_id;
	var operation = req.query.operation;
	var content = req.query.content;

	var data = {
	    // comment_id:comment.comment_id,
	    action:operation,
	    // user_comment_id_count:1,
	    // user_comment_id_0:comment.id,
	    lang:"zh_CN",
	    ajax:'1',                                
	    f:'json'
	};

	var new_comment = {};

	//判断命令参数，明确具体操作
	//精选留言操作逻辑
	if(operation == "set_good_comment" || operation == "remove_good_comment"){
		getCommentFromDB(content_id, function(comment){
			data.comment_id = comment.comment_id;
			data.user_comment_id_count = 1;
			data.user_comment_id_0 = comment.id;
			changeComment(comment, operation, data, function(){
				new_comment.content_id = comment.content_id;

				if(operation == "set_good_comment"){
					new_comment.is_elected = 1;
				} else {
					new_comment.is_elected = 0;
					new_comment.is_top = false;

				}
				new_comment.audit_status = true;

								
				Comment.updateComment(new_comment, function(){

					res.send(JSON.stringify(good_result));
				});
			}, function(){
				res.send(JSON.stringify(error_result));
			});
		});

	} else if (operation == "ignore_comment" ) {

		//console.log("忽略留言");
		new_comment.audit_status = true;
		new_comment.content_id = content_id;
		Comment.updateComment(new_comment, function(){

			res.send(JSON.stringify(good_result));
		}, function(){});

	} else if (operation == "set_top_comment" || operation == "remove_top_comment") {
		//console.log("置顶留言");
		getCommentFromDB(content_id, function(comment){
			data.comment_id = comment.comment_id;
			data.user_comment_id = comment.id;
			changeComment(comment, operation, data, function(){
				new_comment.content_id = comment.content_id;
				if(operation == "set_top_comment"){
					new_comment.is_elected = 1;
					new_comment.is_top = true;
				} else {
					new_comment.is_top = 0;
				}
				new_comment.audit_status = true;

				Comment.updateComment(new_comment, function(){

					res.send(JSON.stringify(good_result));
				});
			}, function(){
				res.send(JSON.stringify(error_result));
			});
		});

	} else if (operation == "reply_comment") {
		//console.log("回复留言");
		getCommentFromDB(content_id, function(comment){
			data.content = content;
			data.content_id = comment.content_id;
			data.comment_id = comment.comment_id;
			changeComment(comment, operation, data, function(ret_data){
				new_comment.content_id = comment.content_id;
				new_comment.reply = comment.reply;
				new_comment.audit_status = true;
				var reply = {
					reply_id: ret_data.reply_id,
					content: content
				};
				new_comment.reply[0].reply_list.push(reply);
				Comment.updateComment(new_comment, function(){

					res.send(JSON.stringify(good_result));
				});

			}, function(){
				res.send(JSON.stringify(error_result));

			});
		});

	} else if (operation == "delete_reply"){
		//console.log("删除回复");
		getCommentFromDB(content_id, function(comment){
			data.reply_id = comment.reply[0].reply_list[0].reply_id;
			data.comment_id = comment.comment_id;
			data.content_id = comment.content_id;

			changeComment(comment, operation, data, function(){
				new_comment.content_id = comment.content_id;
				new_comment.reply = comment.reply;
				new_comment.reply[0].reply_list = [];
				new_comment.audit_status = true;

				Comment.updateComment(new_comment, function(){

					res.send(JSON.stringify(good_result));
				});
			}, function(){
				res.send(JSON.stringify(error_result));
			});
		});
	} else if (operation == "batch_delete_comment"){
		getCommentFromDB(content_id, function(comment){

			data.count = 1;
			data.comment_id_0 = comment.comment_id;
			data.user_comment_id_0 = comment.id;
			changeComment(comment, operation, data, function(){
				new_comment.content_id = comment.content_id;
				
				new_comment.audit_status = true;
				new_comment.del_flag = 1;

				Comment.updateComment(new_comment, function(){

					res.send(JSON.stringify(good_result));
				});
			}, function(){
				res.send(JSON.stringify(error_result));
			});
		});

		console.log("删除留言");
	}

}

/*
* command: remove_good_comment, set_good_comment, set_top_comment, remove_top_comment
*/
function changeComment(comment, command, data, callback, err_callback){
	var loadResult;
	var schoolEx;

	var url = "https://mp.weixin.qq.com/misc/appmsgcomment";

	if(command == "reply_comment"){
		url = url + "?action=reply_comment";
	} else if (command == "delete_reply"){
		url = url + "?action=delete_reply";
	}

	async.series([
	    function(cb) {
	        SchoolEx.getSchoolByEname(comment.school_enname, function (err, school) {
	            schoolEx = school;
	            console.log(comment.school_enname);
	            cb();
	        })
	    },

	    function(cb) {//1.1：登陆。
	        login(schoolEx, function(err, results){
	            loadResult = results;
	            data.token = loadResult.token;
	            console.log("登陆：" + comment.school_enname);
	            cb();
	        });
	    },
	    function (cb) {
	    	
	    	var sendData = '';

	    	for (property in data) {
	    	    sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
	    	}

	        request.post(url) //更新留言状态
	            .set('Cookie', loadResult.cookie)
	            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
	            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
	            .set('Referer', "https://mp.weixin.qq.com/misc/appmsgcomment?action=list_latest_comment&begin=0&count=10&mp_version=7&token=" + loadResult.token+ "&lang=zh_CN")
	            .send(sendData)
	            .end(function (res) {
	     			console.log(res.text);
	     			result = JSON.parse(res.text);
	     			if(result.base_resp.ret == 0){
	     				console.log("success!");
	     				callback(result);
	     			} else {
	     				err_callback();
	     			}
	     			cb();
                });	            
	    },
	    
	], function () {
		console.log("Comment process finish!");
	});
}

/*
* 获取留言并同步到数据库
*/
function refreshComment(req, res, next){

	//断点续传
	console.log("现在开始获取所有留言");
	School.getAllSchools(function(err, school_list){
		var index = check_break_point_school(school_list);
		if(index == -1){
			return;
		}

		var new_list = school_list.slice(index);
		async.eachSeries(new_list, function(school, callback){
            console.log("开始同步留言：" + school.en_name);
            getOneSchoolComment(school.en_name, function(){
            	console.log("同步留言完成：" + school.en_name);
            	var next_school_index = new_list.indexOf(school) + 1;
            	if(next_school_index >= new_list.length){

            	} else {

            		write_break_point(new_list[next_school_index].en_name, 0, 
            			school_list.length, school_list.length - school_list.indexOf(school));
            	}
            	callback();
            });
        },

        function(){
            console.log("全部学校获取留言完成!");
            clear_break_point();
        });

	});
}

exports.refreshComment = refreshComment;
/*
* 获取一个学校的留言
*/
exports.getOneSchool = function(req, res, next){
	getOneSchoolComment("whu", function(){
		console.log("-----finish--------");
	});
}

function getOneSchoolComment(school_enname, callbackFunc){

	async.series([
	    function(cb) {
	        SchoolEx.getSchoolByEname(school_enname, function (err, school) {
	            schoolEx = school;
	            cb();
	        })
	    },

	    function(cb) {//1.1：登陆。
	        login(schoolEx, function(err, results){
	            loadResult = results;
	            console.log("登陆：" + school_enname);
	            cb();
	        });
	    },

	    function (cb) {
	        request.get('https://mp.weixin.qq.com/misc/appmsgcomment?action=list_latest_comment&begin=0&count=10&mp_version=7&token=' + loadResult.token + '&lang=zh_CN') //获取留言
	            .set('Cookie', loadResult.cookie)
	            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
	            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
	            .end(function (res) {
	     			var indexHead = res.text.indexOf('search_key')
                    var indexTail = res.text.indexOf('.app_msg', indexHead + 50);
                    var html = res.text.slice(indexHead + 29, indexTail).trim();
                    result = JSON.parse(html)
                   	async.each(result.app_msg, function(item, callback){
                   		var comments = item.comment.comment;
                   	 	async.each(comments, function(comment, callback2){
                   	 		comment.school_enname = school_enname;

                   			Comment.UpdateOrNew(comment, callback2);
                   		}, function(err){
                   			callback();
                   		});
                   	}, function(err){
                   	 	cb();
                   	});
	            });
	    },
	    
	], function () {
		callbackFunc();
	});
}

/*
*  获取留言查询的进度
*/
exports.queryRefreshStatus = function(req, res, next){
	var content;

	if(fs.existsSync(BREAK_POINT_FILE)){

		content = fs.readFileSync(BREAK_POINT_FILE, 'utf-8');
	} else {
		content = {
			school: "",
			count: -1,
			total: -1,
			remain:-1
		}
	}

	res.send(content);
}

function is_pid_diffrent(){
	var new_pid = proc.pid;

	if(is_break_point_exist()){
		var content = fs.readFileSync(BREAK_POINT_FILE, 'utf-8');
		var json = JSON.parse(content);
		pid = json.pid;

		if(json.pid != proc.pid){
			return true;
		}
	}
	return false;
}

exports.is_pid_diffrent = is_pid_diffrent;

function is_break_point_exist(){

	if(fs.existsSync(BREAK_POINT_FILE))
		return true;

	return false;
}

exports.is_break_point_exist = is_break_point_exist;
/*
	返回应该接续的断点，如果没有断点则创建断点。
*/
function check_break_point_school(school_list){
    if(fs.existsSync(BREAK_POINT_FILE)){
        var content = fs.readFileSync(BREAK_POINT_FILE, 'utf-8');
        var json = JSON.parse(content);

        for(item in school_list){
            if(school_list[item].en_name == json.school){
            	console.log("恢复断点：" + json.school);
            	count = json.count + 1;
            	if(count > COMMENT_RETRY_LIMIT){
            		console.log("超过重试次数，跳过" + school_list[item].en_name);
            		
            		item = (parseInt(item) + 1) + "";
            		count = 0;

            		if(parseInt(item) > school_list.length){
            			item = -1;
            			clear_break_point();
            			return item;
            		}
            	}
            	write_break_point(school_list[item].en_name, count, 
            		school_list.length, school_list.length - parseInt(item));
                return item;
            }
        }
    } else {

    	write_break_point(school_list[0].en_name, 0, 
    		school_list.length, school_list.length);
    	console.log("创建断点文件" + school_list[0].en_name);

    }
    
    return 0;
}

function clear_break_point(){
    fs.unlinkSync(BREAK_POINT_FILE);
}

function write_break_point(school, count, total, remain){
    var date = {
        school : school,
        count: count,
        total: total,
        remain : remain,
        pid : proc.pid
    }

    fs.writeFileSync(BREAK_POINT_FILE, JSON.stringify(date));

    return;
}