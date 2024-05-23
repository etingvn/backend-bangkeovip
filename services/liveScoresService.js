const LiveScores = require('../models/livescoresModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');

class LiveScoresService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    liveScores = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;

        try {
            // Gọi data từ cache Redis
            const keyList = await redis.keys(`LiveScores:realtime:*`);
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

module.exports = LiveScoresService;