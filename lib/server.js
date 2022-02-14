import http from 'http';
import config from '../config.js';
import { file } from './file.js';
import { utils } from './utils.js';
import { StringDecoder } from 'string_decoder';

import { PageHome } from '../pages/home.js';
import { Page404 } from '../pages/404.js';
import { PageBlog } from '../pages/Blog.js';
import { PageRegister } from '../pages/Register.js';
import { PageLogin } from '../pages/Login.js';

import APIaccount from '../api/account.js';
import APIcontact from '../api/contact.js';
import APIservice from '../api/service.js';

const server = {};

server.httpServer = http.createServer((req, res) => {
    const baseURL = `http${req.socket.encrypted ? 's' : ''}://${req.headers.host}/`;
    const parsedURL = new URL(req.url, baseURL);
    const httpMethod = req.method.toLowerCase();
    const parsedPathName = parsedURL.pathname;
    const trimmedPath = parsedPathName.replace(/^\/+|\/+$/g, '');
    const headers = req.headers;

    /* 
    tekstiniai failai:
        - css faila
        - js faila
        - svg faila
    binariniai failai:
        - png/jpg/ico (nuotraukos) faila
        - woff (sriftu) faila
        - media (audio, video) faila
    API
    html turini
    */

    const fileExtension = utils.fileExtension(trimmedPath);
    const textFileExtensions = ['css', 'js', 'svg', 'webmanifest'];
    const binaryFileExtensions = ['eot', 'ttf', 'woff', 'woff2', 'otf', 'png', 'jpg', 'ico'];
    const isTextFile = textFileExtensions.includes(fileExtension);
    const isBinaryFile = binaryFileExtensions.includes(fileExtension);
    const isAPI = trimmedPath.split('/')[0] === 'api';
    const isPage = !isTextFile && !isBinaryFile && !isAPI;

    const MIMES = {
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        svg: 'image/svg+xml',
        png: 'image/png',
        jpg: 'image/jpeg',
        ico: 'image/x-icon',
        woff2: 'font/woff2',
        woff: 'font/woff',
        ttf: 'font/ttf',
        otf: 'font/otf',
        eot: 'application/vnd.ms-fontobject',
        webmanifest: 'application/manifest+json',
        pdf: 'application/pdf',
        json: 'application/json',
    };

    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', (data) => {
        buffer += decoder.write(data);
    })

    req.on('end', async () => {
        buffer += decoder.end();

        let responseContent = '';

        const dataForHandlers = {
            baseURL,
            trimmedPath,
            httpMethod,
            headers,
            payload: utils.parseJSONtoObject(buffer),
        }

        if (isTextFile) {
            responseContent = await file.read('public', trimmedPath);
            if (responseContent === false) {
                res.writeHead(404);
                responseContent = `ERROR: problema bandant perskaityti faila "${trimmedPath}"`;
            } else {
                res.writeHead(200, {
                    'Content-Type': MIMES[fileExtension],
                })
            }
        }

        if (isBinaryFile) {
            responseContent = await file.readBinary('public', trimmedPath);
            if (responseContent === false) {
                res.writeHead(404);
                responseContent = `ERROR: problema bandant perskaityti faila "${trimmedPath}"`;
            } else {
                res.writeHead(200, {
                    'Content-Type': MIMES[fileExtension],
                })
            }
        }

        if (isAPI) {
            const APIroute = trimmedPath.split('/')[1];
            if (server.API[APIroute] && server.API[APIroute][APIroute]) {
                const APIhandler = server.API[APIroute][APIroute];

                await APIhandler(dataForHandlers, (statusCode, payload = '', headers = {}) => {
                    statusCode = typeof statusCode === 'number' ? statusCode : 200;
                    responseContent = typeof payload === 'string' ? payload : JSON.stringify(payload);

                    res.writeHead(statusCode, {
                        'Content-Type': MIMES.json,
                        ...headers,
                    })
                });
            } else {
                responseContent = JSON.stringify('ERROR: no such API endpoint found');

                res.writeHead(404, {
                    'Content-Type': MIMES.json,
                })
            }
        }

        if (isPage) {
            let pageClass = server.routes['404'];
            if (trimmedPath in server.routes) {
                pageClass = server.routes[trimmedPath];
            }
            let pageObj = new pageClass();
            responseContent = await pageObj.render();

            res.writeHead(200, {
                'Content-Type': MIMES.html,
            })
        }

        return res.end(responseContent);
    })
})

server.routes = {
    '': PageHome,
    'blog': PageBlog,
    'blog/good-morning': PageBlog,
    'blog/good-evening': PageBlog,
    '404': Page404,
    'register': PageRegister,
    'login': PageLogin,
}

server.API = {
    'service': APIservice,
    'account': APIaccount,
    'contact': APIcontact,
}

server.init = () => {
    server.httpServer.listen(config.httpPort, () => {
        console.log(`Tavo serveris sukasi ant http://localhost:${config.httpPort}`);
    });
}

export { server };