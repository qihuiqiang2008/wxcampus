require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var async = require('async');
var fs = require('fs');
var School = require('../proxy').School;

var BREAK_POINT_FILE = "break_point.tmp";

exports.delMessage = function (req, res, next) {
    var day = req.query.date;
    var loadResult;
    var school_enname= req.query.school;
    var schoolEx;
    var begin = req.query.begin;
    var idx = req.query.idx;
    var result_json;
    var result;

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
                cb();
            });
        },

        function (cb) {
            var url = 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=' + begin + '&count=20&token=' + loadResult.token + '&lang=zh_CN';
            console.log(url);
            request.get(url) //获取人数
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .end(function (res) {

                    var indexHead = res.text.indexOf('wx.cgiData');        //获取cgiData
                    var indexTail = res.text.indexOf('seajs.use', indexHead);
                    var html = res.text.slice(indexHead, indexTail).trim();
                    var wx = {
                        cgiData : '0'
                    };
                    eval(html);
                    for(var item in wx.cgiData.list){
                        var date_time = wx.cgiData.list[item]["date_time"];
                        var itemData = new Date(parseInt(date_time + "000"));
                        var requireDataString = "" + itemData.getUTCFullYear() + (itemData.getUTCMonth() + 1) + itemData.getUTCDate();
                        
                        if(requireDataString == day){

                            var delId = wx.cgiData.list[item]["id"];
                            console.log("Delete Mesaage :" + wx.cgiData.list[item]["title"]);
                            var data = {
                                token:loadResult.token,
                                ajax:'1',                                
                                f:'json',                                
                                lang:'zh_CN',
                                random:Math.random(),
                                id:delId,
                                idx:idx
                            };

                            var sendData = '';

                            for (property in data) {
                                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                                //console.log(property + ':' + data[property]);
                            }

                            request.post("https://mp.weixin.qq.com/cgi-bin/masssendpage?action=delete&token=" + loadResult.token + "&lang=zh_CN")
                            .set('Cookie', loadResult.cookie)
                            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                            .set('Referer', url)
                            .set('X-Requested-With', 'XMLHttpRequest')
                            .send(sendData)
                            .end(function (res) {
                                console.log(res.text);
                                result_json=JSON.parse(res.text);
                                result = result_json.base_resp.ret == 0 ? "success" : reult_json.base_resp;
                                cb();
                            });
                        }
                    }
                    
                });
        }
    ], function () {
        res.send("success");
    });
}

exports.delOneSchoolMsg = function(req, res, next){

    var begin = req.query.begin;
    var end = req.query.end;

    begin = "2017-01-01";
    console.log("现在开始删除所有学校");
    console.log("开始时间：" + begin);
    console.log("结束时间：" + end);
    School.getAllSchools(function(err, school_list){
        var index = check_break_point_school(school_list);
        var new_list = school_list.slice(index);

        async.eachSeries(new_list, function(school, callback){
            console.log("开始删除 " + school.en_name);
            del_one_school(school.en_name, begin, end, callback);
        },

        function(){
            console.log("全部学校删除完成!");
            clear_break_point();
        });
    });

}

