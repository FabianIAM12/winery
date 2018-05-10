var restify = require('restify');
var request = require('request');

var server = restify.createServer();

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

/*
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    console.log("Database created!");
    db.close();
});
*/

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('connected to mongodb');
});

var wineSchema = mongoose.Schema({
    id: Number,
    name: String,
    year: String,
    country: String,
    type: String,
    description: String
});

var Wine = mongoose.model('Wine', wineSchema);
Wine.collection.drop();

var chardoney = new Wine({ id: 4, name: 'Zinfandel Wine', year: '2010', country: 'France', type: 'red', description: 'dingeling'});
var schnaps = new Wine({ id: 5, name: 'Zimtkuchen Schnaps', year: '2015', country: 'Germany', type: 'green', description: 'Very smooth'});
var bier = new Wine({ id: 6, name: 'Schnaps', year: '2015', country: 'Germany', type: 'green', description: 'Very smooth'});
var wein = new Wine({ id: 7, name: 'Zimtkuchen Wodka', year: '1995', country: 'Bavaria', type: 'green', description: 'Very smooth'});
var obstler = new Wine({ id: 8, name: 'Bier', year: '900', country: 'Chech', type: 'green', description: 'Very smooth'});

chardoney.save(function(error, document){ });
schnaps.save(function(error, document){ });
bier.save(function(error, document){ });
wein.save(function(error, document){ });
obstler.save(function(error, document){ });

function clean_entry(wine){
    return({'id':wine.id,
        'name':wine.name,
        'year':wine.year,
        'country':wine.country,
        'type':wine.type,
        'description':wine.description})
}

function clean_and_split_parameters(parameters){
    var parameter;
    var search_params_array = [];
    var valid_filters = ['year', 'category', 'name', 'country'];

    for (var key in parameters){
        parameter = parameters[key].replace('&','');
        if (parameter.includes('&')){
            var remaining_vars = parameter.split('&');
            for (var i = 0; i < remaining_vars.length; i++) {
                search_params_array.push(remaining_vars[i]);
            }
        }else if(parameter){
            search_params_array.push(parameter);
        }
    }
    var result_dict = {};
    for (var i = 0; i < search_params_array.length; i++) {
        var entry = search_params_array[i].split('=');

        if (valid_filters.includes(entry[0])) {
            result_dict[entry[0]] = entry[1];
        }
    }
    return result_dict
}

/*
server.get(/^\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function(req, res, next) {
    console.log(req.params[0]);
    console.log(req.params[1]);
  */

server.get('/wines', function (req, res) {
    Wine.find({}, function(err, wines) {
        var wines_array = [];
        wines.forEach(function (wine) {
            wines_array.push(clean_entry(wine));
        });
        res.writeHead(200, {"Content-Type": "application/json"});
        var json = JSON.stringify(wines_array);
        res.end(json);
    });
});

server.get(/wines\/([a-zA-Z0-9_=\.~-]+)(.*)/, function(req, res, next) {

    var search_parameters = clean_and_split_parameters(req.params);
    console.log(search_parameters);

    var query = Wine.find(search_parameters);

    // selecting the `name` and `occupation` fields
    //query.select('name occupation');

    // execute the query at a later time
    query.exec(function (err, wine) {
        if (err) return handleError(err);
        // Prints "Space Ghost is a talk show host."
        console.log('%s', wine.name);
    });
    //

    /*
    Wine.find({}, function(err, wines) {
        var wines_array = [];
        wines.forEach(function (wine) {
            wines_array.push(clean_entry(wine));
        });
        res.writeHead(200, {"Content-Type": "application/json"});
        var json = JSON.stringify(wines_array);
        res.end(json);
    });*/

    res.send(200);
    return next();
});

server.post('/wines', function (req, res) {
    var wine_categories = ['red', 'white', 'rose'];
    var validation_errors = [];

    var POST = {};
    req.on('data', function(data) {
        data = data.toString();
        data = data.split('&');
        for (var i = 0; i < data.length; i++) {
            var _data = data[i].split("=");
            POST[_data[0]] = _data[1];
        }

        if (!POST['name']){
            validation_errors.push({'type':'MISSING'});
        }
        // TODO: validator name

        var year_re = /^\d{4}$/;
        if (!POST['year']){
            validation_errors.push({'type':'MISSING'});
        }else if(!year_re.test(POST['year'])){
            validation_errors.push({'type':'INVALID'});
        }

        if (!POST['country']){
            validation_errors.push({'type':'MISSING'});
        }
        // TODO: validator country

        if (!POST['type']){
            validation_errors.push({'type':'MISSING'});
        }else if(!wine_categories.includes(POST['type'])){
            validation_errors.push({'type':'INVALID'});
        }

        if (validation_errors.length > 0){
            res.send({error: 'VALIDATION ERROR',
                validation: validation_errors});
        }else{
            var saufi = new Wine({ id: 10, name: POST['name'], year: POST['year'], country: POST['country'], type: POST['type'], description: POST['description']});
            saufi.save(function(error, document){ });
        }
    });
});

server.get('/wines/:id', function (req, res) {
    Wine.findOne({'id': req.params['id']}).exec(function (err, result) {
        if (result) {
            res.send(JSON.stringify(clean_entry(wine)));
        }else{
            res.send({error: 'UNKNOWN OBJECT'})
        }
    });
});

server.del('/wines/:id', function (req, res) {
    Wine.findOneAndRemove({'id': req.params['id']}).exec(function (err, result) {
        if (result) {
            res.send({'success': true});
        }else{
            res.send({error: 'UNKNOWN OBJECT'})
        }
    });
});

server.listen(8080, function() {
    console.log('%s listening at %s', server.name, server.url);
});
