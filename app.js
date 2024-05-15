const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const runCronJob = require('./cronJob');
const userRoutes = require('./routes/userRoutes');
const fixtureheadtoheadRoutes = require('./routes/fixtureheadtoheadRoutes');
const FixturesHeadToHeadService = require('./services/fixturesHeadToHeadService');
const FixturesByDateService = require('./services/fixturesByDateService');
const LeaguesBySeasonService = require('./services/leaguesBySeasonService');
const FixturesLineUpsService = require('./services/fixturesLineUpsService');
const OddsByDateService = require('./services/oddsByDateService');
const PlayersStatisticsByFixtureIdService = require('./services/playersStatisticsByFixtureIdService');
const OddsInPlayService = require('./services/oddsInPlayService');
const FixturesAllByDateService = require('./services/fixturesAllByDateService');
const InPlayOddsService = require('./services/inPlayOddsService');
const EventsService = require('./services/eventsService');

const WebSocket = require('ws');

// Khởi tạo server WebSocket
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connected');
  const fixturesHeadToHeadService = new FixturesHeadToHeadService();
  const fixturesByDateService = new FixturesByDateService();
  const leaguesBySeasonService = new LeaguesBySeasonService();
  const fixturesLineUpsService = new FixturesLineUpsService();
  const oddsByDateService = new OddsByDateService();
  const playersStatisticsByFixtureIdService = new PlayersStatisticsByFixtureIdService();
  const oddsInPlayService = new OddsInPlayService();
  const fixturesAllByDateService = new FixturesAllByDateService();
  const inPlayOddsService = new InPlayOddsService();
  const eventsService = new EventsService();

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
          case 'fixtures-all-by-date':
            const fixturesAllByDate = await fixturesAllByDateService.fixturesAllByDate(data.params);
            ws.send(JSON.stringify(fixturesAllByDate));
            break;
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

          case 'in-play-odds':
            const inPlayOdds = await inPlayOddsService.inPlayOdds(data.params);
            ws.send(JSON.stringify(inPlayOdds));
            break;

          case 'events':
            const events = await eventsService.events(data.params);
            ws.send(JSON.stringify(events));
            break;
  
          default:
            ws.send(JSON.stringify({ error: 'Not found routing' }));
        }
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Error:', error);
        ws.send(JSON.stringify({ error: 'Internal server error' }));
    }
}, 2000);
  });

  ws.on('close', () => {
      console.log('Client disconnected');
  });
});

const app = express();
const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = process.env.DB_PORT || 27017
const dbName = process.env.DB_NAME || 'amplifier-data-bangkeo'
const mongoUrl = `mongodb://${dbHost}:${dbPort}/${dbName}`

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoCreate: true
  });

  app.use(bodyParser.json());
  app.use(cors());
  
  // Sử dụng routes
  app.use('/users', userRoutes);
  app.use('/fixtureheadtohead', fixtureheadtoheadRoutes);
  
  // Sử dụng cronJob
  runCronJob();

module.exports = app