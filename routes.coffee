routes = (app, settings) => 
	util = require('util')
	blog = (require __dirname+'/modules/blog')(settings) 
	helper = (require __dirname+'/modules/helper')()
	
	category = (require __dirname + '/modules/category')(settings) 
	request = (require __dirname + '/modules/request')(settings)
	xml2js = require 'xml2js'

	authorize = (req, res, next)->
		request.validate req, (result)->
				if result != null
					console.log result
					next()
					return
				else
					res.send(401) 
					return
		return
		
	parseCategory = (entry)->
		categories = []
		# process category.
		if typeof(entry.category) != 'undefined'
				for cat in entry.category
					categories.push(cat.$.term)
		categories
		
					
	app.get '/api/atom', (req, res) ->
		res.header({'Content-Type': 'application/xml' })      
		res.render 'atom/atom', 
			title : 'Blog entries'
			host	: app.host

	app.get '/api/atom/categories', (req, res) ->
		res.header({'Content-Type': 'application/xml' })
		category.all (result)->
			res.render 'atom/categories',
				categories:result
				
	processGetFeeds = (req, res)->
			if settings.feedUrl && parseInt(req.params['public']) == 1
				res.redirect(settings.feedUrl)
			else
				res.header({'Content-Type': 'application/atom+xml' })
				content = ''
				if req.headers['accept'] && req.headers['accept'].indexOf('text/html') >= 0
					content = 'encode'
				blog.find content, (result)->
					res.render 'atom/feeds',
						host		:	app.host
						title		:	result.title
						updated	:	result.updated
						posts		:	result.posts

	app.get '/api/atom/feeds', processGetFeeds
	app.get '/api/atom/feeds/:public', processGetFeeds
						
	app.post '/api/atom/feeds', authorize, (req, res) -> 
		parser = new xml2js.Parser()  
		parser.parseString req.rawBody, (err, result) -> 
			blog.create
				posts : [{
					title   		: result.entry.title[0]._
					body    		: result.entry.content[0]._
					author 			: 'Mehfuz Hossain'
					categories 	: parseCategory result.entry
				}], (result)->
					location = app.host + 'api/atom/entries/' + result._id
					res.header({
						'Content-Type'	: req.headers['content-type'] 
						'Location'			: location
						})
					# post is created.
					res.statusCode = 201
					res.render 'atom/entries', 
						post : result
						host  : app.host 
			
	app.get '/api/atom/entries/:id', (req, res) ->
		res.header({'Content-Type': 'application/xml' })
		blog.findPostById req.params.id, (result)->
				res.header({'Content-Type': 'application/atom+xml' })
				if req.headers['accept'] && req.headers['accept'].indexOf('text/html') >=0
					result.body = helper.htmlEscape(settings.format(result.body))
				res.render 'atom/entries', 
					post : result
					host  : app.host

	app.put '/api/atom/entries/:id',authorize, (req, res)->
			parser = new xml2js.Parser()
			parser.parseString req.rawBody, (err, result) ->
				blog.updatePost 
					id		:	req.params.id
					title	:	result.entry.title[0]._ 
					body	:	result.entry.content[0]._
					categories	: parseCategory result.entry, (result)->
				  res.render 'atom/entries', 
						post : result
						host  : app.host

	app.delete '/api/atom/entries/:id', authorize , (req, res)->
		blog.deletePost req.params.id,()->
			res.end()

	app.get '/rsd.xml', (req, res) ->
					res.header({'Content-Type': 'application/xml' })
					res.render 'rsd',
						host : app.host
						engine : settings.engine
			 
	findMostRecent = (callback)->
		blog.findMostRecent (result)->
			callback(result)
			return

	app.get '/:year/:month/:title', (req, res) ->
		link = util.format("%s/%s/%s", req.params.year, req.params.month, req.params.title)
		# get the most recent posts, to be displayed on the right
		recent = [] 
		findMostRecent (result)=>
			recent = result
			blog.findPost link, (result)->  
				result.host = app.host
				result.recent = recent
				res.render 'post', result
			return
								
	app.get '/', (req, res) ->
		recent = []
		findMostRecent (result)=>
			recent = result
			blog.find 'sanitize', (result) -> 
				result.host = app.host
				result.recent = recent
				res.render 'index', result
			return
				
module.exports = routes
