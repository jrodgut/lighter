// Generated by CoffeeScript 1.4.0
(function() {
  var app, blog, express, fs, helper, path, request, xml2js;

  require('should');

  helper = (require('../modules/helper'))();

  express = require('express');

  request = require('supertest');

  xml2js = require('xml2js');

  blog = require(__dirname + '/init');

  path = require('path');

  fs = require('fs');

  app = express();

  (require(path.join(__dirname, '../config')))(app);

  (require(path.join(__dirname, '../routes')))(app, blog.settings);

  describe('POST /api/atom/feeds', function() {
    return it('respond correct status code', function(done) {
      request = request(app).post('/api/atom/feeds').set('Content-Type', 'application/atom+xml');
      return fs.readFile(__dirname + '/post.xml', 'utf8', function(err, result) {
        request.write(result);
        return request.expect(201).end(function(err, res) {
          var parser;
          if (err !== null) {
            throw err;
          }
          parser = new xml2js.Parser();
          parser.parseString(res.text, function(err, result) {
            result.entry.title[0].should.be.ok;
            return result.entry.content[0].should.be.ok;
          });
          return done();
        });
      });
    });
  });

}).call(this);