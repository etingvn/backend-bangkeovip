const cron = require('node-cron');
const Fixturesallbydate = require('./models/fixturesallbydateModel');
const LeagueStanding = require('./models/leaguestandingModel');
const FixturesAllByDateCronJobService = require('./services/fixturesAllByDateCronJobService');
const LeagueStandingCronJobService = require('./services/leagueStandingCronJobService');

const Redis = require('ioredis');
const { format, addDays, subDays } = require('date-fns');

const fixturesAllByDateCronJobService = new FixturesAllByDateCronJobService();
const leagueStandingCronJobService = new LeagueStandingCronJobService();
const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });

async function runCronJobOneDay() { 
    // cron.schedule('*/5 * * * *', async () => {
        console.log('RunCronJobOneDay job running...');
        // Chọn danh sách 7 ngày: bao gồm 3 ngày trước, ngày hiện tại, ba ngày sau
        const currentDate = new Date();
        const formattedSixDaysAgo = format(subDays(currentDate, 6), 'yyyy-MM-dd');
        const formattedFiveDaysAgo = format(subDays(currentDate, 5), 'yyyy-MM-dd');
        const formattedFourDaysAgo = format(subDays(currentDate, 4), 'yyyy-MM-dd');
        const formattedThreeDaysAgo = format(subDays(currentDate, 3), 'yyyy-MM-dd');
        const formattedTwoDaysAgo = format(subDays(currentDate, 2), 'yyyy-MM-dd');
        const formattedOneDaysAgo = format(subDays(currentDate, 1), 'yyyy-MM-dd');
        const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');
        const formattedOneDaysLater = format(addDays(currentDate, 1), 'yyyy-MM-dd');
        const formattedTwoDaysLater = format(addDays(currentDate, 2), 'yyyy-MM-dd');
        const formattedThreeDaysLater = format(addDays(currentDate, 3), 'yyyy-MM-dd');
        const formattedFourDaysLater = format(addDays(currentDate, 4), 'yyyy-MM-dd');
        const formattedFiveDaysLater = format(addDays(currentDate, 5), 'yyyy-MM-dd');
        const listDays = [formattedFiveDaysAgo, formattedFourDaysAgo, formattedThreeDaysAgo, formattedTwoDaysAgo, formattedOneDaysAgo, formattedCurrentDate, formattedOneDaysLater, formattedTwoDaysLater, formattedThreeDaysLater, formattedFourDaysLater, formattedFiveDaysLater];
        // const listDays = ['2024-05-19'];
        
        // Cron job for Fixtures
        // // Empty key in Redis
        // const keyListFixtures = await redis.keys(`Fixturesallbydate:${formattedSixDaysAgo}:*`);
        // if (keyListFixtures.length !== 0) await redis.del(...keyListFixtures);     
                
        // // Empty collection in MongoDB
        // await Fixturesallbydate.deleteMany({ 'date': formattedSixDaysAgo });



        // Empty key in Redis
        const keyListFixtures = await redis.keys(`Fixturesallbydate:*`);
        if (keyListFixtures.length !== 0) await redis.del(...keyListFixtures);     
                
        // Empty collection in MongoDB
        await Fixturesallbydate.collection.drop();
        
        try {
            for (const item of listDays) {
                const checkDate = await Fixturesallbydate.find({ 'date': item });
                if (checkDate.length === 0) {
                    await fixturesAllByDateCronJobService.fixturesAllByDateCronJob({date: item});
                    console.log('scraping data:', item);
                }
            }
            console.log({ status: 'success' });
        } catch (error) {
            console.log({ status: [] });
        }
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        // Cron job for LeagueStanding
        // Empty key in Redis
        const keyListLeagueStanding = await redis.keys(`LeagueStanding:league:*`);
        if (keyListLeagueStanding.length !== 0) await redis.del(...keyListLeagueStanding);     
                
        // Empty collection in MongoDB
        await LeagueStanding.collection.drop();

        try {
            await leagueStandingCronJobService.leagueStandingCronJob();
            console.log({ status: 'success' });
        } catch (error) {
            console.log({ status: [] });
        }

        await redis.quit();


    // });
}

module.exports = runCronJobOneDay;