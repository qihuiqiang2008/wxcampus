var request = require("superagent");


exports.wxmsg = function(req, res, next){
    console.log("---------")
                request.get('https://mp.weixin.qq.com/s?__biz=MzA4MjIzNzkxNQ==&mid=2649137682&idx=1&sn=99e2dcb06d2d80cdd968b99a2d2b2eed&scene=0&key=7b81aac53bd2393dc1820cb74238b680a8c75ebe939f0933760a2c92ee173a35605c5d866557532e86e7176ef434e88f&ascene=0&uin=MTg2MDM4NTc4MA%3D%3D&devicetype=iMac+MacBookAir6%2C2+OSX+OSX+10.11.6+build(15G31)&version=11000003&pass_ticket=lNwII31le51bic7lum3qFfrUfNGnOAxWdfX8phpoZH282tw25peMapaM3eELqX0H') //获取人数
                    .set({"Accept-Encoding" : "gzip,sdch"}) //为了防止出现Zlib错误
                    .end(function(res) {
                        res
                        console.log(res.text)

	});




    }
function FormatDate (strTime) {
    var date = new Date(strTime);
    return date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate();
}

function getString(number){
   return "账号整体情况：1.总人数"+number+"万，覆盖天津 北京 上海 西安 南京 银川 武汉的大部分高校  2.每天收到的表白数量在4000条左右，树洞数量在1000条左右3.账号活跃度在同类账号中算是比较高的4.上面的人数都是实事求是，如果觉的有问题可以截图收费情况：1.上面表格中的价格都是头条的价格，北京地区的是每1000人50块（原来是40块，最近因为广告比较多，所以涨了10块），其他地区都是每1000人40块2.如果是发次条广告，价格是头条的60%（推荐这种方式，如果每天头条是广告的话，基本很少人点我们的公众号）3.就是在表白中加入广告块，这种方式价格也是头条的60%，广告块内容不能太多4.关键字和菜单的合作方式，这种可以具体详谈其他：1.阅读是多少就是多少，我们绝对不会去刷阅读2.广告的内容不能有诱导分享或者诱导关注之类的，"
}