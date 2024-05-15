const Events = require('../models/eventsModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');

class EventsService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    events = async (query) => {
        const redis = new Redis({ host: 'redis', port: 6379 });
        const queryObject = query;

        const optionsISportEvents = {
            method: 'GET',
            url: 'http://api.isportsapi.com/sport/football/events',
            params: {
                api_key: 'OmglezmZnzTkNqzJ',
                matchId: queryObject.matchId,

            }
        };

        const someAsyncFunction = async (item, matchId) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
            const dynamicDocument = new Events({ matchId: matchId, data: item});
            await dynamicDocument.save();
            console.log(`Processed item: ${item}`);
        };

        const processArray = async (array) => {
            for (const item of array) {
                await someAsyncFunction(item, queryObject.matchId);
            }
            console.log('process: success');
        };

        try {

            const query = { 'matchId': queryObject.matchId };
            const keysCache = await redis.keys(`Events:${queryObject.matchId}:*`);
            if (keysCache.length === 0) {
                // Check amountCountDb ở MongoDB
                const amountCountDb = await Events.countDocuments(query).exec();
                if (amountCountDb === 0) {
                    const response = await axios.request(optionsISportEvents);
                    // Setup mảng các phần tử
                    const responseArray = response.data.data;
                    responseArray.parameters = { matchId: 'current' };
                    // Gọi hàm processArray với mảng responseArray
                    await processArray(responseArray)
                    .then(() => {
                        console.log('All items processed');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    }); 

                    // Set data từ database MongoDB vào Cache Redis
                    let documents = await Events.find(query);
                    await documents.forEach((doc, index) => {
                        // Chuyển đổi document thành chuỗi JSON
                        const jsonString = JSON.stringify(doc.data);
                        // Lưu chuỗi JSON vào Redis với key là index
                        redis.set(`Events:${queryObject.matchId}:${index}`, jsonString, (err) => {
                            if (err) {
                                console.error('Error saving document to Redis:', err);
                            } else {
                                console.log(`Document ${index} saved to Redis`);
                            }
                        });
                    });

                    // Gọi data từ cache Redis
                    const keyList = await redis.keys(`Events:${queryObject.matchId}:*`);
                    const valueList = (keyList.length === 0) ? [] : await redis.mget(...keyList);
                    return valueList;        
                } else {
                    // Set data từ database MongoDB vào Cache Redis
                    let documents = await Events.find(query);
                    await documents.forEach((doc, index) => {
                        // Chuyển đổi document thành chuỗi JSON
                        const jsonString = JSON.stringify(doc.data);
                        // Lưu chuỗi JSON vào Redis với key là index
                        redis.set(`Events:${queryObject.matchId}:${index}`, jsonString, (err) => {
                            if (err) {
                                console.error('Error saving document to Redis:', err);
                            } else {
                                console.log(`Document ${index} saved to Redis`);
                            }
                        });
                    });

                    // Gọi data từ cache Redis
                    const keyList = await redis.keys(`Events:${queryObject.matchId}:*`);
                    const valueList = (keyList.length === 0) ? [] : await redis.mget(...keyList);
                    return valueList;        
                }
            } else {
                // Gọi data từ cache Redis 
                const valueList = await redis.mget(...keysCache);
                return valueList;
            }
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = EventsService;
