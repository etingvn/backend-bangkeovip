const Fixturesallbydate = require('../models/fixturesallbydateModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');
const mongoose = require('mongoose');

class FixturesAllByDateService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
        
    }

    fixturesAllByDate = async (query) => {
        const redis = new Redis({ host: 'redis', port: 6379 });
        const queryObject = query;
        let itemRessult = {}
        const result = {
            date: '',
            data: []
        }
        const someAsyncFunction = async (item, date) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
            const dynamicDocument = new Fixturesallbydate({ date: date, data: item});            
            await dynamicDocument.save();
            console.log(`Processed item: ${item}`);
        };

        const processArray = async (array) => {
            // Empty collection in MongoDB
            Fixturesallbydate.deleteMany({ date: array.date }, () => {});
            for (const item of array.data) {
                await someAsyncFunction(item, array.date);
            }
            console.log('process: success');
        };

        const someAsyncISportScheduleFunction = async (item, count) => {
            // Thực hiện một hoạt động bất đồng bộ và chờ đợi kết quả
             
            // 1.
            itemRessult.fixtures = JSON.stringify(item);
            
            // 2.
            const optionsISportLineups = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/lineups',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    matchId: item.matchId,

                }
            };        
            const responseISportLineups = await axios.request(optionsISportLineups);
            itemRessult.lineUps = (responseISportLineups.data.hasOwnProperty('data')) ? JSON.stringify(responseISportLineups.data.data) : '';
            
            // 3.
            const optionsISportOddsPrematchs = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/odds/main',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    matchId: item.matchId,

                }
            };
            const responseISportOddsPrematchs = await axios.request(optionsISportOddsPrematchs);
            itemRessult.oddsPrematchs = (responseISportOddsPrematchs.data.hasOwnProperty('data')) ? JSON.stringify(responseISportOddsPrematchs.data.data) : '';
            
            // 4.
            const optionsISportLeagues = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/standing/league',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    matchId: item.leagueId,

                }
            };
            const responseISportLeagues = await axios.request(optionsISportLeagues);
            itemRessult.leagues = (responseISportLeagues.data.hasOwnProperty('data')) ? JSON.stringify(responseISportLeagues.data.data) : '';

            // 5.
            const optionsISportTeams = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/team',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    matchId: item.leagueId,

                }
            };
            const responseISportTeams = await axios.request(optionsISportTeams);
            itemRessult.teams = (responseISportTeams.data.hasOwnProperty('data')) ? JSON.stringify(responseISportTeams.data.data) : '';

            // 6.
            const optionsISportH2h = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/analysis',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    matchId: item.matchId,

                }
            };
            const responseISportH2h = await axios.request(optionsISportH2h);
            itemRessult.h2h = (responseISportH2h.data.hasOwnProperty('data')) ? JSON.stringify(responseISportH2h.data.data) : '';

            // 7.
            const optionsISportPlayers = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/playerstats/match',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    matchId: item.matchId,

                }
            };
            const responseISportPlayers = await axios.request(optionsISportPlayers);
            itemRessult.players = (responseISportPlayers.data.hasOwnProperty('data')) ? JSON.stringify(responseISportPlayers.data.data) : '';
            
            // Push kết quả vào result
            result.data.push(itemRessult);
            itemRessult = {};

            console.log(`ProcessedISportPlayers item: ${count}`);
        };



        const processArrayISportSchedule = async (array) => {
            let count = 0;
            for (const item of array) {
                count++;
                await someAsyncISportScheduleFunction(item, count);
                // if (count === 10 ) {
                //     // console.log('ddddddds', result);
                //      break;}
            }
            result.date = queryObject.date;
            
            console.log('processISportSchedule: success');
        };

        try {

        // // Clear data từ cache Redis 
        // redis.flushall((err, result) => {
        //     if (err) {
        //         console.error('Error:', err);
        //     } else {
        //         console.log('Redis flushed:', result);
        //     }
        // });
        // return []


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

            const query = { 'date': queryObject.date };
            // Check keysCache ở Redis
            const keysCache = await redis.keys(`Fixturesallbydate:${queryObject.date}:*`);
            if (keysCache.length === 0) {
                // Check amountCountDb ở MongoDB
                const amountCountDb = await Fixturesallbydate.countDocuments(query).exec();
                if (amountCountDb === 0) {
                    // Cooking data từ các api
                    const optionsISportSchedule = {
                        method: 'GET',
                        url: 'http://api.isportsapi.com/sport/football/schedule/basic',
                        params: {
                            api_key: 'OmglezmZnzTkNqzJ',
                            date: queryObject.date,
        
                        }
                    };
                    const responseISportSchedule = await axios.request(optionsISportSchedule);
                    
                    // Setup mảng các phần tử
                    const responseList = [];
                    const responseArrayISportSchedule = responseISportSchedule.data.data;
                    for (const item of responseArrayISportSchedule) {
                        if (['13014', '1099', '1639', '1437', '1134', '188', '1112'].includes(item.leagueId)) {
                            responseList.push(item);
                        }
                    }
                    // Gọi hàm processArrayISportSchedule với mảng responseArrayISportSchedule
                    await processArrayISportSchedule(responseList)
                    .then(() => {
                        console.log('All items processedISportSchedule');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                    
                    // Setup mảng các phần tử
                    const responseArray = result;
                    // Gọi hàm processArray với mảng responseArray
                    await processArray(responseArray)
                    .then(() => {
                        console.log('All items processed');
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                    // Set data từ database MongoDB vào Cache Redis
                    // Empty key in Redis
                    const keyListR = await redis.keys(`Fixturesallbydate:${queryObject.date}:*`);
                    (keyListR.length !== 0) ?? await redis.del(...keyListR);                                 
                    let documents = await Fixturesallbydate.find(query);
                    await documents.forEach((doc, index) => {
                        // Chuyển đổi document thành chuỗi JSON
                        const jsonString = JSON.stringify(doc.data);
                        // Lưu chuỗi JSON vào Redis với key là index
                        redis.set(`Fixturesallbydate:${queryObject.date}:${index}`, jsonString, (err) => {
                            if (err) {
                                console.error('Error saving document to Redis:', err);
                            } else {
                                console.log(`Document ${index} saved to Redis`);
                            }
                        });
                    });

                    // Gọi data từ cache Redis
                    const keyList = await redis.keys(`Fixturesallbydate:${queryObject.date}:*`);
                    const valueList = (keyList.length === 0) ? [] : await redis.mget(...keyList);
                    return valueList;        
                } else {
                    // Set data từ database MongoDB vào Cache Redis
                    // Empty key in Redis
                    const keyListR = await redis.keys(`Fixturesallbydate:${queryObject.date}:*`);
                    (keyListR.length !== 0) ?? await redis.del(...keyListR);                                 
                    let documents = await Fixturesallbydate.find(query);
                    await documents.forEach((doc, index) => {
                        // Chuyển đổi document thành chuỗi JSON
                        const jsonString = JSON.stringify(doc.data);
                        // Lưu chuỗi JSON vào Redis với key là index
                        redis.set(`Fixturesallbydate:${queryObject.date}:${index}`, jsonString, (err) => {
                            if (err) {
                                console.error('Error saving document to Redis:', err);
                            } else {
                                console.log(`Document ${index} saved to Redis`);
                            }
                        });
                    });

                    // Gọi data từ cache Redis
                    const keyList = await redis.keys(`Fixturesallbydate:${queryObject.date}:*`);
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

module.exports = FixturesAllByDateService;
