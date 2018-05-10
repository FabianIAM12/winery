var restify = require('restify');
var server = restify.createServer();

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

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

function clean_entry(wine){
	return({'id':wine.id,
		'name':wine.name,
		'year':wine.year,
		'country':wine.country,
		'type':wine.type,
		'description':wine.description});
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
	for (var y = 0; y < search_params_array.length; y++) {
        var entry = search_params_array[y].split('=');

		if (valid_filters.includes(entry[0])) {
			result_dict[entry[0]] = entry[1];
		}
	}
	return result_dict;
}

server.get('/wines', function (req, res) {
	Wine.find({}, function(err, wines) {
		res.writeHead(200, {'Content-Type': 'application/json'});
		var json = JSON.stringify(wines);
		res.end(json);
	});
});

server.get(/wines&([a-zA-Z0-9_=\.~-]+)(.*)/, function(req, res) {
	var wines_array = [];
	var query = Wine.find(clean_and_split_parameters(req.params));
	query.exec(function (err, wines) {
		if (err) return handleError(err);
		wines.forEach(function (wine) {
			wines_array.push(clean_entry(wine));
		});
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(wines_array));
	});
});

server.post('/wines', function (req, res) {
	var wine_categories = ['red', 'white', 'rose'];
	var validation_errors = [];

	req.on('data', function(data) {
	    data = JSON.parse(data);

		var word_validator = /([a-zA-Z])\w+/;
		if (!data.name){
			validation_errors.push({'name':'MISSING'});
		}else if(!word_validator.test(data.name)){
			validation_errors.push({'name':'INVALID'});
		}

		var year_re = /^\d{4}$/;
		if (!data.year){
			validation_errors.push({'year':'MISSING'});
		}else if(!year_re.test(data.year)){
			validation_errors.push({'year':'INVALID'});
		}

		if (!data.country){
			validation_errors.push({'country':'MISSING'});
		}else if(!word_validator.test(data.country)){
			validation_errors.push({'country':'INVALID'});
		}

		if (!data.type){
			validation_errors.push({'type':'MISSING'});
		}else if(!wine_categories.includes(data.type)){
			validation_errors.push({'type':'INVALID'});
		}

		if (validation_errors.length > 0){
            res.status(400);
			res.send({error: 'VALIDATION ERROR',
				validation: validation_errors});
		}else{
            Wine.find().limit(1).sort({ id: -1 }).exec(function (err, result){
                var next_id = 1;
                if (typeof(result[0]) !== "undefined"){
                    next_id = result[0].id + 1;
                }

                var new_entry = new Wine({
                    id: next_id,
                    name: data.name,
                    year: data.year,
                    country: data.country,
                    type: data.type,
                    description: data.description});

                new_entry.save(function (err, entry) {
                    if (err) return console.error(err);
                    res.status(200);
                    res.send(JSON.stringify(clean_entry(entry)));
                });
            });
		}
	});
});

server.put('/wines/:id', function (req, res) {
    req.on('data', function(data) {
        Wine.findOneAndUpdate({'id': req.params['id']}, JSON.parse(data)).exec(function (err, result) {
            if (result) {
                res.send(JSON.stringify(clean_entry(result)));
            }else{
                res.status(400);
                res.send({error: 'UNKNOWN OBJECT'});
            }
        });
    });
});

server.get('/wines/:id', function (req, res) {
	Wine.findOne({'id': req.params['id']}).exec(function (err, result) {
		if (result) {
			res.send(JSON.stringify(clean_entry(result)));
		}else{
            res.status(400);
			res.send({error: 'UNKNOWN OBJECT'});
		}
	});
});

server.del('/wines/:id', function (req, res) {
	Wine.findOneAndRemove({'id': req.params['id']}).exec(function (err, result) {
		if (result) {
            res.send({'success': true});
		}else{
            res.status(400);
			res.send({error: 'UNKNOWN OBJECT'});
		}
	});
});

server.post('/drop_data', function (req, res) {
    Wine.collection.drop();
    res.send({'success': true});
});

server.listen(8080, function() {
	console.log('%s winery startet - listening at %s', server.name, server.url);
});
