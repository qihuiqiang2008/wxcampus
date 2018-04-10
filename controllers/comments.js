var Comment = require('../proxy').Comment;
require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var async = require('async');
var fs = require('fs');
var School = require('../proxy').School;


var BREAK_POINT_FILE = "break_point.tmp";

/*
* 显示留言审查界面
*/
exports.show = function(req, res, next){

	//查询留言
}

/*
* 更改某一留言状态
*/
exports.updateComment = function(req, res, next){

	//判断命令参数，明确具体操作
	//操作为 精选留言/回复留言/置顶留言

}

/*
* 获取留言并同步到数据库
*/
function refreshComment(req, res, next){

	//断点续传
	console.log("现在开始获取所有留言");
	School.getAllSchools(function(err, school_list){
		var index = check_break_point_school(school_list);
		var new_list = school_list.slice(index);

		async.eachSeries(new_list, function(school, callback){
            console.log("开始同步留言：" + school.en_name);
            getOneSchoolComment(school.en_name, callback);
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

exports.queryRefreshStatus = function(req, res, next){

}

function check_break_point_count(school){

    if(fs.existsSync(BREAK_POINT_FILE)){
        var content = fs.readFileSync(BREAK_POINT_FILE, 'utf-8');
        var json = JSON.parse(content);

        if(json.school == school){
            console.log("恢复断点：" + json.count);
            return json.count;
        }
    }
    
    return 0;
}

function check_break_point_school(school_list){
    if(fs.existsSync(BREAK_POINT_FILE)){
        var content = fs.readFileSync(BREAK_POINT_FILE, 'utf-8');
        var json = JSON.parse(content);

        for(item in school_list){
            if(school_list[item].en_name == json.school){
                return item;
            }
        }
    }
    
    return 0;
}

function clear_break_point(){
    fs.unlinkSync(BREAK_POINT_FILE);
}

function write_break_point(school, count){
    var date = {
        school : school,
        count: count
    }

    fs.writeFileSync(BREAK_POINT_FILE, JSON.stringify(date));

    return;
}