const Fixtureheadtohead = require('../models/fixtureheadtoheadModel');
const axios = require('axios');
const url = require('url');

exports.fixturesHeadToHead = async (req, res) => {
  const queryObject = url.parse(req.url, true).query;
  const optionsRapidApi = {
    method: 'GET',
    url: 'https://api-football-v1.p.rapidapi.com/v3/fixtures/headtohead',
    params: {h2h: queryObject.h2h},
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
    const dynamicDocument = new Fixtureheadtohead({ parameters: parameters, data: item});
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
    const query = { 'parameters.h2h': queryObject.h2h };
    const amountCount = await Fixtureheadtohead.countDocuments(query).exec();
    if (amountCount === 0) {
      const response = await axios.request(optionsRapidApi);
      // Setup mảng các phần tử
      const responseArray = response.data;
    // Gọi hàm processArray với mảng responseArray
      processArray(responseArray)
      .then(() => {
          console.log('All items processed');
      })
      .catch((error) => {
          console.error('Error:', error);
      }); 
      const fixtureheadtohead = await Fixtureheadtohead.find(query);
      res.status(200).json(fixtureheadtohead);
    } else {
      const fixtureheadtohead = await Fixtureheadtohead.find(query);
      res.status(200).json(fixtureheadtohead);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};










