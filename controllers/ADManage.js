var EventProxy = require('eventproxy');
var School = require('../proxy').School;
var SchoolEx = require('../proxy').SchoolEx;
var Region = require('../proxy').Region;
var Resource = require('../proxy').Resource;
var ad = require('../proxy').AD;
var countPrice = require('./price.js').countPrice;

exports.getAD = function(req, res, next) {
    var region_code = req.query.region_code;
    var tag = req.query.tag;
    var admin = req.query.admin;
    var t = req.query.m;
    var query = {};
    var begin, end;

    if (req.query.begin != undefined) {
        begin = new Date(new Date(req.query.begin).setUTCHours(0, 0, 0, 0));
        if (req.query.end != undefined) {
            end = new Date(new Date(req.query.end).setUTCHours(0, 0, 0, 0));
        } else {
            end = new Date(begin.getTime() + 7 * 24 * 3600 * 1000);
        }
    } else {
        begin = new Date(new Date().setUTCHours(0, 0, 0, 0));
        end = new Date(begin.getTime() + 7 * 24 * 3600 * 1000);
    }
    console.log(begin);
    console.log(end);

    if (admin) {
        query = { admin: admin };
    }
    if (region_code) {
        query = { region_code: region_code };
    }
    if (tag) {
        if (tag == "1") {
            query = { active: true };
        } else {
            query = { active: false };
        };
    }

    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit = 100;
    var options = {
        skip: (page - 1) * limit,
        limit: limit,
        sort: [
            ['region_code', 'asc']
        ]
    };
    var view = 'back/school/ADs';
    if (t) {
        view = 'back/school/ADs';
    }
    var proxy = EventProxy.create('schools', 'pages', 'TodayResourceCount', 'regions', 'ads',
        function(schools, pages, TodayResourceCount, regions, ads) {
            res.render(view, {
                schools: schools,
                pages: pages,
                current_page: page,
                TodayResourceCount: TodayResourceCount,
                belong_group: req.session.user.location.belong_group,
                regions: regions,
                ads: JSON.stringify(ads),
                begin_date: begin
            });
        });


    proxy.fail(next);
    School.getSchoolsByQuery(query, options, proxy.done("schools"));
    School.getCountByQuery(query, proxy.done(function(all_count) {
        var pages = Math.ceil(all_count / limit);
        proxy.emit('pages', pages);
    }));
    if (req.session.user.email !== 'admin@admin.com') {
        query = {};
    }
    Region.getRegionByQuery({}, {}, proxy.done("regions"))
    Resource.getTodayResourceCount(req.session.user.location.belong_group, { "$gte": new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate()) }, proxy.done("TodayResourceCount"));

    ad.getAdByTime(begin, end, {}, function(err, ads) {
        console.log("-------查询到广告：----");
        console.log(ads);
        proxy.emit('ads', ads);
    });
}

exports.getTodayAD = function(req, res, next) {
    var begin;
    var day = req.query.day;
    if (day == undefined) {
        begin = new Date(new Date().setUTCHours(0, 0, 0, 0));
    } else {
        begin = new Date(day);
    }
    // var end = new Date(begin.getTime() + 1*24*3600*1000);
    var end = begin;

    var adFlagArray = new Array();
    var schooleDic = new Array();
    var new_ads = new Array();

    var proxy = EventProxy.create("ads", "schools", function(ads, school) {


        school.forEach(function(s) {
            schooleDic[s.en_name] = s.cn_name;
        });

        ads.forEach(function(ad, index) {
            ad.slot.forEach(function(slot) {
                if (slot.date.setUTCHours(0, 0, 0, 0) == begin.getTime()) {
                    adFlagArray[ad._id] = 1;
                }
            });

            if (adFlagArray[ad._id] != undefined) {
                new_ads.push(ad);
            }
        });

        // var name;
        // for(name in adFlagArray){
        //     count += 1;
        // }

        res.render('back/school/todayAD', {
            ads: new_ads,
            day: begin,
            adsO: JSON.stringify(new_ads),
            schools: schooleDic,
        });
    });

    ad.getAdByTime(begin, end, {}, function(err, ads) {

        proxy.emit('ads', ads);
    });

    School.getSchoolsByQuery({}, {}, proxy.done("schools"));

}

