
var emailjs = require("emailjs");
var SchoolEx = require('../proxy').SchoolEx;

exports.mail = function (req, res, next) {
    console.log("-----")
    var content=req.body.content;
    var server  = emailjs.server.connect({
        user:    "wxcampus@163.com",
        password:"zgyfjch2013",
        host:    "smtp.163.com",
        ssl:     true
    });
    var option={
        text:    content,
        from:    "you <wxcampus@163.com>",
        to:      " <qihuiqiang2008@163.com>",
        subject: content
    }
    console.log(option)

    server.send(option, function(err, message) {
        console.log(err)
        if(err){
            res.send("0")
        }else{
            res.send("1")
        }
    });
    //SchoolEx.getSchoolByEname(en_name,function(err,schoolEx){
    //
    //})



// send the message and get a callback with an error or details of the message that was sent

}

