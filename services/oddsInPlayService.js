const OddsInPlay = require('../models/oddsinplayModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');

class OddsInPlayService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
    }

    oddsInPlay = async (query) => {
        const redis = new Redis({ host: 'redis', port: 6379 });
        const queryObject = query;
        const optionsRapidApi = {
            method: 'GET',
            url: 'https://api-football-v1.p.rapidapi.com/v3/odds/live',
            headers: {
              'X-RapidAPI-Key': 'f45e0174f2msh76696817c621236p19205bjsn24960a74e256',
              'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
            }
        };

        const optionsISport = {
            method: 'GET',
            url: 'http://api.isportsapi.com/sport/football/livescores',
            params: {api_key: 'OmglezmZnzTkNqzJ'}
        };
        
        const someAsyncFunction = async (item, parameters) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
            const dynamicDocument = new OddsInPlay({ parameters: parameters, data: item});
            await dynamicDocument.save();
            console.log(`Processed item: ${item}`);
        };

        const processArray = async (array) => {
            for (const item of array.response) {
                await someAsyncFunction(item, array.parameters);
            }
            console.log('process: success');
        };

        try {

            const query = { 'parameters.date': queryObject.date };
            const keysCache = await redis.keys(`OddsInPlay:${queryObject.date}:*`);
            if (keysCache.length === 0) {
                // Check amountCountDb ở MongoDB
                const amountCountDb = await OddsInPlay.countDocuments(query).exec();
                if (amountCountDb === 0) {
                    const response = await axios.request(optionsRapidApi);
                    // Setup mảng các phần tử
                    const responseArray = response.data;
                    responseArray.parameters = { date: 'current' };
                    console.log('kkkkkk ', responseArray.length);
                    // Gọi hàm processArray với mảng responseArray
                    await processArray(responseArray)
                    .then(() => {
                        console.log('All items processed');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    }); 

                    // Set data từ database MongoDB vào Cache Redis
                    let documents = await OddsInPlay.find(query);
                    await documents.forEach((doc, index) => {
                        // Chuyển đổi document thành chuỗi JSON
                        const jsonString = JSON.stringify(doc.data);
                        // Lưu chuỗi JSON vào Redis với key là index
                        redis.set(`OddsInPlay:${queryObject.date}:${index}`, jsonString, (err) => {
                            if (err) {
                                console.error('Error saving document to Redis:', err);
                            } else {
                                console.log(`Document ${index} saved to Redis`);
                            }
                        });
                    });

                    // Gọi data từ cache Redis
                    const keyList = await redis.keys(`OddsInPlay:${queryObject.date}:*`);
                    const valueList = (keyList.length === 0) ? [] : await redis.mget(...keyList);
                    return valueList;        
                } else {
                    // Set data từ database MongoDB vào Cache Redis
                    let documents = await OddsInPlay.find(query);
                    await documents.forEach((doc, index) => {
                        // Chuyển đổi document thành chuỗi JSON
                        const jsonString = JSON.stringify(doc.data);
                        // Lưu chuỗi JSON vào Redis với key là index
                        redis.set(`OddsInPlay:${queryObject.date}:${index}`, jsonString, (err) => {
                            if (err) {
                                console.error('Error saving document to Redis:', err);
                            } else {
                                console.log(`Document ${index} saved to Redis`);
                            }
                        });
                    });

                    // Gọi data từ cache Redis
                    const keyList = await redis.keys(`OddsInPlay:${queryObject.date}:*`);
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

module.exports = OddsInPlayService;