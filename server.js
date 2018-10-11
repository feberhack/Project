// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');

// app.use(bodyParser.json()); //for parsing post data that has json format

// app.use ( function (req , res , next){
//     res.setHeader ('Access-Control-Allow-Origin', '*');
//     res.setHeader ('Access-Control-Allow-Methods', 'GET ,POST ,PUT , DELETE , OPTIONS');
//     res.setHeader ('Access-Control-Allow-Headers', 'Content-Type');
//     next ();
// });

// const{Pool} = require('pg');

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     database: 'postgres',
//     password: '1234',
//     port: 5432,
// });


// //Get the data from the database 
// app.get('/loadpins', (req ,res) => {
//     pool.query ('select  ST_AsGeoJSON(geom) from public.coords', (err,dbResponse) => {
//         if (err) console.log (err);
//         console.log(dbResponse.rows);
//         // here dbResponse is available , your data processing logic goes here
//         res.setHeader('Access-Control-Allow-Origin','*');
//         res.send(dbResponse.rows);
//     });
// });



// app.post ('/pin', (req , res) => {
//     console.log (req.body);
//     // data you send from your application is available on
//     // req.body object , your data processing logic goes here
//    // pool.query (`insert into public.coords (geom) values (ST_GeomFromText('${req.body.x} ${req.body.y})',3857))`, (err, dbResponse) => {
//     pool.query (`insert into public.coords (geom) values (ST_GeomFromText('POINT(${req.body.lon} ${req.body.lat})',3857))`, (err, dbResponse) => {
//         if (err) console.log(err);
//         res.send("Position added!");
//     });
// });

// app.listen (3000 , () => console.log ('Example app listening on port3000!') );

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
    database: 'postgres',
    password: '1234',
    port: 5432,
});

app.get('/loadroads', (req ,res) => {
    pool.query ('select ST_AsGeoJSON(geom) from d.roads', (err,dbResponse) => {
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
    pool.query (`insert into d.track (user_gid, distance, description, route_name, cityarea, terrain, private, geom) values ('1', '${req.body.distance}','${req.body.description}','${req.body.routename}','${req.body.cityarea}','${req.body.terrain}',${req.body.private}, ST_GeomFromText('LINESTRING(${req.body.coords})',3857))`, (err, dbResponse) => {
        if (err) console.log(err);
        res.send("Position added!");
    });
});

app.listen (3000 , () => console.log ('Example app listening on port3000!') );