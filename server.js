const express = require ('express');
const app = express ();
const bodyParser = require ('body-parser');

app.use(bodyParser.json()); // for parsing post data that has json format

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');
    next();
});

const { Pool } = require ('pg');

const pool = new Pool ({
    user: 'postgres',
    host: 'localhost',
    database: 'projekt',
    password: 'dbeduards',
    port: 5432,
});

app.get('/loadroads', (req ,res) => {
    pool.query ('select ST_AsGeoJSON(geom) from d.roadnetwork5', (err,dbResponse) => {
        if (err) console.log (err);
        console.log(dbResponse.rows);
        // here dbResponse is available , your data processing logic goes here
        res.setHeader('Access-Control-Allow-Origin','*');
        res.send(dbResponse.rows);
    });
});

app.post ('/myposition', (req , res) => {
    console.log (req.body);
    // data you send from your application is available on
    // req.body object , your data processing logic goes here
    pool.query (`insert into lab3.currentpos (geom) values (ST_GeomFromText('POINT(${req.body.x} ${req.body.y})',3857))`, (err, dbResponse) => {
        if (err) console.log(err);
        res.send("Position added!");
    });
});

app.post ('/postrun', (req , res) => {
    console.log (req.body);
    // data you send from your application is available on
    // req.body object , your data processing logic goes here
    pool.query (`insert into d.track (user_gid, distance, description, route_name, cityarea, terrain, private, coordinates) values ('1', '${req.body.distance}','${req.body.description}','${req.body.routename}','${req.body.cityarea}','${req.body.terrain}',${req.body.private})`, (err, dbResponse) => {
        if (err) console.log(err);
        res.send("Position added!");
    });
});

app.listen (3000 , () => console.log ('Example app listening on port3000!') );