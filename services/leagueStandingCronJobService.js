const LeagueStanding = require('../models/leaguestandingModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const { format, addDays, subDays } = require('date-fns');

class LeagueStandingCronJobService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
        
    }

    leagueStandingCronJob = async () => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const optionalLeagues = ['13014', '1099', '1639', '1437', '1134', '188', '1112'];
        const someAsyncFunction = async (item, date) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
            const optionsISportLeagueStanding = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/standing/league',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    leagueId: item,
                }
            };
            const responseISportLeagueStanding = await axios.request(optionsISportLeagueStanding);
            const dataLeagueStanding = (responseISportLeagueStanding.data.hasOwnProperty('data')) ? await responseISportLeagueStanding.data.data : [];
            const dynamicDocument = await new LeagueStanding({ league: item, data: dataLeagueStanding});            
            await dynamicDocument.save();
            console.log(`Processed item: ${item}`);
        };

        const processArray = async (array) => {
            for (const item of array) {
                await someAsyncFunction(item);
            }
            console.log('process: success');
        };

        try {
            // Cooking data từ các api 
            // Setup mảng các phần tử
            const responseArray = optionalLeagues;
            // Gọi hàm processArray với mảng responseArray
            await processArray(responseArray)
            .then(() => {
                console.log('All items processed');
            })
            .catch((error) => {
                console.error('Error:', error);
            });
            // Set data từ database MongoDB vào Cache Redis
            let documents = await LeagueStanding.find({league: { $in: optionalLeagues }});
            await documents.forEach((doc, index) => {
                // Chuyển đổi document thành chuỗi JSON
                const jsonString = JSON.stringify(doc.data);
                // Lưu chuỗi JSON vào Redis với key là index
                redis.set(`LeagueStanding:league:${index}`, jsonString, (err) => {
                    if (err) {
                        console.error('Error saving document to Redis:', err);
                    } else {
                        console.log(`Document ${index} saved to Redis`);
                    }
                });
            });
            await redis.quit();
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = LeagueStandingCronJobService;
