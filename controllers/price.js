var EventProxy = require('eventproxy');
var School = require('../proxy').School;
var SchoolEx = require('../proxy').SchoolEx;
var config = require('../config').config;

exports.getPrice = function(req, res, next){

	var adsString = req.query.data;
	var ads;
	var priceDic;
	var discount = req.query.discount;

	if(adsString == undefined){
		res.send("error");
		return;
	}
	
	ads = JSON.parse(adsString);

	console.log("计算价格");

	var proxy = EventProxy.create('schools', 
	    function (schools) {
	    	var sum = 0;
	    	var after_discount = 0;
	     	priceDic = getSchoolPrice(schools);

	     	ads.forEach(function(item) {
	     	    
	     		if(item.position == '0'){
	     			sum += priceDic[item.school];
	     		} else {
	     			sum += priceDic[item.school] * config.second_discount;
	     		}
	     	});
	     	if(discount != undefined && discount > 0 && discount <= 10)
	     		after_discount = Math.floor(sum * discount / 100) * 10;
	     	else
	     		after_discount = sum;


	     	console.log("总价格为：" + after_discount);
	     	var result = {
	     		total : after_discount,
	     		origin : sum
	     	}
	     	res.send(JSON.stringify(result));
	});

	School.getSchoolsByQuery({}, {}, proxy.done("schools"));

}

function getSchoolPrice(schools){
	var priceDic = new Array();

	schools.forEach(function(school){
		
		priceDic[school.en_name] = priceRule(parseInt(school.fans));
	});

	return priceDic;
}

// position == 0 为头条
function priceRule(fans){
	//报价规则，如果一个学校的价格少于50元，则取50元
	//价格为每粉丝0.05元
	//价格四舍五入以50元为单位
	//次条价格为头条价格低6折

	var price_per_fans = config.price_per_fans;
	var min_price = config.min_price;
	var price_step = config.price_step;
	var second_discount = config.second_discount;
	
	var price = fans * price_per_fans;

	price = Math.floor(price/price_step) * price_step;

	if(price < min_price)
		price = min_price;

	return price;

}