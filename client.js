// client.js
const WebSocket = require('ws');

// const ws = new WebSocket('ws://ec2-18-232-186-210.compute-1.amazonaws.com:8080');
const ws = new WebSocket('ws://localhost:8080');

// Gửi thông điệp chứa các tham số cho server
ws.on('open', () => {
    console.log('Connected to server');
    
    // const message = JSON.stringify({
    //     routes: 'fixtures-head-to-head',
    //     params: { h2h: '33-35' }
    // });

    // const message = JSON.stringify({
    //     routes: 'fixtures-by-date',
    //     params: { date: '2021-04-07' }
    // });

    // const message = JSON.stringify({
    //     routes: 'leagues-by-season',
    //     params: { season: '2020' }
    // });

    // const message = JSON.stringify({
    //     routes: 'fixtures-line-ups',
    //     params: { fixture: '215662' }
    // });

    // const message = JSON.stringify({
    //     routes: 'odds-by-date',
    //     params: { date: '2021-04-07' }
    // });

    // const message = JSON.stringify({
    //     routes: 'players-statistics-by-fixture-id',
    //     params: { fixture: '169080' }
    // });

    // const message = JSON.stringify({
    //     routes: 'odds-in-play',
    //     params: { date: 'current' }
    // });

    // const message = JSON.stringify({
    //     routes: 'live-odds',
    //     params: { matchId: '372499326' }
    // });

    // const message = JSON.stringify({
    //     routes: 'livescores',
    //     params: { matchId: '363747524' }
    // });

    const message = JSON.stringify({
        routes: 'events',
        params: { matchId: '212811520' }
    });

    // const message = JSON.stringify({
    //     routes: 'statistics',
    //     params: { matchId: '212811520' }
    // });

    // const message = JSON.stringify({
    //     routes: 'fixtures-all-by-date',
    //     params: { date: '2024-05-10' }
    // });


    ws.send(message);
});

// Nhận thông điệp chứa các tham số từ server
ws.on('message', async (message) => {
    // Chuyển đổi dữ liệu nhận được từ chuỗi JSON thành đối tượng JavaScript
    const data = JSON.parse(message);
    console.log('Received Data as JSON object:', data);
  });
ws.on('close', () => {
    console.log('Disconnected from server');
});
