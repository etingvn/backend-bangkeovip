const Fixturesallbydate = require('../models/fixturesallbydateModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const { format, addDays, subDays } = require('date-fns');

class FixturesAllByDateService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
        
    }

    fixturesAllByDate = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;

        try {

            const query = { 'date': queryObject.date };
            // Check ngày yêu cầu có thuộc trong danh sách hay không
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
                if (!listDays.includes(queryObject.date)) return [];

            // Gọi data từ cache Redis
            const keyList = await redis.keys(`Fixturesallbydate:${queryObject.date}:*`);
            const valueList = await (keyList.length === 0) ? [] : redis.mget(...keyList);
            await redis.quit();
            return valueList; 
            
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = FixturesAllByDateService;
