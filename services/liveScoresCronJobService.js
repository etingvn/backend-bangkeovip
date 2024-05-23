const LiveScores = require('../models/livescoresModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');

class LiveScoresCronJobService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    liveScoresCronJob = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;

        const optionsISportLiveScores = {
            method: 'GET',
            url: 'http://api.isportsapi.com/sport/football/livescores/changes',
            params: {
                api_key: 'OmglezmZnzTkNqzJ',
            }
        };

        const someAsyncFunction = async (item, realtime) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
            const dynamicDocument = new LiveScores({ realtime: realtime, data: item });
            await dynamicDocument.save();
            console.log(`Processed item: ${item}`);
        };

        const processArray = async (array) => {
            for (const item of array) {
                await someAsyncFunction(item, queryObject.realtime);
            }
            console.log('process: success');
        };

        try {
            // Check amountCountDb ở MongoDB
            const amountCountDb = await LiveScores.countDocuments(query).exec();
            if (amountCountDb === 0) {
                // Gọi API ISport
                const response = await axios.request(optionsISportLiveScores);
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
                let documents = await LiveScores.find(query);
                await documents.forEach((doc, index) => {
                    // Chuyển đổi document thành chuỗi JSON
                    const jsonString = JSON.stringify(doc.data);
                    // Lưu chuỗi JSON vào Redis với key là index
                    redis.set(`LiveScores:${queryObject.realtime}:${index}`, jsonString, (err) => {
                        if (err) {
                            console.error('Error saving document to Redis:', err);
                        } else {
                            console.log(`Document ${index} saved to Redis`);
                        }
                    });
                });

            } else {
                // Set data từ database MongoDB vào Cache Redis
                let documents = await LiveScores.find(query);
                await documents.forEach((doc, index) => {
                    // Chuyển đổi document thành chuỗi JSON
                    const jsonString = JSON.stringify(doc.data);
                    // Lưu chuỗi JSON vào Redis với key là index
                    redis.set(`LiveScores:${queryObject.realtime}:${index}`, jsonString, (err) => {
                        if (err) {
                            console.error('Error saving document to Redis:', err);
                        } else {
                            console.log(`Document ${index} saved to Redis`);
                        }
                    });
                });
            }
        await redis.quit();
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = LiveScoresCronJobService;
