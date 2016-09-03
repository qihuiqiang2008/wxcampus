var models = require('../models');
var Group = models.Group;
var Util = require('../libs/util');



exports.newAndSave = function (id, name,callback) {
    var group = new Group();
    group.id = id;
    group.name = name;
    group.save(callback);
};

exports.getAllGroups = function (callback) {
    Group.find({}, [], {sort: [['create_at', 'asc']]}, callback);
};


exports.getSchoolById = function (id, callback) {
    Group.findOne({id:id}, callback);
};

exports.removeAll = function (callback) {
    Group.remove({}, callback);
};
