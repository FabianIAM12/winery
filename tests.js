var assert = require('assert');
var request = require('request');

function test_get_wines(entry) {
    request.get(
        'http://localhost:8080/wines',
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

function test_post_wines(wine) {
    var test_string = '';
    if (wine["name"]) test_string += 'name=' + wine["name"];
    if (wine["year"]) test_string += '&year=' + wine["year"];
    if (wine["country"]) test_string += '&country=' + wine["country"];
    if (wine["type"]) test_string += '&type=' + wine["type"];
    request({
        url: "http://localhost:8080/wines",
        method: "POST",
        json: true,
        body: test_string
    }, function (error, response, body){
        var data = JSON.parse(body);
        assert.equal(response.statusCode, 200);
        assert.equal(data.name, wine["name"]);
        assert.equal(data.year, wine["year"]);
        assert.equal(data.country, wine["country"]);
        assert.equal(data.type, wine["type"]);
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

/* POST GET DEL */
var test_wine_1 = {"name": 'White', "year": 2003, "country": "France", "type": "white"};
var test_wine_2 = {"name": 'Red', "year": 1996, "country": "Germany", "type": "red"};
var test_wine_3 = {"name": 'Burgunder', "year": 2010, "country": "France", "type": "rose"};
var test_wine_4 = {"name": 'XXXX', "year": 9999, "country": "Usa", "type": "red"};

/* Testdata and further filters */
//test_post_wines(test_wine_1);
//test_get_wines(test_wine_1);
//test_del(1);

/* First Simple Test */
//test_post_wines(test_wine_1);
//test_get(1, test_wine);
//test_del(1);

test_post_wines(test_wine_1);
test_put(14, test_wine_4);