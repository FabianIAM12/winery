var assert = require('assert');
var request = require('request');

var LOCAL_URL = 'http://localhost:8080/wines';
var LIVE_URL = 'https://vast-harbor-96555.herokuapp.com/wines';
var URL = LIVE_URL;


function test_get_wines(entry) {
    request.get(
        URL,
        function (error, response, body) {
            if (!error) {
                var data = JSON.parse(body);
                assert.equal(response.statusCode, 200);
                assert.equal(data[0].name, entry.name);
                assert.equal(data[0].year, entry.year);
                assert.equal(data[0].country, entry.country);
                assert.equal(data[0].type, entry.type);
            }
        }
    );
}

function test_get_wines_filter(entry, filter) {
    request.get(
        URL + filter,
        function (error, response, body) {
            if (!error) {
                var data = JSON.parse(body);
                assert.equal(response.statusCode, 200);
                assert.equal(data[0].name, entry.name);
                assert.equal(data[0].year, entry.year);
                assert.equal(data[0].country, entry.country);
                assert.equal(data[0].type, entry.type);
            }
        }
    );
}

function test_post(wine) {
    request({
        url: URL,
        method: "POST",
        json: true,
        body: wine
    }, function (error, response, body){
        var data = JSON.parse(body);
        assert.equal(response.statusCode, 200);
        assert.equal(data.name, wine["name"]);
        assert.equal(data.year, wine["year"]);
        assert.equal(data.country, wine["country"]);
        assert.equal(data.type, wine["type"]);
    });
}

function test_invalid_post(wine) {
    request({
        url: URL,
        method: "POST",
        json: true,
        body: wine
    }, function (error, response, body){
        console.log(body);
        assert.equal(response.statusCode, 400);
    });
}

function test_get(id, wine) {
    request.get(
        URL + '/' + id,
        { json: { key: 'value' } },
        function (error, response, body) {
            if (!error) {
                var data = JSON.parse(body);
                assert.equal(response.statusCode, 200);
                assert.equal(data.name, wine["name"]);
                assert.equal(data.year, wine["year"]);
                assert.equal(data.country, wine["country"]);
                assert.equal(data.type, wine["type"]);
            }
        }
    );
}

function test_invalid_get(id) {
    request.get(
        URL + '/' + id,
        { json: { key: 'value' } },
        function (error, response, body) {
            console.log(body);
            assert.equal(response.statusCode, 400);
        }
    );
}

function test_del(id) {
    request.del(
        URL + '/' + id,
        { json: { key: 'value' } },
        function (error, response, body) {
            if (!error) {
                assert.equal(response.statusCode, 200);
            }
        }
    );
}

function test_invalid_del(id) {
    request.del(
        URL + '/' + id,
        { json: { key: 'value' } },
        function (error, response, body) {
            console.log(body);
            assert.equal(response.statusCode, 400);
        }
    );
}

function test_put(id, wine){
    request({
        url: URL + '/' + id,
        method: "PUT",
        json: true,
        body: JSON.stringify(wine)
    }, function (error, response, body){
        var data = JSON.parse(body);
        assert.equal(response.statusCode, 200);
        assert.equal(data.name, wine["name"]);
        assert.equal(data.year, wine["year"]);
        assert.equal(data.country, wine["country"]);
        assert.equal(data.type, wine["type"]);
    });
}

function test_invalid_put(id, wine){
    request({
        url: URL + '/' + id,
        method: "PUT",
        json: true,
        body: JSON.stringify(wine)
    }, function (error, response, body){
        console.log(body);
        assert.equal(response.statusCode, 400);
    });
}

function drop_data() {
    request({
        url: URL,
        method: "POST"
    }, function (error, response, body) {
        console.log('deleted data');
        console.log(body);
    });
}

var test_wine_1 = {"name": 'White', "year": 2005, "country": "France", "type": "white"};
var test_wine_2 = {"name": 'Red', "year": 1996, "country": "Germany", "type": "red"};
var test_wine_3 = {"name": 'Burgunder', "year": 2010, "country": "France", "type": "rose"};
var test_wine_4 = {"name": 'American', "year": 2006, "country": "USA", "type": "red"};
var special_wine = {"name": 'Sauvignon', "year": 2012, "country": "South Africa", "type": "white"};
var invalid_wine = {"name": 'bla'};

/*
drop_data();
return
*/

/* STATUSCODE TESTS */
test_invalid_post(invalid_wine);
test_invalid_put(99999, invalid_wine);
test_invalid_get(99999);
test_invalid_del(99999);

/* BASIC TESTS */
test_post(test_wine_4);
test_get(2, test_wine_2);

test_post(test_wine_2);
test_post(test_wine_3);
test_post(test_wine_4);
test_get_wines(test_wine_2);

test_get_wines_filter(test_wine_1, '&country=France');
test_get_wines_filter(test_wine_2, '&country=Germany&year=1996');
test_get_wines_filter(test_wine_3, '&year=2010&country=France');
test_get_wines_filter(test_wine_4, '&name=American');

test_put(1, special_wine);
test_del(3);
