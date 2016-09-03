var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GroupSchema = new Schema({
  id: {type: Number, default: 0},
  name: { type: String },
  last_edit_at: { type: Date, default: Date.now },
  create_at: { type: Date, default: Date.now }
});
mongoose.model('Group',GroupSchema);
