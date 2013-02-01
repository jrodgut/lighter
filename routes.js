// Generated by CoffeeScript 1.4.0
(function() {
  var routes,
    _this = this;

  routes = function(app, settings) {
    var authorize, blog, category, helper, recent, request, xml2js;
    blog = (require(__dirname + '/modules/blog'))(settings);
    helper = (require(__dirname + '/modules/helper'))();
    category = (require(__dirname + '/modules/category'))(settings);
    request = (require(__dirname + '/modules/request'))(settings);
    xml2js = require('xml2js');
    recent = [];
    authorize = function(req, res, next) {
      request.validate(req, function(result) {
        if (result !== null) {
          console.log(result);
          next();
        } else {
          res.send(401);
        }
      });
    };
    app.get('/api/atom', authorize, function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return res.render('atom/atom', {
        title: 'Blog entries',
        url: settings.url
      });
    });
    app.get('/api/atom/categories', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return category.all(function(result) {
        return res.render('atom/categories', {
          categories: result
        });
      });
    });
    app.get('/api/atom/feeds', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return blog.find(function(result) {
        return res.render('atom/feeds', result);
      });
    });
    app.post('/api/atom/feeds', function(req, res) {
      var parser,
        _this = this;
      parser = new xml2js.Parser();
      return req.addListener('data', function(data) {
        return parser.parseString(data, function(err, result) {
          var cat, categories, _i, _len, _ref;
          categories = [];
          if (typeof result.entry.category !== 'undefined') {
            _ref = result.entry.category;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              cat = _ref[_i];
              categories.push(cat.$.term);
            }
          }
          return blog.create({
            posts: [
              {
                title: result.entry.title[0]._,
                body: result.entry.content[0]._,
                author: 'Mehfuz Hossain',
                categories: categories
              }
            ]
          }, function(result) {
            var location;
            location = settings.url + 'api/atom/entries/' + result._id;
            res.header({
              'Content-Type': req.headers['content-type'],
              'Location': location
            });
            res.statusCode = 201;
            return res.render('atom/entries', {
              post: result,
              url: settings.url
            });
          });
        });
      });
    });
    app.get('/api/atom/entries/:id', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return blog.findPostById(req.params.id, function(result) {
        return res.render('atom/entries', {
          post: result,
          url: settings.url
        });
      });
    });
    app.put('/api/atom/entries/:id', function(req, res) {
      return blog.findPostById(req.params.id, function(result) {
        console.log(req.rawBody);
        return res.render('atom/entries', {
          post: result,
          url: settings.url
        });
      });
    });
    app["delete"]('/api/atom/entries/:id', authorize, function(req, res) {
      return blog.deletePost(req.params.id, function() {
        return res.end();
      });
    });
    app.get('/rsd.xml', function(req, res) {
      res.header({
        'Content-Type': 'application/xml'
      });
      return res.render('rsd', {
        url: settings.url,
        engine: settings.engine
      });
    });
    app.get('/:title', function(req, res) {
      var _this = this;
      if (recent.length === 0) {
        blog.findMostRecent(function(result) {
          recent = result;
        });
      }
      return blog.findPost(req.params.title, function(result) {
        return res.render('post', {
          host: settings.url,
          title: result.title,
          body: result.body,
          categories: result.categories,
          date: result.date,
          recent: recent
        });
      }, true);
    });
    return app.get('/', function(req, res) {
      return blog.findFormatted(function(result) {
        var post, _i, _len, _ref;
        if (recent.length === 0) {
          _ref = result.posts.slice(0, 5);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            post = _ref[_i];
            recent.push({
              title: post.title,
              permaLink: post.permaLink
            });
          }
        }
        return res.render('index', {
          host: result.url,
          title: result.title,
          posts: result.posts,
          recent: recent
        });
      });
    });
  };

  module.exports = routes;

}).call(this);
