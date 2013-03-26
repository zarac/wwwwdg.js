exports.add = function(db) {
    return function(req, res) {
        console.log('req : ', req);
        console.log('res : ', res);
        var post = {
            name: req.body.name || 'Anonymous',
            message: req.body.message || '.. was here'
        }
        db.wallpost.insert(post, function(err, doc) {
            //* TODO if !xhr/json, re-route to index.html5
            res.json({ post: post });
            //db.wallpost.find().toArray(function(err, posts) {
                //res.render('index', { posts: posts });
            //});
        });
    };
};
