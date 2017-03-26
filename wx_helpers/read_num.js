/**
 * Created by yiweiguo on 2017/3/26.
 */
var querystring = require('querystring');
const READNUM_API="http://wxapi.51tools.info/wx/api.ashx?key=tp_591320673&ver=1";
var urlutil = require('url');
var http = require("http");
exports.getReadNow = function (url,callback) {
    var url=unescape(url);
    sendHttpRequest(READNUM_API, 'post',url,function (responseData) {
        if(responseData){
            var json=JSON.parse(responseData);
            if(json.data.state==0){
                callback(null,json.data)
            }
            else {
                console.log("失败，"+json.data);
                callback(json.data.msg,null)
            }
        }
        else{
            callback("失败",null)
        }
    });
}


var sendHttpRequest = function (url, type, param,callback) {
    console.log("param:"+param);
    var data = {url:param+''};
    //data = JSON.stringify(data);
    var content = querystring.stringify(data, null, null, null);
    var urlObj = urlutil.parse(url);
    var host = urlObj.hostname;
    var path = urlObj.path;
    var port = urlObj.port;

    var options = {
        hostname: host,
        port: 80,
        path: path,
        method: type,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Content-Length': Buffer.byteLength(content)
        }
    };
    var body = '';
    var req = http.request(options, function (res) {
        console.log("response: " + res.statusCode);
        res.on('data', function (data) {
            body += data;
        }).on('end', function () {
            callback(body);
        });
    }).on('error', function (e) {
        console.log("error: " + e.message);
    })
    req.write(content);
    req.end();
};


function escape2Html(str) {
    var arrEntities = {'lt': '<', 'gt': '>', 'nbsp': ' ', 'amp': '&', 'quot': '"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function (all, t) {
        return arrEntities[t];
    });
}