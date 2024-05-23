const LiveOdds = require('../models/liveoddsModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');

class LiveOddsCronJobService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    liveOddsCronJob = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;

        const optionsISportLiveOdds = {
            method: 'GET',
            url: 'http://api.isportsapi.com/sport/football/odds/main/changes',
            params: {
                api_key: 'OmglezmZnzTkNqzJ',
            }
        };
    
        const someAsyncFunction = async (item, realtime) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
            const dynamicDocument = new LiveOdds({ realtime: realtime, data: item});
            await dynamicDocument.save();
            console.log(`Processed item: ${item}`);
        };

        const processArray = async (array) => {
            for (const item of array) {
                await someAsyncFunction(item, queryObject.realtime);
            }
            console.log('process: success');
        };

        // Empty key in Redis
        const keyListR = await redis.keys(`LiveOdds:realtime:*`);
        if (keyListR.length !== 0) await redis.del(...keyListR);     
                
        // Empty collection in MongoDB
        await LiveOdds.collection.drop();
        
        try {
            const query = { 'realtime': queryObject.realtime };
            // Check amountCountDb ở MongoDB
            const amountCountDb = await LiveOdds.countDocuments(query).exec();
            if (amountCountDb === 0) {
                // Gọi API ISportLiveOdds
                const response = await axios.request(optionsISportLiveOdds);
                // Setup mảng các phần tử
                const responseArray = [response.data.data];
                // Gọi hàm processArray với mảng responseArray
                await processArray(responseArray)
                .then(() => {
                    console.log('All items processed');
                })
                .catch((error) => {
                    console.error('Error:', error);
                }); 

                // Set data từ database MongoDB vào Cache Redis
                let documents = await LiveOdds.find(query);
                await documents.forEach((doc, index) => {
                    // Chuyển đổi document thành chuỗi JSON
                    const jsonString = JSON.stringify(doc.data);
                    // Lưu chuỗi JSON vào Redis với key là index
                    redis.set(`LiveOdds:${queryObject.realtime}:${index}`, jsonString, (err) => {
                        if (err) {
                            console.error('Error saving document to Redis:', err);
                        } else {
                            console.log(`Document ${index} saved to Redis`);
                        }
                    });
                });
            } else {
                // Set data từ database MongoDB vào Cache Redis
                let documents = await LiveOdds.find(query);
                await documents.forEach((doc, index) => {
                    // Chuyển đổi document thành chuỗi JSON
                    const jsonString = JSON.stringify(doc.data);
                    // Lưu chuỗi JSON vào Redis với key là index
                    redis.set(`LiveOdds:realtime:${index}`, jsonString, (err) => {
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

module.exports = LiveOddsCronJobService;
