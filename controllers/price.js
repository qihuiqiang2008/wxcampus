var EventProxy = require('eventproxy');
var School = require('../proxy').School;
var SchoolEx = require('../proxy').SchoolEx;

exports.getPrice = function(req, res, next){
	var p = req.body;

	var slot = JSON.parse(p.slot);

	School.getSchoolsByQuery({}, {}, function(err, data){
		console.log(err);
		console.log(data);
	});

	slot.forEach(function(item) {
	    console.log(item.school);
	    console.log(item.date);
	    item.date = new Date(item.date);
	});
}