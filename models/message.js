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

var MessageSchema = new Schema({
    from_user:{
        _id:{type:ObjectId},
        sex:{ type: String},
        name:{type: String}
    },
    content: { type: String },
    ref_content:{type:String},
    to_user:{
        _id:{type:ObjectId},
        sex:{ type: String},
        name:{type: String}
    },
    to_user_read: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now }
});

MessageSchema.index({create_at: -1});

mongoose.model('Message', MessageSchema);
