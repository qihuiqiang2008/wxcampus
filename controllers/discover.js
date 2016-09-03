/*!
 * nodeclub - controllers/topic.js
 */

/**
 * Module dependencies.
 */

var sanitize = require('validator').sanitize;

var at = require('../services/at');
var User = require('../proxy').User;
var Post = require('../proxy').Post;
var PostReply = require('../proxy').PostReply;
var PostLike = require('../proxy').PostLike;
var EventProxy = require('eventproxy');
var Util = require('../libs/util');
var School = require('../proxy').School;
var College = require('../proxy').College;

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */


exports.index = function (req, res, next) {
    if(req.session.user){
		console.log("you");
        School.getSchoolCacheById(req.session.user?req.session.user.location.school_id:"",function(err,school){
              res.render('front/discover/index',{school:school});
        })
    }else {
			console.log("meiyou");
        res.render('front/discover/index');
    }
};
function showdate(n)
{
    var uom = new Date(new Date()-0+n*86400000);
    return uom;
}

exports.top100 = function (req, res, next) {
    var query = {type: req.query.t};
    var page = parseInt(req.query.page, 10) || 1;
    page = page > 0 ? page : 1;
    var limit =20;
    query = {'type': req.query.t,'create_at':{$gt:new Date(showdate(-7))}};
    sort=[ [ 'like_count', 'desc' ],['top', 'desc' ],  [ 'create_at', 'desc' ] ];
    var options = { skip: (page - 1) * limit, limit: limit,sort:sort};
    var proxy = EventProxy.create('posts', 'pages',
        function (posts, pages) {
            res.render('front/discover/top100', {
                posts: posts,
                pages: pages,
                type: req.query.t,
                from: 'top100',
                current_page: page
            });
        });
    proxy.fail(next);
    Post.getPostsByQuery(query, options, function (err, posts) {
        posts.forEach(function (post, i) {
            if (post) {
                post.friendly_create_at = Util.format_date(post.create_at, true);
            }
            return post;
        });
        proxy.emit('posts', posts);
    })
    Post.getCountByQuery(query, proxy.done(function (count) {
        var pages = Math.ceil((count>100?100:count)/ limit);
        proxy.emit('pages', pages);
    }));
};
