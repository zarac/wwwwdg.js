exports.html5 = function(db) {
    return function(req, res) {
        db.wallpost.find().toArray(function(err, posts) {
            res.render('index', { posts: posts });
        });
    };
};
