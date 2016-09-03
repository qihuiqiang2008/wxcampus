var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FilterWordSchema = new Schema({
  word: { type: String },
    desc: { type: String },
  create_at: { type: Date, default: Date.now }
});
mongoose.model('FilterWord',FilterWordSchema);
