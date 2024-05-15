const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({
  parameters: { type: mongoose.Schema.Types.Mixed },
  data: { type: mongoose.Schema.Types.Mixed }
  
});
const Oddsbydate = mongoose.model('Oddsbydate', dynamicSchema);
module.exports = Oddsbydate;