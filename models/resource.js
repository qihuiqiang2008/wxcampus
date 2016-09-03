var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResourceSchema = new Schema({
  belong_group: {type: Number, default: 0},
  create_at: { type: Date, default: Date.now },
  content:{ type: String }
});
mongoose.model('Resource',ResourceSchema);
