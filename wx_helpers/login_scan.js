var request = require('superagent');

require('./md5');
module.exports = function(wxAccount, fn) {

    // if(wxAccount.token && wxAccount.cookie){
    //     var  data = {
    //         token: wxAccount.token ,
    //         cookie: wxAccount.cookie
    //     };
    //     return fn(null, data);
    // }
    // var wx_pwd, wx_usr;
    /*
     var today=new Date();
     var s=today.getFullYear()+"年"+today.getMonth()+"月"+today.getDate()+"日"+today.getHours()

     */
    var scan = false;
    wx_usr = wxAccount.wx_account_id;
    wx_pwd = md5(wxAccount.wx_account_password.substr(0,16));
    console.log(wx_usr);
    console.log(wx_pwd);

    return request.post('https://mp.weixin.qq.com/cgi-bin/login?lang=zh_CN').type('form').set('Referer', 'https://mp.weixin.qq.com/cgi-bin/singlesend?t=ajax-response&lang=zh_CN').send({
        username: wx_usr,
        pwd: wx_pwd,
        imgcode: '',
        f: 'json'
    }).end(function(err, res) {

        var cookie, data, property, rs, s, token, _i, _len, _ref;
        for (property in res.body) {
            s = property + ": " + res.body[property] + "\n";
            console.log(s);
        }

        for (property in res.body.base_resp) {
            s = property + ": " + res.body.base_resp[property] + "\n";
            console.log(s);
        }

        if(res.body.redirect_url) {
            if(res.body.redirect_url.substr(0, 12) == "/cgi-bin/home"){

                token = res.body.redirect_url.match(/token=(\d+)/)[1];
            } else {
                console.log(wx_usr + " : Open Scan login!!");
                scan = true;
            }
        } else {
            for (property in res) {
                s = property + ": " + res[property] + "\n";
                console.log(s);
            }
        }


        cookie = '';
        if (res.header['set-cookie']) {
            _ref = res.header['set-cookie'];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                rs = _ref[_i];
                cookie += rs.replace(/HttpOnly/g, '');
            }
        }


        data = {
            token: token,
            cookie: cookie,
            scan: scan,
            redirect_url: res.body.redirect_url
        };
        return fn(null, data);
    });

};
