const LiveOdds = require('../models/liveoddsModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');

class LiveOddsService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    liveOdds = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;
        
        try {
            // Gọi data từ cache Redis
            const keyList = await redis.keys(`LiveOdds:realtime:*`);
            const valueList = await redis.mget(...keyList);            
            let LiveOddsCache = JSON.parse(valueList[0]);
            const handicapTmp = [];
            const europeOddsTmp = [];
            const overUnderTmp = [];
            const handicapHalfTmp = [];
            const overUnderHalfTmp = [];
            for (const item of LiveOddsCache.handicap) {
                let itemCheck = item;
                if (parseInt(itemCheck.split(',')[0]) === parseInt(queryObject.matchId)) handicapTmp.push(item);                  
            }
            for (const item of LiveOddsCache.europeOdds) {
                let itemCheck = item;
                if (parseInt(itemCheck.split(',')[0]) === parseInt(queryObject.matchId)) europeOddsTmp.push(item);                  
            }
            for (const item of LiveOddsCache.overUnder) {
                let itemCheck = item;
                if (parseInt(itemCheck.split(',')[0]) === parseInt(queryObject.matchId)) overUnderTmp.push(item);                  
            }
            for (const item of LiveOddsCache.handicapHalf) {
                let itemCheck = item;
                if (parseInt(itemCheck.split(',')[0]) === parseInt(queryObject.matchId)) handicapHalfTmp.push(item);                  
            }
            for (const item of LiveOddsCache.overUnderHalf) {
                let itemCheck = item;
                if (parseInt(itemCheck.split(',')[0]) === parseInt(queryObject.matchId)) overUnderHalfTmp.push(item);                  
            }
            const result = {
                handicapTmp,
                europeOddsTmp,
                overUnderTmp,
                handicapHalfTmp,
                overUnderHalfTmp,       
            }
            await redis.quit();

            return result;            
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = LiveOddsService;
