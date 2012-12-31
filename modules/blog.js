// Generated by CoffeeScript 1.4.0
(function() {

  module.exports = function(mongoose) {
    var Blog;
    Blog = (function() {

      function Blog(mongoose) {
        this.blog = mongoose.model('blog');
        this.post = mongoose.model('post');
        this.helper = (require(__dirname + '/helper'))();
      }

      Blog.prototype.create = function(obj, callback) {
        var _this = this;
        return this.blog.findOne({
          url: obj.url
        }, function(err, data) {
          var blog;
          if (data !== null) {
            return _this._post({
              id: data._id,
              posts: obj.posts
            }, function(data) {
              callback(data);
            });
          } else {
            blog = new _this.blog({
              url: obj.url,
              title: obj.title,
              updated: obj.updated
            });
            return blog.save(function(err, data) {
              if (err === null) {
                return _this._post({
                  id: data._id,
                  posts: obj.posts
                }, function(data) {
                  callback(data);
                });
              }
            });
          }
        });
      };

      Blog.prototype.find = function(url, callback) {
        var _this = this;
        return this.blog.findOne({
          url: url
        }, function(err, data) {
          var blog;
          if (err !== null) {
            throw err.message;
          }
          blog = data;
          _this.post.find({
            id: blog._id
          }).sort({
            date: -1
          }).exec(function(err, data) {
            var post, posts, _i, _len;
            posts = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              post = data[_i];
              posts.push(post);
            }
            return callback({
              id: blog._id,
              url: blog.url,
              title: blog.title,
              updated: blog.updated,
              posts: posts
            });
          });
        });
      };

      Blog.prototype.findMostRecent = function(url, callback) {
        var _this = this;
        return this.blog.findOne({
          url: url
        }, function(err, data) {
          _this.post.find({
            id: data._id
          }).sort({
            date: -1
          }).limit(5).exec(function(err, data) {
            var post, recent, _i, _len;
            recent = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              post = data[_i];
              recent.push({
                title: post.title,
                permaLink: post.permaLink
              });
            }
            return callback(recent);
          });
        });
      };

      Blog.prototype.findPost = function(url, permaLink, callback) {
        var _this = this;
        return this.blog.findOne({
          url: url
        }, function(err, data) {
          _this.post.findOne({
            id: data._id,
            permaLink: permaLink
          }, function(err, data) {
            return callback(data);
          });
        });
      };

      Blog.prototype["delete"] = function(url) {
        var _this = this;
        return this.blog.find({
          url: url
        }, function(err, data) {
          var blog, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            blog = data[_i];
            _results.push(_this.post.remove({
              id: blog._id
            }, function() {
              return _this.blog.remove({
                url: url
              });
            }));
          }
          return _results;
        });
      };

      Blog.prototype._post = function(obj, callback) {
        var link, post, postSchema, _i, _len, _ref, _results;
        _ref = obj.posts;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          post = _ref[_i];
          link = this.helper.linkify(post.title);
          postSchema = new this.post({
            id: obj.id,
            title: post.title,
            permaLink: link,
            author: post.author,
            body: post.body,
            publish: 1,
            date: new Date()
          });
          _results.push(postSchema.save(function(err, data) {
            if (err !== null) {
              callback(err.message);
            }
            callback(data);
          }));
        }
        return _results;
      };

      return Blog;

    })();
    return new Blog(mongoose);
  };

}).call(this);
