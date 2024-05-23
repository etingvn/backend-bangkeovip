const Statistics = require('../models/statisticsModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');

class StatisticsCronJobService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    statisticsCronJob = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;

        const someAsyncFunction = async (item) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
            const dynamicDocument = new Statistics({ realtime: 'realtime', data: item});
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
            const optionsISportStatistics = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/stats',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                }
            };
    
            // Cooking data từ các api
            const response = await axios.request(optionsISportStatistics);
            // Setup mảng các phần tử
            const responseArray = response.data.data;
            // Gọi hàm processArray với mảng responseArray
            await processArray(responseArray)
            .then(() => {
                console.log('All items processed');
            })
            .catch((error) => {
                console.error('Error:', error);
            }); 

            // Set data từ database MongoDB vào Cache Redis
            let documents = await Statistics.find(query);
            await documents.forEach((doc, index) => {
                // Chuyển đổi document thành chuỗi JSON
                const jsonString = JSON.stringify(doc.data);
                // Lưu chuỗi JSON vào Redis với key là index
                redis.set(`Statistics:realtime:${index}`, jsonString, (err) => {
                    if (err) {
                        console.error('Error saving document to Redis:', err);
                    } else {
                        console.log(`Document ${index} saved to Redis`);
                    }
                });
            });
            console.log(`SUCCESS all saved to Redis`);
            await redis.quit();
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = StatisticsCronJobService;
