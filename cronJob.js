const cron = require('node-cron');

function runCronJob() { 
    cron.schedule('* * * * *', async () => {
        // Do something ...
    });
}

module.exports = runCronJob;