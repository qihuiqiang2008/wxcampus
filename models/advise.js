var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

/*
 * type:
 * reply: xx 回复了你的话题
 * reply2: xx 在话题中回复了你
 * follow: xx 关注了你
 * at: xx ＠了你
 */

var AdviseSchema = new Schema({
    from_user:{
        _id:{type: ObjectId },
        sex:{ type: String},
        name:{type: String},
        school_id:{type: ObjectId },
        school_name:{type:String },
        region_code:{type:String},
        belong_group:{type: Number, default: 0}
    },
    content: { type: String },
    is_reply: {type: Boolean, default: false },
    create_at: { type: Date, default: Date.now }

});

AdviseSchema.index({create_at: -1});

mongoose.model('Advise', AdviseSchema);
