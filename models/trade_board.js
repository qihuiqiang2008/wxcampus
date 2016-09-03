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

    var TradeBoardSchema = new Schema({
        from_user:{
            _id:{type: ObjectId },
            sex:{ type: String},
            name:{type: String},
            school_id:{type: ObjectId },
            school_name:{type:String },
            region_code:{type:String}
        },
        type:{ type: String },
        title:{ type: String },
        content: { type: String },
        price:{ type: String },
        contact_type:{type:String},
        contact: { type: String },
        contact_person: { type: String },
        trade_address:{ type: String },
        show_condition: {type: String},
        status:{type:String},
        create_at: { type: Date, default: Date.now }
    });

TradeBoardSchema.index({create_at: -1});

mongoose.model('TradeBoard', TradeBoardSchema);