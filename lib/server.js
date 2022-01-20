const http = require('http');
const { parse } = require('path/posix');
const config = require('../config.js');

console.log(http.METHODS);

const server = {};

server.httpServer = http.createServer((req, res) => {

    // console.log(req.method, req.url);

    const baseURL = `http${req.socket.encrypted ? 's' : ''}://${req.headers.host}/`;
    const parsedURL = new URL(req.url, baseURL);
    const parsedPathName = parsedURL.pathname;
    // const parsedPathName = parsedURL.pathname;
    const httpMethod = req.method.toUpperCase();
    const trimmedPath = parsedPathName.replace(/^\/+|\/+$/g, '');
    const headers = req.headers;

    // console.log(headers);

    // console.log(parsedPathName, '------->', trimmedPath);
    // // console.log(parsedURL);

    // console.log('METODAS ------>', httpMethod);


    req.on('data', (data) => {
        console.log('gavau duomenis...');
    })

    req.on('end', () => {
        let responseContent = '';

        if (req.url === '/') {
            console.log(req);
            responseContent = `<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta http-equiv="X-UA-Compatible" content="IE=edge">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Server</title>
                    </head>
                    <body>
                        SERVER CONTENT - ${config.envName}
                    </body>
                </html>`;
        } else {
            responseContent = 'ERROR: nesupratau ko nori, arba neturiu, to ko nori...'
        }

        return res.end(responseContent);
    })
})

server.init = () => {
    // console.log(config);
    server.httpServer.listen(config.httpPort, () => {
        console.log(`Tavo serveris sukasi ant: http://localhost:${config.httpPort}`);
    });
}

module.exports = server;