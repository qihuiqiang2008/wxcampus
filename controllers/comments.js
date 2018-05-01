var Comment = require('../proxy').Comment;
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var async = require('async');
var fs = require('fs');
var School = require('../proxy').School;


var BREAK_POINT_FILE = "break_point_comments.tmp";
var COMMENT_RETRY_LIMIT = 2;


var school_num;

/*
* 显示留言审查界面
*/
exports.showAll = function(req, res, next){

	//查询留言

}


/*
* 显示新留言
*/
exports.showNew = function(req, res, next){
	view = 'back/comments/comments';
	
	Comment.getNewComments(function(err, comments){
		res.render(view, {comments: comments});
	});
	

}

/*
* 更改某一留言状态，并将其状态写入数据库
*/
exports.updateComment = function(req, res, next){

	var content_id = req.query.content_id;

	Comment.getCommentByContentId(content_id, function(err, comments){
		if(err || comments.length <1){
			return "{ status:'error' }";
		}else {
			var comment = comments[0];
			changeComment(comment, function(err){
				res.send("{ status:'ok' }");
			});
		} 
	});
	//判断命令参数，明确具体操作
	//操作为 精选留言/回复留言/置顶留言

}

/*
* command: remove_good_comment, set_good_comment, set_top_comment, remove_top_comment
*/
function changeComment(command, comment, callback){
	var loadResult;

	async.series([
	    function(cb) {
	        SchoolEx.getSchoolByEname(comment.school_enname, function (err, school) {
	            schoolEx = school;
	            cb();
	        })
	    },

	    function(cb) {//1.1：登陆。
	        login(schoolEx, function(err, results){
	            loadResult = results;
	            console.log("登陆：" + comment.school_enname);
	            cb();
	        });
	    },
	    function (cb) {
	    	var data = {
	    	    comment_id:comment.comment_id,
	    	    action:command,
	    	    user_comment_id_count:1,
	    	    user_comment_id_0:comment.id,
	    	    token:loadResult.token,
	    	    ajax:'1',                                
	    	    f:'json'
	    	};
	    	var sendData = '';

	    	for (property in data) {
	    	    sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
	    	}

	        request.post("https://mp.weixin.qq.com/misc/appmsgcomment") //更新留言状态
	            .set('Cookie', loadResult.cookie)
	            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
	            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
	            .set('Referer', "https://mp.weixin.qq.com/misc/appmsgcomment?action=list_latest_comment&begin=0&count=10&mp_version=7&token=" + loadResult.token+ "&lang=zh_CN")
	            .send(sendData)
	            .end(function (res) {
	     			console.log(res.text);
	     			result = JSON.parse(res.text);
	     			if(result.ret == 0){
	     				console.log("success!");
	     			}
	     			cb();
                });	            
	    },
	    
	], function () {
		callback();
	});
}
/*
* 回复留言
*/
function replyComment(){

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
        remain : remain
    }

    fs.writeFileSync(BREAK_POINT_FILE, JSON.stringify(date));

    return;
}