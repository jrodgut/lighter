// Generated by CoffeeScript 1.4.0
(function() {

  module.exports = function(mongoose) {
    var Schema;
    Schema = (function() {

      function Schema(mongoose) {
        var BlogSchema, CategoriesSchema, CommentsSchema, ObjectId, PostSchema;
        Schema = mongoose.Schema;
        ObjectId = Schema.ObjectId;
        CategoriesSchema = new Schema({
          title: String
        });
        CommentsSchema = new Schema({
          title: String,
          text: String,
          date: Date
        });
        PostSchema = new Schema({
          id: ObjectId,
          author: String,
          title: String,
          permaLink: String,
          body: String,
          date: Date,
          categories: [CategoriesSchema],
          comments: [CommentsSchema],
          publish: Boolean
        });
        BlogSchema = new Schema({
          url: String,
          title: String,
          updated: Date
        });
        mongoose.model('blog', BlogSchema);
        mongoose.model('post', PostSchema);
      }

      return Schema;

    })();
    return new Schema(mongoose);
  };

}).call(this);
