const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const runCronJobOneDay = require('./runCronJobOneDay');
const runCronJob20Seconds = require('./runCronJob20Seconds');
const userRoutes = require('./routes/userRoutes');
const fixtureheadtoheadRoutes = require('./routes/fixtureheadtoheadRoutes');
const fixturesallbydateRoutes = require('./routes/fixturesallbydateRoutes');
const leaguestandingRoutes = require('./routes/leaguestandingRoutes');
const eventsRoutes = require('./routes/eventsRoutes');
const FixturesHeadToHeadService = require('./services/fixturesHeadToHeadService');
const FixturesByDateService = require('./services/fixturesByDateService');
const LeagueStandingService = require('./services/leagueStandingService');
const LeaguesBySeasonService = require('./services/leaguesBySeasonService');
const FixturesLineUpsService = require('./services/fixturesLineUpsService');
const OddsByDateService = require('./services/oddsByDateService');
const PlayersStatisticsByFixtureIdService = require('./services/playersStatisticsByFixtureIdService');
const OddsInPlayService = require('./services/oddsInPlayService');
const FixturesAllByDateService = require('./services/fixturesAllByDateService');
const LiveOddsService = require('./services/liveOddsService');
const EventsService = require('./services/eventsService');
const StatisticsService = require('./services/statisticsService');
const LiveScoresService = require('./services/liveScoresService');


const WebSocket = require('ws');

// Khởi tạo server WebSocket với gioi hạn kích thước payload là 500MB 
const wss = new WebSocket.Server({ port: 8080, maxPayload: 500 * 1024 * 1024 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  const fixturesHeadToHeadService = new FixturesHeadToHeadService();
  const fixturesByDateService = new FixturesByDateService();
  const leaguesBySeasonService = new LeaguesBySeasonService();
  const fixturesLineUpsService = new FixturesLineUpsService();
  const oddsByDateService = new OddsByDateService();
  const playersStatisticsByFixtureIdService = new PlayersStatisticsByFixtureIdService();
  const fixturesAllByDateService = new FixturesAllByDateService();
  const leagueStandingService = new LeagueStandingService();
  const liveOddsService = new LiveOddsService();
  const eventsService = new EventsService();
  const statisticsService = new StatisticsService();
  const livescoresService = new LiveScoresService();

  ws.on('message', async (message) => {
    setInterval(async () => {
      try {
        // Parse thông điệp nhận được từ client
        const data = JSON.parse(message);
        // Kiểm tra xem thông điệp có chứa các tham số cần thiết không
        switch (data.routes) {
          case 'fixtures-head-to-head':
            const fixturesHeadToHeads = await fixturesHeadToHeadService.fixturesHeadToHead(data.params);
            ws.send(JSON.stringify(fixturesHeadToHeads));
            break;
          case 'fixtures-by-date':
            const fixturesByDate = await fixturesByDateService.fixturesByDate(data.params);
            ws.send(JSON.stringify(fixturesByDate));
            break;
          // case 'fixtures-all-by-date':
          //   const fixturesAllByDate = await fixturesAllByDateService.fixturesAllByDate(data.params);
          //   ws.send(JSON.stringify(fixturesAllByDate));
          //   break;
          case 'leagues-by-season':
            const leaguesBySeason = await leaguesBySeasonService.leaguesBySeason(data.params);
            ws.send(JSON.stringify(leaguesBySeason));
            break;
          case 'fixtures-line-ups':
            const fixturesLineUps = await fixturesLineUpsService.fixturesLineUps(data.params);
            ws.send(JSON.stringify(fixturesLineUps));
            break;
          case 'odds-by-date':
            const oddsByDate = await oddsByDateService.oddsByDate(data.params);
            ws.send(JSON.stringify(oddsByDate));
            break;
          case 'players-statistics-by-fixture-id':
            const playersStatisticsByFixtureId = await playersStatisticsByFixtureIdService.playersStatisticsByFixtureId(data.params);
            ws.send(JSON.stringify(playersStatisticsByFixtureId));
            break;
          case 'odds-in-play':
            const oddsInPlay = await oddsInPlayService.oddsInPlay(data.params);
            ws.send(JSON.stringify(oddsInPlay));
            break;
          case 'live-odds':
            const liveOdds = await liveOddsService.liveOdds(data.params);
            ws.send(JSON.stringify(liveOdds));
            break;
          case 'events':
            const events = await eventsService.events(data.params);           
            ws.send(JSON.stringify(events));
            break; 

          case 'statistics':
            const statistics = await statisticsService.statistics(data.params);  
            ws.send(JSON.stringify(statistics));         
            break;       
        
          case 'livescores':
            const livescores = await livescoresService.liveScores(data.params);
            ws.send(JSON.stringify(livescores));
            break; 
          default:
            ws.send(JSON.stringify({ error: 'Not found routing' }));
        }
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error:', error);
        ws.send(JSON.stringify({ error: 'Internal server error' }));
    }
}, 10000);
  });

});

// Kết nối tới MongoDB
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || 27017
const dbName = process.env.DB_NAME || 'amplifier-data-bangkeo'
const mongoUrl = `mongodb://${dbHost}:${dbPort}/${dbName}`
mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoCreate: true
});

// Kết nối tới Express
const app = express();

// Middleware tự định nghĩa để thiết lập giới hạn kích thước payload response
const limitResponseSize = (req, res, next) => {
  const limit = '500mb'; // 500MB
  res.setHeader('Content-Length', limit);
  res.setHeader('Access-Control-Allow-Origin', '*');

  // res.setHeader('Connection', 'close');
  next();
}

// Sử dụng middleware limitResponseSize cho tất cả các yêu cầu
app.use(limitResponseSize); 
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));
  
  // Sử dụng routes
  app.use('/users', userRoutes);
  app.use('/fixtures-head-to-head', fixtureheadtoheadRoutes);
  app.use('/fixtures-all-by-date', fixturesallbydateRoutes);
  app.use('/league-standing', leaguestandingRoutes);
  // app.use('/events', eventsRoutes);
  
  
  // Sử dụng cronJob
  runCronJobOneDay();
  runCronJob20Seconds();

module.exports = app