const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({
  date: { type: mongoose.Schema.Types.Mixed },
  data: { type: mongoose.Schema.Types.Mixed }
  
});
const Fixturesallbydate = mongoose.model('Fixturesallbydate', dynamicSchema);
module.exports = Fixturesallbydate;