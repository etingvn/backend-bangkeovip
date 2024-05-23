const Fixturesallbydate = require('../models/fixturesallbydateModel');
const axios = require('axios');
const url = require('url');
const Redis = require('ioredis');
const mongoose = require('mongoose');
const { format, addDays, subDays } = require('date-fns');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');

class FixturesAllByDateCronJobService {
    constructor() {
        // Khởi tạo các tài nguyên cần thiết
        
    }

    fixturesAllByDateCronJob = async (query) => {
        const redis = new Redis({ host: process.env.REDIS_HOST, port: 6379 });
        const queryObject = query;
        let itemRessult = {}
        const result = {
            date: '',
            data: []
        }

        AWS.config.update({
            accessKeyId: '',
            secretAccessKey: '',
            region: 'us-east-1'
        });
        const s3 = new AWS.S3();

        const downloadAndSaveImageToS3 = async (imgurl) => {
            const keyName = imgurl.replace('http://', '').replace('?win007=sell', '').split('/').slice(-1)[0];
            const filePath = './S3ImagesTmp/' + keyName;
            const bucketName = 'bangkeovippro';
            const response = await axios({
                method: 'GET',
                url: imgurl,
                responseType: 'stream'
            }); 

            await response.data.pipe(fs.createWriteStream(filePath)); 
            await s3.upload({Bucket: bucketName, Key: keyName, Body: fs.createReadStream(filePath), ACL: 'public-read', ContentType: 'image/jpeg'}, (err, data) => {
                if (err) {
                    console.error("Error uploading file:", err);
                } else {
                    console.log("Upload success, File location:", data.Location);
                }
            }); 

            // // Xóa file ở S3
            // await s3.deleteObject({Bucket: bucketName, Key: '2013912115920.jpg'}, (err, data) => {
            //     if (err) {
            //         console.error("Error deleting file:", err);
            //     } else {
            //         console.log("Delete success");
            //     }
            // });
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
            itemRessult.fixtures = item;
            
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
            itemRessult.lineUps = (responseISportLineups.data.hasOwnProperty('data')) ? responseISportLineups.data.data : '';
    
            // 3.          
            const currentDate = new Date();
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
            const formattedFiveDaysLater = format(addDays(currentDate, 4), 'yyyy-MM-dd');
                const listDaysAgo = [formattedFiveDaysAgo, formattedFourDaysAgo, formattedThreeDaysAgo, formattedTwoDaysAgo, formattedOneDaysAgo];
            const listDaysLater = [formattedCurrentDate, formattedOneDaysLater, formattedTwoDaysLater, formattedThreeDaysLater, formattedFourDaysLater, formattedFiveDaysLater];
            let urlLink = '';
            if (listDaysAgo.includes(queryObject.date) && !listDaysLater.includes(queryObject.date)) urlLink = 'http://api.isportsapi.com/sport/football/odds/main/history';
            if (!listDaysAgo.includes(queryObject.date) && listDaysLater.includes(queryObject.date)) urlLink = 'http://api.isportsapi.com/sport/football/odds/main';
            const optionsISportOddsPrematchs = {
                method: 'GET',
                url: urlLink,
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    matchId: item.matchId,

                }
            };
            const responseISportOddsPrematchs = await axios.request(optionsISportOddsPrematchs);
            itemRessult.oddsPrematchs = (responseISportOddsPrematchs.data.hasOwnProperty('data')) ? responseISportOddsPrematchs.data.data : '';
            
            // 4.
            const optionsISportLeague = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/league',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',

                }
            };
            
            const jsonString13014 = `{
                "leagueId": "13014",
                "type": 2,
                "color": "#f75000",
                "logo": "https://bangkeovippro.s3.amazonaws.com/166675006178.png",
                "name": "UEFA Champions League",
                "shortName": "UEFA CL",
                "subLeagueName": "",
                "totalRound": 0,
                "currentRound": 0,
                "currentSeason": "2023-2024",
                "countryId": "53",
                "country": "Europe",
                "countryLogo": "https://bangkeovippro.s3.amazonaws.com/164454912155.png",
                "areaId": 1
              }`;

            const jsonString1099 = `{
                "leagueId": "1099",
                "type": 2,
                "color": "#0000cc",
                "logo": "https://bangkeovippro.s3.amazonaws.com/1hqjdpn0ah1h.png",
                "name": "England FA Cup",
                "shortName": "ENG FAC",
                "subLeagueName": "",
                "totalRound": 0,
                "currentRound": 0,
                "currentSeason": "2023-2024",
                "countryId": "1",
                "country": "England",
                "countryLogo": "https://bangkeovippro.s3.amazonaws.com/164326923816.png",
                "areaId": 1
              }`;

            const jsonString1639 = `{
                "leagueId": "1639",
                "type": 1,
                "color": "#FF3333",
                "logo": "https://bangkeovippro.s3.amazonaws.com/164577482086.png",
                "name": "English Premier League",
                "shortName": "ENG PR",
                "subLeagueName": "",
                "totalRound": 38,
                "currentRound": 38,
                "currentSeason": "2023-2024",
                "countryId": "1",
                "country": "England",
                "countryLogo": "https://bangkeovippro.s3.amazonaws.com/164326923816.png",
                "areaId": 1
              }`;
            const jsonString1437 = `{
                "leagueId": "1437",
                "type": 1,
                "color": "#0088FF",
                "logo": "https://bangkeovippro.s3.amazonaws.com/166674813339.png",
                "name": "Italian Serie A",
                "shortName": "ITA D1",
                "subLeagueName": "League",
                "totalRound": 38,
                "currentRound": 37,
                "currentSeason": "2023-2024",
                "countryId": "2",
                "country": "Italy",
                "countryLogo": "https://bangkeovippro.s3.amazonaws.com/164326651873.png",
                "areaId": 1
              }`;
            const jsonString1134 = `{
                "leagueId": "1134",
                "type": 1,
                "color": "#006633",
                "logo": "https://bangkeovippro.s3.amazonaws.com/1h56j6h3ep1.png",
                "name": "Spanish La Liga",
                "shortName": "SPA D1",
                "subLeagueName": "",
                "totalRound": 38,
                "currentRound": 37,
                "currentSeason": "2023-2024",
                "countryId": "3",
                "country": "Spain",
                "countryLogo": "https://bangkeovippro.s3.amazonaws.com/164326689793.png",
                "areaId": 1
              }`;
            const jsonString188 = `{
                "leagueId": "188",
                "type": 1,
                "color": "#990099",
                "logo": "https://bangkeovippro.s3.amazonaws.com/166674997937.png",
                "name": "German Bundesliga",
                "shortName": "GER D1",
                "subLeagueName": "",
                "totalRound": 34,
                "currentRound": 34,
                "currentSeason": "2023-2024",
                "countryId": "4",
                "country": "Germany",
                "countryLogo": "https://bangkeovippro.s3.amazonaws.com/16432664157.png",
                "areaId": 1
              }`;
            const jsonString1112 = `{
                "leagueId": "1112",
                "type": 1,
                "color": "#663333",
                "logo": "https://bangkeovippro.s3.amazonaws.com/166674753286.png",
                "name": "France Ligue 1",
                "shortName": "FRA D1",
                "subLeagueName": "",
                "totalRound": 34,
                "currentRound": 34,
                "currentSeason": "2023-2024",
                "countryId": "5",
                "country": "France",
                "countryLogo": "https://bangkeovippro.s3.amazonaws.com/164327629847.png",
                "areaId": 1
              }`;

            const jsonString = [
                JSON.parse(jsonString13014),
                JSON.parse(jsonString1099),
                JSON.parse(jsonString1639),
                JSON.parse(jsonString1437),
                JSON.parse(jsonString1134),
                JSON.parse(jsonString188),
                JSON.parse(jsonString1112)
            ];
            for (const itemBase of jsonString) {
                if (parseInt(itemBase.leagueId) === parseInt(item.leagueId)) {
                    // await downloadAndSaveImageToS3(itemBase.logo);
                    // await downloadAndSaveImageToS3(itemBase.countryLogo);
                    // itemBase.logo = 'https://bangkeovippro.s3.amazonaws.com/' + itemBase.logo.replace('http://', '').replace('?win007=sell', '').split('/').slice(-1)[0];
                    // itemBase.countryLogo = 'https://bangkeovippro.s3.amazonaws.com/' + itemBase.countryLogo.replace('http://', '').replace('?win007=sell', '').split('/').slice(-1)[0];
                    itemRessult.league = itemBase;

                }                  
            }



            // const responseISportLeague = await axios.request(optionsISportLeague);
            // console.log('responseISportLeague', responseISportLeague.data);
            // if (responseISportLeague.data.hasOwnProperty('data')) {
            //     itemRessult.league = await responseISportLeague.data.data.filter(itemLeague => itemLeague.leagueId === item.leagueId);
            // } else {
            //     itemRessult.league = '';
            // }
          
            // 5
            const optionsISportTeams = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/team',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',

                }
            };

            const responseISportTeams = await axios.request(optionsISportTeams);
            if (responseISportTeams.data.hasOwnProperty('data')) {
                itemRessult.teams = await responseISportTeams.data.data.filter(itemTeams => itemTeams.teamId === item.homeId || itemTeams.teamId === item.awayId);    
            } else {
                itemRessult.teams = '';
            }



            // for (const item of itemRessult.teams) {
            //     // item.logo = await downloadAndSaveImageToS3(item.logo);
            //     item.photo = 'https://bangkeovippro.s3.amazonaws.com/' + item.photo.replace('http://', '').replace('?win007=sell', '').split('/').slice(-1)[0];

            // }
          

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
            itemRessult.h2h = (responseISportH2h.data.hasOwnProperty('data')) ? responseISportH2h.data.data : '';

            // 7.a
            const optionsISportPlayersHomeId = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/player',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    teamId: item.homeId,
                }
            };

            const responseISportPlayersHomeId = await axios.request(optionsISportPlayersHomeId);
            const playersHomeId = (responseISportPlayersHomeId.data.hasOwnProperty('data')) ? await responseISportPlayersHomeId.data.data : [];


            // 7.b
            const optionsISportPlayersAwayId = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/player',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    teamId: item.awayId,
                }
            };

            const responseISportPlayersAwayId = await axios.request(optionsISportPlayersAwayId);
            const playersAwayId = (responseISportPlayersAwayId.data.hasOwnProperty('data')) ? await responseISportPlayersAwayId.data.data : [];
            await playersAwayId.concat(playersHomeId);

            // for (const itemBase of playersAwayId) {
            //     if(itemBase !== 'undefined') {
            //         await downloadAndSaveImageToS3(itemBase.photo);
            //     } 
            // }

            itemRessult.players = playersAwayId;            

            // for (const itemBase of playersAwayId) {
            //     itemBase.photo = 'https://bangkeovippro.s3.amazonaws.com/' + itemBase.photo.replace('http://', '').replace('?win007=sell', '').split('/').slice(-1)[0];
            // }

            
            // 8.
            const optionsISportReferees = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/referee',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                }
            };
            const responseISportReferees = await axios.request(optionsISportReferees);
            if (responseISportReferees.data.hasOwnProperty('data')) {
                itemRessult.referee = await responseISportReferees.data.data.filter(itemReferees => itemReferees.matchId === item.matchId);
            } else {
                itemRessult.referee = '';
            }

            // 9.
            const optionsISportInformation = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/schedule',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    leagueId: item.leagueId
                }
            };
            const responseISportInformation = await axios.request(optionsISportInformation);
            if (responseISportInformation.data.hasOwnProperty('data')) {
                itemRessult.information = await JSON.stringify(await responseISportInformation.data.data.filter(itemInformation => itemInformation.matchId === item.matchId));
            } else {
                itemRessult.information = '';
            }

            // 10.
            const optionsISportEvents = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/events',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    date: queryObject.date,
                }
            };
            const responseISportEvents = await axios.request(optionsISportEvents);
            if (responseISportEvents.data.hasOwnProperty('data')) {
                itemRessult.events = await responseISportEvents.data.data.filter(itemEvents => itemEvents.matchId == item.matchId);
            } else {
                itemRessult.events = '';
            }

            // 11.
            const optionsISportStats = {
                method: 'GET',
                url: 'http://api.isportsapi.com/sport/football/stats',
                params: {
                    api_key: 'OmglezmZnzTkNqzJ',
                    date: queryObject.date,
                }
            };
            const responseISportStats = await axios.request(optionsISportStats);
            if (responseISportStats.data.hasOwnProperty('data')) {
                itemRessult.stats = await responseISportStats.data.data.filter(itemStats => itemStats.matchId == item.matchId);
            } else {
                itemRessult.stats = '';
            }

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
                //     console.log('ddddddds', result);
                //     break;
                // }

            }
            result.date = queryObject.date;
            
            console.log('processISportSchedule: success');
        };


        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////

        try {
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
            await redis.quit();

            // // Lấy danh sách tất cả các tệp trong thư mục
            // await fs.readdir('./S3ImagesTmp/', (err, files) => {
            //     if (err) {
            //     console.error('Error reading directory:', err);
            //     return;
            //     }
            
            //     // Xóa từng tệp một
            //     files.forEach(file => {
            //     let filePath = path.join('./S3ImagesTmp/', file);
            //     fs.unlink(filePath, err => {
            //         if (err) {
            //         console.error('Error deleting file:', err);
            //         } else {
            //         console.log(`Deleted file: ${filePath}`);
            //         }
            //     });
            //     });
            // });
        } catch (error) {
            console.error(error);
            return { error: 'Server error' };
        }
    }
}

module.exports = FixturesAllByDateCronJobService;
