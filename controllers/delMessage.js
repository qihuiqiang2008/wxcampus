require('../wx_helpers/md5');
var request = require("superagent");
var login = require(__dirname + '/../wx_helpers/login');
var SchoolEx = require('../proxy').SchoolEx;
var async = require('async');

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
        res.send(result);
    });


}