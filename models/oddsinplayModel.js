const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({
  parameters: { type: mongoose.Schema.Types.Mixed },
  data: { type: mongoose.Schema.Types.Mixed }
  
});
const Oddsinplay = mongoose.model('Oddsinplay', dynamicSchema);
module.exports = Oddsinplay;