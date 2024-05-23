const cron = require('node-cron');
const LiveScores = require('./models/livescoresModel');
const LiveOdds = require('./models/liveoddsModel');
const Events = require('./models/eventsModel');
const Statistics = require('./models/statisticsModel');
const LiveScoresCronJobService = require('./services/liveScoresCronJobService');
const LiveOddsCronJobService = require('./services/liveOddsCronJobService');
const EventsCronJobService = require('./services/eventsCronJobService');
const StatisticsCronJobService = require('./services/statisticsCronJobService');
const Redis = require('ioredis');
const { format, addDays, subDays } = require('date-fns');

const liveScoresCronJobService = new LiveScoresCronJobService();
const liveOddsCronJobService = new LiveOddsCronJobService();
const eventsCronJobService = new EventsCronJobService();
const statisticsCronJobService = new StatisticsCronJobService();
const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

async function runCronJob20Seconds() { 
    cron.schedule('*/10 * * * * *', async () => {
        console.log('RunCronJob20Seconds job running...');
        const formattedCurrentDate = format(new Date(), 'yyyy-MM-dd');

        // Cron job for LiveScores
        // Empty key in Redis
        const KeyLiveScores = await redis.keys(`LiveScores:realtime:*`);
        if (KeyLiveScores.length !== 0) await redis.del(...KeyLiveScores);     
                
        // Empty collection in MongoDB
        await LiveScores.collection.drop();      

        try {
            await liveScoresCronJobService.liveScoresCronJob({realtime: 'realtime'});
            console.log({ status: 'success' });
        } catch (error) {
            console.log({ status: [] });
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // // Cron job for LiveOdds
        // Empty key in Redis
        const KeyLiveOdds = await redis.keys(`LiveOdds:realtime:*`);
        if (KeyLiveOdds.length !== 0) await redis.del(...KeyLiveOdds);     
                
        // Empty collection in MongoDB
        await LiveOdds.collection.drop();      

        try {
            await liveOddsCronJobService.liveOddsCronJob({realtime: 'realtime'});
            console.log({ status: 'success' });
        } catch (error) {
            console.log({ status: [] });
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Cron job for Events
        // Empty key in Redis
        const keyListEvents = await redis.keys(`Events:*`);
        if (keyListEvents.length !== 0) await redis.del(...keyListEvents);     
                
        // Empty collection in MongoDB
        await Events.collection.drop();

        try {
            await eventsCronJobService.eventsCronJob({realtime: 'realtime'});
            console.log({ status: 'success' });
        } catch (error) {
            console.log({ status: [] });
        }

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Cron job for Statistics
        // Empty key in Redis
        const keyListStatistics = await redis.keys(`Statistics:realtime:*`);
        if (keyListStatistics.length !== 0) await redis.del(...keyListStatistics);     
                
        // Empty collection in MongoDB
        await Statistics.collection.drop();

        try {
            await statisticsCronJobService.statisticsCronJob({realtime: 'realtime'});
            console.log({ status: 'success' });
        } catch (error) {
            console.log({ status: [] });
        }

        await redis.quit();

    });
}

module.exports = runCronJob20Seconds;