var assert = require('assert');
var request = require('request');

function test_get_wines(entry) {
    request.get(
        'http://localhost:8080/wines',
        function (error, response, body) {
            if (!error) {
                assert.equal(response.statusCode, 200);
            }
        }
    );
}

function test_get_wines_filter(entry, filter) {
    request.get(
        'http://localhost:8080/wines' + filter,
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
        url: "http://localhost:8080/wines",
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
        url: "http://localhost:8080/wines",
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
        'http://localhost:8080/wines/' + id,
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
        'http://localhost:8080/wines/' + id,
        { json: { key: 'value' } },
        function (error, response, body) {
            console.log(body);
            assert.equal(response.statusCode, 400);
        }
    );
}

function test_del(id) {
    request.del(
        'http://localhost:8080/wines/' + id,
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
        'http://localhost:8080/wines/' + id,
        { json: { key: 'value' } },
        function (error, response, body) {
            console.log(body);
            assert.equal(response.statusCode, 400);
        }
    );
}

function test_put(id, wine){
    request({
        url: "http://localhost:8080/wines/" + id,
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
        url: "http://localhost:8080/wines/" + id,
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
        url: "http://localhost:8080/drop_data",
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
test_post(test_wine_1);
test_get(20, test_wine_1);
test_post(test_wine_2);
test_post(test_wine_3);
test_post(test_wine_4);
test_get_wines(test_wine_1);
test_get_wines_filter(test_wine_1, '&country=France');
test_get_wines_filter(test_wine_2, '&country=Germany');
test_get_wines_filter(test_wine_3, '&year=2010&country=France');
test_get_wines_filter(test_wine_4, '&name=American');

test_put(20, special_wine);
test_del(20);
