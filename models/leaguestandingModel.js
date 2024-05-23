const mongoose = require('mongoose');

const dynamicSchema = new mongoose.Schema({
  league: { type: mongoose.Schema.Types.Mixed },
  data: { type: mongoose.Schema.Types.Mixed }
  
});
const Leaguestanding = mongoose.model('Leaguestanding', dynamicSchema);
module.exports = Leaguestanding;