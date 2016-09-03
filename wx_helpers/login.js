
var request = require('superagent');

require('./md5');
var http = require('http');
var Configuration = require('../proxy').Configuration;
module.exports = function(wxAccount, fn) {

       if(wxAccount.token && wxAccount.cookie){
           var  data = {
               token: wxAccount.token ,
               cookie: wxAccount.cookie
           };
           return fn(null, data);
       }
       var wx_pwd, wx_usr;
 /*
            var today=new Date();
            var s=today.getFullYear()+"年"+today.getMonth()+"月"+today.getDate()+"日"+today.getHours()

*/
        wx_usr = wxAccount.wx_account_id;
        wx_pwd = md5(wxAccount.wx_account_password.substr(0, 16));
        return request.post('https://mp.weixin.qq.com/cgi-bin/login?lang=zh_CN').type('form').set('Referer', 'https://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&lang=zh_CN').send({
            username: wx_usr,
            pwd: wx_pwd,
            imgcode: '',
            f: 'json'
        }).end(function(res) {
            console.log(res.text);
            var cookie, data, property, rs, s, token, _i, _len, _ref;
//            for (property in res.body) {
//                s = property + ": " + res.body[property] + "\n";
//                console.log(s);
//            }
            if(res.body.redirect_url) {
               token = res.body.redirect_url.match(/token=(\d+)/)[1];
            } else {
                for (property in res) {
                    s = property + ": " + res[property] + "\n";
                    console.log(s);
                }
            }
            cookie = '';
			//console.log(res.header['set-cookie'])
            if (res.header['set-cookie']) {
                _ref = res.header['set-cookie'];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    rs = _ref[_i];
                    cookie += rs.replace(/HttpOnly/g, '');
                }
            }


            data = {
                token: token,
                cookie: cookie
            };
            return fn(null, data);
        });

};