exports.delOneSchoolMsg1 = function(req, res, next){
    var begin = req.query.begin;
    var end = req.query.end;
    var loadResult;
    var school_enname= 'whu';
    var schoolEx;
    var result_json;
    var result;
    begin = "2015-04-07";
    //end = "2016-06-06";
    var time_begin = new Date(begin);
    var time_end = new Date(end);
    var stop_flag = 0;

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
                cb();
            });
        },

        function (cb) { //获取 删除信息
            var url = 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=' + begin + '&count=20&token=' + loadResult.token + '&lang=zh_CN';
            
            request.get(url) 
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .end(function (res) {
                    var count = 0;
                    var indexHead = res.text.indexOf('wx.cgiData');        //获取cgiData
                    var indexTail = res.text.indexOf('seajs.use', indexHead);
                    var html = res.text.slice(indexHead, indexTail).trim();
                    var wx = {
                        cgiData : '0'
                    };
                    eval(html);
                    var total_count = wx.cgiData.total_count;
                    console.log("共有文章：" + total_count);

                    console.log("检查断点...");
                    count = check_break_point_count(school_enname);
                    async.whilst(function(){ //判断是否满足退出条件
                        console.log("测试循环条件：" + count*20 < total_count && stop_flag == 0);
                        return (count*20 < total_count && stop_flag == 0);
                    }, function(callback){ //循环主体函数
                        count++;
                        begin = count * 20;
                        url = 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=' 
                        + begin + '&count=20&token=' + loadResult.token + '&lang=zh_CN';
                        if(stop_flag == 1){
                            callback();
                        }
                        request.get(url) 
                            .set('Cookie', loadResult.cookie)
                            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                            .set({"Accept-Encoding": "gzip,sdch"}) 
                            .end(function(res){
                                var indexHead = res.text.indexOf('wx.cgiData');        //获取cgiData
                                var indexTail = res.text.indexOf('seajs.use', indexHead);
                                var html = res.text.slice(indexHead, indexTail).trim();
                                eval(html);
                                async.each(wx.cgiData.list, function(item, cb2){
                                    console.log("当前删除时间：" + new Date(item.date_time * 1000));
                                    if(time_end != undefined && time_end > item.date_time * 1000){
                                        console.log("时间超出期限，停止删除");
                                        stop_flag = 1;
                                    }
                                    async.eachSeries(item.multi_item, function(article, cb3){
                                        if(need_del(article, item.date_time, time_begin, time_end)){
                                            
                                            console.log("删除 " + article.seq + " ：" + article.title);
                                            var data = {
                                                token:loadResult.token,
                                                ajax:'1',                                
                                                f:'json',                                
                                                lang:'zh_CN',
                                                random:Math.random(),
                                                id:item.id,
                                                idx:article.seq + 1
                                            };

                                            var sendData = '';

                                            for (property in data) {
                                                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                                            }

                                            request.post("https://mp.weixin.qq.com/cgi-bin/masssendpage?action=delete&token=" + loadResult.token + "&lang=zh_CN")
                                            .set('Cookie', loadResult.cookie)
                                            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                            .set('Referer', url)
                                            .set('X-Requested-With', 'XMLHttpRequest')
                                            .send(sendData)
                                            .end(function (res) {
                                                result_json=JSON.parse(res.text);
                                                if(result_json.base_resp.ret == 0)
                                                    result = "success";
                                                else
                                                    result = "fail";
                                                console.log("结果：" + result);
                                                cb3();
                                            });
                                        } else {
                                            cb3();
                                        }
                                    }, function(){
                                        cb2();
                                    });
                                    
                                }, function(err){
                                    console.log(count + "次循环完成...");
                                    write_break_point(school_enname, count);
                                    callback();
                                });
                            });
                    }, function(err, data){
                        console.log("所有删除完成");
                        cb();
                    });
            });
        }
    ], function () {
        res.send("success");
    });
}


