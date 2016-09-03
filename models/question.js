var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var QuestionSchema = new Schema({
   content: {type: String },
   type:{type:String},
   answers:[AnswerSchema],
   status:{type: Boolean,default:true},
   weight:{type: Number, default: 0 },
   create_at: {type:Date,default: Date.now}
});

mongoose.model('Question', QuestionSchema);

var AnswerSchema = new Schema({
    question_id:{type:ObjectId},
    content:{type: String },
    create_at: {type:Date,default: Date.now}
});

mongoose.model('Answer', AnswerSchema);



var Photo_GuessSchema1 = new Schema({
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
    major:{type:String},
    demand:{type:String},
    grade:{type:String},
    transform:{type: Number, default: 0 },
	type:{type:String, default:"photo_guess"},
    price:{type:String},
    create_at: {type:Date,default: Date.now}
});


mongoose.model('Photo_Guess1', Photo_GuessSchema1);

var Photo_Guess_WgateidSchema = new Schema({
    photo_guess_id:{type:ObjectId},
    wgateid:{type:String },
    pass:{type: Boolean,default:false}
});
mongoose.model('Photo_Guess_Wgateid', Photo_Guess_WgateidSchema);
//photo_guess
//
//photo_url:图片的地址
//questions：选择密保问题，可以选择多个
//introduction：介绍自己
//nickname：昵称
//sex:
//    school：来自哪个学校
//wx_account:
//    wx_open_count:
