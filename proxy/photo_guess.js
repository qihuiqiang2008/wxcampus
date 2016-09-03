var EventProxy = require('eventproxy');
var Photo_Guess = require('../models').Photo_Guess1;
var mongoose = require('mongoose');
exports.getCountByQuery = function (query, callback) {
    Photo_Guess.count(query, callback);
};

/*
photo_url:{type:String},
wx_photo_url:{type:String},
questions:[{q_id:{type:ObjectId ,ref:'Question'},value:{type:String},show_index:{type: Number, default:0 }}],
    introduction:{type: String },
nickname:{type: String },
sex:{type:String },
cn_name:{type:String },
en_name:{type:String},
must_anwser:{type: Boolean,default:false},
wx_account:{type:String },
wx_already_open_count:{type: Number, default: 0 },
source:{type: String},
range:{type: Number, default: 0 },
wx_open_count:{type: Number, default: 0 },
guess_count:{type: Number, default: 0 },
pass:{type: Boolean,default:true},
region_code:{type:String},
hometown:{type:String},
recommand_name:{type:String},
major,demand,grade,transform,type,price,create_at
*/

exports.getPhoto_GuessByQuery = function (query, opt, callback) {
    Photo_Guess.find(query,["photo_url","nickname","wx_photo_url","sex","cn_name","en_name","must_anwser","wx_account","wx_already_open_count","source","range","wx_open_count","guess_count","pass","region_code","hometown","recommand_name","major","demand","grade","transform","type","price","create_at","introduction"], opt, function (err, docs) {
        if (err){
            return callback(err);
        }
        if (docs.length === 0){
            return callback(null,[]);
        }
        return callback(null,docs);
    });
};

exports.getPhoto_GuessById = function (id, callback) {
    //Photo_Guess.findOne({_id:id}, callback);{
//    path: 'fans',
//        match: { age: { $gte: 21 }},
//    select: 'name -_id',
//        options: { limit: 5 }
//}
    Photo_Guess.findOne({_id:id}).populate( {path: 'questions'}).exec(callback);
    //  PostReply.find(query, [], opt)
};

exports.addAnswer = function (id,answer,callback) {
    Photo_Guess.update({_id:id},{$push:{"answers":answer}},callback)

};

exports.update_type = function (callback) {
    Photo_Guess.update({}, {$set:{type:"photo_guess"}}, callback)
};



exports.removeAnswer = function (id,answerid,callback) {
    Photo_Guess.update({_id:id},{$pull:{answers:{_id:new mongoose.Types.ObjectId(answerid)}}},callback);

};

exports.newAndSave = function (photo_url,questions,nickname,sex,cn_name,en_name,introduction,wx_account,wx_open_count,region_code,range,must_anwser,source,grade,hometown,type,price,recommand_name,major,demand,callback) {
//    photo_url:{type:String},
//    questions:[{question_id:{type:ObjectId},value:{type:String}}],
//        introduction:{type: String },
//    nickname:{type: String },
//    sex:{type:String },
//    school:{type:String },
//    wx_account:{type:String },
//    wx_open_count:{type: Number, default: 0 },
//    create_at: {type:Date,default: Date.now}
    console.log(cn_name);
    var photo_guess = new Photo_Guess();
    photo_guess.photo_url = photo_url;
    photo_guess.questions = questions;
    photo_guess.nickname = nickname;
    photo_guess.sex = sex;
    photo_guess.cn_name = cn_name;
    photo_guess.en_name = en_name;
    photo_guess.wx_account = wx_account;
    photo_guess.introduction=introduction;
    photo_guess.wx_open_count = wx_open_count;
    photo_guess.region_code = region_code;
    photo_guess.source = source;
    photo_guess.range=range;
    photo_guess.must_anwser=must_anwser;
    photo_guess.grade=grade;
    photo_guess.hometown=hometown;
    photo_guess.type=type;
    photo_guess.price=price;
    photo_guess.recommand_name=recommand_name;
    photo_guess.major=major;
    photo_guess.demand=demand;
    photo_guess.save(callback);
};
exports.removeById = function (id, callback) {
    Photo_Guess.remove({_id: id}, callback);
};