exports.syncADTag = function(req, res, next) {
    var begin = new Date(new Date().setUTCHours(0, 0, 0, 0));
    var end = begin;

    var adFlagArray = new Array();
    var schools = new Array();

    var proxy = EventProxy.create("ads", "reset", function(ads) {
        ads.forEach(function(ad, index) {
            ad.slot.forEach(function(slot) {
                if (slot.date.setUTCHours(0, 0, 0, 0) == begin.getTime()) {
                    adFlagArray[slot.school] = 1;
                }
            });
        });

        for (var school in adFlagArray) {

            School.getSchoolByEname(school, function(err, schoolEx) {
                if (schoolEx) {
                    schoolEx.active = true;
                    schoolEx.save();
                }
            })
        }

        var ret = {result: 'OK'}
        res.json(ret);
    });

    SchoolEx.updateAlltag(false, function (err) {
        if (err) {
            console.log(err);

        } else {
            proxy.emit('reset');
        }

    });

    ad.getAdByTime(begin, end, {}, function(err, ads) {
        proxy.emit('ads', ads);
    });
}

exports.syncOneADTag = function(req, res, next) {
    var begin = new Date(new Date().setUTCHours(0, 0, 0, 0));
    var end = begin;
    var id = req.query.id;

    var adFlagArray = new Array();
    var schools = new Array();

    var proxy = EventProxy.create("ads", "reset", function(ads) {
        ads.forEach(function(ad, index) {
            ad.slot.forEach(function(slot) {
                if (slot.date.setUTCHours(0, 0, 0, 0) == begin.getTime()) {
                    adFlagArray[slot.school] = 1;
                }
            });
        });

        for (var school in adFlagArray) {

            School.getSchoolByEname(school, function(err, schoolEx) {
                if (schoolEx) {
                    schoolEx.active = true;
                    schoolEx.save();
                }
            })
        }

        var ret = {result: 'OK'}
        res.json(ret);
    });

    SchoolEx.updateAlltag(false, function (err) {
        if (err) {
            console.log(err);

        } else {
            proxy.emit('reset');
        }

    });

    ad.getAdByIdAndTime(begin, end, id, function(err, ads) {
        proxy.emit('ads', ads);
    });
}

exports.showGetAD = function(req, res, next) {
    var begin = new Date(new Date().setUTCHours(0, 0, 0, 0));
    var end = new Date().getTime() + 7 * 24 * 3600 * 1000;
    end = new Date(new Date(end).setUTCHours(0, 0, 0, 0));
    var query = {};
    var options = {
        sort: [
            ['region_code', 'asc']
        ]
    };
    var proxy = EventProxy.create("schools", "ads", function(schools, ads) {
        res.render('back/school/addAD', {
            schools: schools,
            ads: JSON.stringify(ads)
        });
    });

    ad.getAdByTime(begin, end, {}, function(err, ads) {
        proxy.emit('ads', ads);
    });

    School.getSchoolsByQuery(query, options, proxy.done("schools"));

}

exports.getAdByTime = function(req, res, next) {
    var begin = new Date(req.query.begin);
    var end = new Date(req.query.end);

    var proxy = EventProxy.create("ads", function(ads) {
        res.json(ads);
    });

    ad.getAdByTime(begin, end, {}, function(err, ads) {
        console.log("-------查询到广告：----");
        console.log(ads);
        proxy.emit('ads', ads);
    });

}

exports.addAD = function(req, res, next) {
    var p = req.body;

    var slot = JSON.parse(p.slot);

    slot.forEach(function(item) {
        console.log(item.school);
        console.log(item.date);
        item.date = new Date(item.date);
    });

    countPrice(slot, p.discount, function(result){
        if(p.price == "" || p.price == undefined || p.price <0)
            p.price = result.total;
        ad.newAndSave(p.name, slot, p.custom, p.discount,
            p.price, p.sponsor, p.is_clear, p.remark,
            function(err, data) {
                console.log(err);
                console.log("添加广告成功: " + data.name);
                res.redirect('/back/school/listAD');
                //console.log(data);
            });
    });
}

