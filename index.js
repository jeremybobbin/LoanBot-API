'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const FormDao = require('./FormDao');
const Responder = require('./Responder');

let formDao = new FormDao('test', null);
let responder = new Responder(formDao);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (req, res) => {
    body ? res.send(body) : res.send('No Results');
});

app.get('/sql', (req, res) => {
    res.set('Content-Type', 'text/html');
    res.send(new Buffer(
        `<form action="/sql" method="POST"> \
            <input name="sql" type="text" placeholder="SQL String"> \
            <button type="submit">Search</button> \
        </form>`
    ));
});

app.post('/sql', (req, res) => {
    formDao.query(req.body.sql)
        .then(result => res.send(result))
        .catch(result => res.send(result))
});


let body;

app.post('/', (req, res) => {
    body = req.body;
    body.ip = req.headers['x-forwarded-for'] || req.ip;

    let jsonResponse = responder.respond(req);
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonResponse);
});

if (module === require.main) {
    const server = app.listen(process.env.PORT || 8080, () => {
        const port = server.address().port;
        console.log(`App listening on port ${port}`);
    });
}

module.exports = app;