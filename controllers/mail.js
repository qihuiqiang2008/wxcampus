
var emailjs = require("emailjs");
var SchoolEx = require('../proxy').SchoolEx;

exports.mail = function (req, res, next) {
    console.log("-----")
    var content=req.body.content;
    var server  = emailjs.server.connect({
        user:    "muc_welife@163.com",
        password:"QHQ19891216",
        host:    "smtp.163.com",
        ssl:     true
    });
    var option={
        text:    content,
        from:    "you <muc_welife@163.com>",
        to:      " <muc_welife@163.com>",
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