exports.detailAD = function(req, res, next) {

}

exports.listAD = function(req, res, next) {

    var page = req.query.page;
    var size = req.query.size;
    var admin = req.query.admin;
    var option = {};

    if (page == undefined || page == null) {
        page = 0; //默认第1页
    }

    if (size == undefined || size == null) {
        size = 20; //默认每页20条
    }

    if (admin != undefined && admin != null) {
        option.sponsor = admin;
        console.log("admin is:" + admin);
    }

    var proxy = EventProxy.create("ads", "count", function(ads, count) {
        console.log("page is:" + page + " size is:" + size);
        res.render("back/school/listAD", {
            ads: ads,
            count: count,
            page: page,
            size: size,
            admin : admin
        });
    });

    ad.getAd(page * size, size, option, function(err, ads) {

        ads.forEach(function(ad){
            ad.slot.sort(function(a, b){
                return a.date <= b.date;
            });
        });
        proxy.emit('ads', ads);
    });

    ad.getCount(option, function(err, count) {
        console.log("共有广告 ：" + count);
        proxy.emit('count', count);
    });
}

exports.updateAD = function(req, res, next) {
    var p = req.body;

    var slot = JSON.parse(p.slot);

    slot.forEach(function(item) {

        item.date = new Date(item.date);
    });

    countPrice(slot, p.discount, function(result){
        if(p.price == "" || p.price == undefined || p.price <0)
            p.price = result.total;
        
        ad.update(p.id, p.name, slot, p.custom, p.discount,
            p.price, p.sponsor, p.is_clear, p.remark,
            function(err, data) {
                console.log(err);
                console.log("更改广告成功: " + data);
                res.redirect('/back/school/listAD');
                //console.log(data);
            });
    });
    
}

exports.showUpdateAD = function(req, res, next) {
    var id = req.query.id;

    var query = {};
    var options = {
        sort: [
            ['region_code', 'asc']
        ]
    };
    var proxy = EventProxy.create("schools", "ads", "the_ad", function(schools, ads, the_ad) {
        res.render('back/school/updateAD', {
            schools: schools,
            id: id,
            ad: the_ad,
            ads: JSON.stringify(ads)
        });
    });

    ad.getAdById(id, function(err, data) {
        proxy.emit('the_ad', data);

        var begin = new Date(new Date().setUTCHours(0, 0, 0, 0));
        var end = new Date().getTime() + 7 * 24 * 3600 * 1000;
        end = new Date(new Date(end).setUTCHours(0, 0, 0, 0));

        ad.getAdByTime(begin, end, {}, function(err, ads) {

            ads.splice(indexOf(ads, data[0]), 1);
            proxy.emit('ads', ads);
        });
    });

    School.getSchoolsByQuery(query, options, proxy.done("schools"));
}

function indexOf(array, obj) {
    var ret = -1;

    console.log(array);
    array.forEach(function(item, index) {
        if (JSON.stringify(item._id) == JSON.stringify(obj._id)) {
            ret = index;
            console.log("ret is " + ret);

        }
    });
    console.log("ret return " + ret);
    return ret;
}

exports.removeAD = function(req, res, next) {
    var id = req.query.id;

    ad.delAd(id, function(err, data) {
        console.log("删除广告：" + data);
        res.json({ 'result': 'success' });
    });
}

exports.clearAD = function(req, res, next) {
    var id = req.query.id;

    ad.clearAd(id, function(err, data) {
        console.log("结算广告：" + data);
        res.json({ 'result': 'success' });
    });
}

exports.testAdd = function(req, res, next) {
    var name = "test";
    var slot = new Array();
    slot.push({ school: "buaa", date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000) });
    slot.push({ school: "whu", date: new Date(new Date().getTime() + 1 * 24 * 60 * 60 * 1000) });
    var custom = "testCustom";
    var discount = 0.85;
    var price = 1000;
    var sponsor = "汪";
    var is_clear = false;
    ad.newAndSave(name, slot, custom, discount, price, position, sponsor, is_clear);
}
