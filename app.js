var express = require('express');
var bodyParser = require('body-parser');
var status = require('./status');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var router = express.Router();

router.get('/router-status', function (req, res, next) {
  status.getActionAndStatus().then(function (response) {
    res.json({ selected: response.selected });
  }).catch(function (err) {
    res.json({ error: 'First failure, try again'});
  });
});

router.post('/router-set', function (req, res, next) {
  var queryAction = req.body.action;
  var postAction = status.actions[queryAction];
  status.getActionAndStatus().then(function (response) {
    // { selected[string], url[string] (I wish I had es6..)
    var selected = response.selected;
    var url = response.url;

    if (selected === postAction) {
      res.json({ status: 'OK', message: 'Option was already selected' });
      return;
    }

    status.setRouterAction(postAction, url).then(function (message) {
      if (message === 'OK') {
        res.json({
          status: 'OK', message: 'Router set to ' + queryAction
        })
      }
    });

  });
});

app.use('/api', router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.listen(3000);

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err);
  res.end();
});


module.exports = app;
