const Events = require('../models/eventsModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');
const { format, addDays, subDays } = require('date-fns');

class EventsService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    events = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;
        const currentDate = new Date();
        const formattedCurrentDate = format(currentDate, 'yyyy-MM-dd');

        try {
            // Gọi data từ cache Redis
            const keyList = await redis.keys(`Events:realtime:*`);
            const valueList = await redis.mget(...keyList);
            const result = [];
            for (const item of valueList) {
                let itemCheck = JSON.parse(item);
                if (parseInt(itemCheck.matchId) === parseInt(queryObject.matchId)) result.push(itemCheck);                  
            }
            await redis.quit();
            return result;            
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = EventsService;
