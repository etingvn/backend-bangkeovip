const LeagueStanding = require('../models/leaguestandingModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const { format, addDays, subDays } = require('date-fns');

class LeagueStandingService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
        
    }

    leagueStanding = async (query) => {

        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;
        const formattedCurrentDate = format(new Date(), 'yyyy-MM-dd');


        try {
            // Gọi data từ cache Redis
            const keyList = await redis.keys(`LeagueStanding:league:*`);
            const valueList = await redis.mget(...keyList);
            

            const result = [];
            for (const item of valueList) {
                if (item !== '[]') {
                    let itemCheck = JSON.parse(item);
                    if (parseInt(itemCheck.leagueInfo.leagueId) === parseInt(queryObject.leagueId)) result.push(item);                  
                }
            }
            await redis.quit();
            return result;                        
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = LeagueStandingService;
