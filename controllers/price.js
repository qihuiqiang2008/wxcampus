var EventProxy = require('eventproxy');
var School = require('../proxy').School;
var SchoolEx = require('../proxy').SchoolEx;
var Configuration = require('../proxy').Configuration;

function countPrice(ads, discount, callback){
	var priceDic;

	console.log("计算价格");

	var proxy = EventProxy.create('schools', "price_per_fans", "min_price", "price_step", "second_discount",
	    function(schools, price_per_fans, min_price, price_step, second_discount) {
	        var sum = 0;
	        var after_discount = 0;


	        price_per_fans = parseFloat(price_per_fans.value);
	        min_price = parseInt(min_price.value);
	        price_step = parseInt(price_step.value);
	        second_discount = parseFloat(second_discount.value);

	        priceDic = getSchoolPrice(schools, price_per_fans, price_step, min_price);

	        ads.forEach(function(item) {

	            if (item.position == '0') {
	                sum += priceDic[item.school];
	            } else {
	                sum += priceDic[item.school] * second_discount;
	            }
	        });
	        if (discount != undefined && discount > 0 && discount <= 10)
	            after_discount = Math.floor(sum * discount / 100) * 10;
	        else
	            after_discount = sum;


	        console.log("总价格为：" + after_discount);
	        var result = {
	            total: after_discount,
	            origin: sum
	        }
	        callback(result);
	    });

	School.getSchoolsByQuery({}, {}, proxy.done("schools"));

	Configuration.getConfigurationByCode("second_discount", proxy.done("second_discount"));
	Configuration.getConfigurationByCode("price_per_fans", proxy.done("price_per_fans"));
	Configuration.getConfigurationByCode("min_price", proxy.done("min_price"));

	Configuration.getConfigurationByCode("price_step", proxy.done("price_step"));
}

exports.getPrice = function(req, res, next) {

    var adsString = req.query.data;
    var ads;
    var discount = req.query.discount;

    if (adsString == undefined) {
        res.send("error");
        return;
    }

    ads = JSON.parse(adsString);

    countPrice(ads, discount, function(result){
    	res.send(JSON.stringify(result));
    });

}

function getSchoolPrice(schools, price_per_fans, price_step, min_price) {
    var priceDic = new Array();

    schools.forEach(function(school) {

        priceDic[school.en_name] = priceRule(parseInt(school.fans),
            price_per_fans, price_step, min_price);
    });

    return priceDic;
}

// position == 0 为头条
function priceRule(fans, price_per_fans, price_step, min_price) {
    //报价规则，如果一个学校的价格少于50元，则取50元
    //价格为每粉丝0.05元
    //价格四舍五入以50元为单位
    //次条价格为头条价格低6折
    var price = fans * price_per_fans;

    price = Math.floor(price / price_step) * price_step;
    if (price < min_price)
        price = min_price;

    return price;

}

module.exports.countPrice = countPrice;