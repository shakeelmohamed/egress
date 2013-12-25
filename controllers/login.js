(function(){
    module.exports = function(getViewData){
        return {
            get: function(req, res) {
                if (req.session.user_id) {
                    //Send user to the account page if they're authorized
                    //TODO: make this a middleware function for code reuse
                    res.redirect('account');
                }
                else {
                    res.render('login', getViewData('Login', 'login'));
                }
            },
            post: function(req, res) {
                //TODO
                var pg = require('pg');
                var post = req.body;
                //TODO: add some data validation: email, password format, string length, sql sanitize
                pg.connect(process.env.DATABASE_URL, function (err, client) {
                    if (err) {
                        return console.error('could not connect to postgres', err);
                    }
                    if(post.login == 'login')
                    {
                        //TODO: this select should only get one result, but let's be explicit and limit results to 1
                        client.query("SELECT * from users where username='"+post.user+"'", function (err, result) {
                            if (err || result.rows.length === 0) {
                                res.render('login', getViewData('Login', 'login', req.session.user_id, 'Error: login failed'));
                                client.end();
                            }
                            else {
                                if ( bcrypt.compareSync(post.password, result.rows[0].secret) ) {
                                    req.session.user_id = post.user;
                                    res.redirect('/account');
                                }
                                else {
                                    res.render('login', getViewData('Login', 'login', req.session.user_id, 'Error: login failed'));
                                }
                                client.end();
                            }
                        });
                    }
                    else {
                        res.render('login', getViewData('Login', 'login', req.session.user_id, 'Error: login failed, unexpected form data'));
                    }
                });
            }
        }
    }
})();