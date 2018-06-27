'use strict';

const bodyParser = require('body-parser'),
    express = require('express'),
    config = require('./config'),
    FormDao = require('./FormDao'),
    Responder = require('./Responder');

const ms = config.sql,
    app = express(),
    formDao = new FormDao(ms.database, ms.socketPath, ms.user, ms.password),
    responder = new Responder(formDao);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/sql', (req, res) => {
    formDao.query('SELECT * FROM sessions;')
        .then(results => {
            let columns = [];
            for(let prop in results[0]) {
                columns.push(prop);
            }
            res.render('sql', {columns, results, sql: req.body.sql});
        })
        .catch(console.log);
});

app.get('/prepop', (req, res) => {
    res.render('prepop', config.prepop);
});

app.get('/recent', (req, res) => {
    let obj = {};
    obj.json = JSON.stringify(body, null, 4);
    res.render('recent', obj);
});

app.post('/prepop', (req, res) => {
    for (let prop in config.prepop.params) {
        config.prepop.params[prop].enabled = false;
    }
    for(let prop in req.body) {
        if(prop === 'base') {
            config.prepop.base = req.body[prop];
            continue;
        } else if (prop.endsWith('Checked') && req.body[prop] === 'on') {
            prop = prop.slice(0, -7);
            config.prepop.params[prop].enabled = true;
        } else {
            config.prepop.params[prop].key = req.body[prop];
        }
    }
    res.redirect('/prepop');
});

app.post('/sql', (req, res) => {
    formDao.query(req.body.sql)
        .then(results => {
            let columns = [];
            for(let prop in results[0]) {
                columns.push(prop);
            }
            res.render('sql', {columns, results, sql: req.body.sql});
        })
        .catch(console.log);
});


let body;

app.post('/', (req, res) => {
    body = req.body;
    responder.respond(req).then(result => {
        res.setHeader('Content-Type', 'application/json');
        res.send(result);
    });
});

if (module === require.main) {
    const server = app.listen(process.env.PORT || 8080, () => {
        const port = server.address().port;
        console.log(`App listening on port ${port}`);
    });
}

module.exports = app;
