
var emailjs = require("emailjs");
var SchoolEx = require('../proxy').SchoolEx;

exports.mail = function (req, res, next) {
    console.log("-----")
    var en_name=req.query.en_name;
    var server  = emailjs.server.connect({
        user:    "wxcampus@163.com",
        password:"zgyfjch2013",
        host:    "smtp.163.com",
        ssl:     true
    });
    SchoolEx.getSchoolByEname(en_name,function(err,schoolEx){
        var option={
            text:    "wechat scan QR code["+schoolEx.en_name+"]",
            from:    "you <wxcampus@163.com>",
            to:      " <"+schoolEx.mail+">",
            subject: "wechat scan QR code["+schoolEx.en_name+"]"
        }
        console.log(option)

        server.send(option, function(err, message) {
            if(err){
                res.send("0")
            }else{
                res.send("1")
            }
        });
    })



// send the message and get a callback with an error or details of the message that was sent

}