function del_one_school(school_enname, begin, end, cb_for_del){
    var loadResult;
    var schoolEx;
    var result_json;
    var result;
   
    var time_begin = new Date(begin);
    var time_end = new Date(end);
    var stop_flag = 0;

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
                cb();
            });
        },

        function (cb) { //获取 删除信息
            var url = 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=' + begin + '&count=20&token=' + loadResult.token + '&lang=zh_CN';
            
            request.get(url) 
                .set('Cookie', loadResult.cookie)
                .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                .end(function (res) {
                    var count = 0;
                    var indexHead = res.text.indexOf('wx.cgiData');        //获取cgiData
                    var indexTail = res.text.indexOf('seajs.use', indexHead);
                    var html = res.text.slice(indexHead, indexTail).trim();
                    var wx = {
                        cgiData : '0'
                    };
                    eval(html);
                    var total_count = wx.cgiData.total_count;
                    console.log("共有文章：" + total_count);

                    console.log("检查断点...");
                    count = check_break_point_count(school_enname);
                    async.whilst(function(){ //判断是否满足退出条件
                        console.log("测试循环条件：" + count*20 < total_count && stop_flag == 0);
                        return (count*20 < total_count && stop_flag == 0);
                    }, function(callback){ //循环主体函数
                        count++;
                        begin = count * 10;
                        url = 'https://mp.weixin.qq.com/cgi-bin/masssendpage?t=mass/list&action=history&begin=' 
                        + begin + '&count=10&token=' + loadResult.token + '&lang=zh_CN';
                        if(stop_flag == 1){
                            callback();
                        }
                        request.get(url) 
                            .set('Cookie', loadResult.cookie)
                            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                            .set({"Accept-Encoding": "gzip,sdch"}) 
                            .end(function(res){
                                var indexHead = res.text.indexOf('wx.cgiData');        //获取cgiData
                                var indexTail = res.text.indexOf('seajs.use', indexHead);
                                var html = res.text.slice(indexHead, indexTail).trim();
                                eval(html);
                                async.each(wx.cgiData.list, function(item, cb2){
                                    console.log("当前删除时间：" + new Date(item.date_time * 1000));
                                    if(time_end != undefined && time_end > item.date_time * 1000){
                                        console.log("时间超出期限，停止删除");
                                        stop_flag = 1;
                                    }
                                    async.eachSeries(item.multi_item, function(article, cb3){
                                        if(need_del(article, item.date_time, time_begin, time_end)){
                                            
                                            console.log("删除 " + article.seq + " ：" + article.title);
                                            var data = {
                                                token:loadResult.token,
                                                ajax:'1',                                
                                                f:'json',                                
                                                lang:'zh_CN',
                                                random:Math.random(),
                                                id:item.id,
                                                idx:article.seq + 1
                                            };

                                            var sendData = '';

                                            for (property in data) {
                                                sendData = sendData + property + '=' + encodeURIComponent(data[property]) + "&";
                                            }

                                            request.post("https://mp.weixin.qq.com/cgi-bin/masssendpage?action=delete&token=" + loadResult.token + "&lang=zh_CN")
                                            .set('Cookie', loadResult.cookie)
                                            .set('User-Agent', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20100101 Firefox/31.0')
                                            .set({"Accept-Encoding": "gzip,sdch"}) //为了防止出现Zlib错误
                                            .set('Referer', url)
                                            .set('X-Requested-With', 'XMLHttpRequest')
                                            .send(sendData)
                                            .end(function (res) {
                                                result_json=JSON.parse(res.text);
                                                if(result_json.base_resp.ret == 0)
                                                    result = "success";
                                                else
                                                    result = "fail";
                                                console.log("结果：" + result);
                                                cb3();
                                            });
                                        } else {
                                            cb3();
                                        }
                                    }, function(){
                                        cb2();
                                    });
                                    
                                }, function(err){
                                    console.log(count + "次循环完成...");
                                    write_break_point(school_enname, count);
                                    callback();
                                });
                            });
                    }, function(err, data){
                        console.log("所有删除完成");
                        cb();
                    });
            });
        }
    ], function () {
        cb_for_del();
    });
}
// begin 与 end 都为毫秒数
// begin 为删除开始时间，end为结束时间，begin > end
// 即为begin更靠近当前的时间
function need_del(item, current, time_begin, time_end){
    var title = item.title;
    var time = new Date(current*1000);

    if(item.is_deleted == 1) //删除过的不需要再删除
        return false;

    if(current == undefined || current < 0){
        return contain_keywords(title);
    }

    if(time_begin != undefined && time > time_begin){
        console.log("time begin exceed!");
        return false;
    }

    if(time_end != undefined && time < time_end){
        console.log("time end exceed!");
        return false;
    }

    return  contain_keywords(title);
}

function contain_keywords(title) {
    if(title.indexOf("晚安") > 0 || title.indexOf("思想") > 0 || title.indexOf("思享") > 0){
           
           return true;
    } 
    return false; 
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