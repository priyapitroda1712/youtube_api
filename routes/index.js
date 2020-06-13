var express = require('express');
var app = express();
var router = express.Router();
var _ = require('underscore');
var youtube = require('../library/googleyoutube');
var youtube = new youtube();



router.get('/', function (req, res) {
  var code = (req.query.code) ? req.query.code : '';
  if (!youtube.isTokenExists()) {
    if (!_.isEmpty(code)) {
      tokens = youtube.getToken(code);

      res.redirect('/welcome');
    } else {
      var authURL = youtube.getAuthUrl();
      res.render('index', { title: 'Express', 'authURL': authURL });
    }
  } else {
    res.status(200).redirect('/welcome');
  }
});

router.get('/welcome', function (req, res) {
  var options = {
    "part": "contentDetails,id,snippet,status",
  };

  youtube.getAllVideos(options, function (err, lres) {
    if (err) {
      //console.log('Error while getting video list', err);
    } else {
      //console.log('\n Video list response got \n', JSON.stringify(lres));
      res.render('welcome', { title: 'Youtube Playlist Items', allVideos: lres });
    }
  });

  //res.render('welcome', { title: 'Express', 'command':'node scripts/youtube.js'});
});

router.post("/playlistitem", function (req, res) {
  var status = req.body.new_status;
  var selected_videos = req.body.selected_videos.split(',');
  var noOfSuccessfullyChanged = 0;
  if (selected_videos.length > 0 && status) {
    var options = {
      'privacyStatus': status,
    }
    selected_videos.forEach(function (video_id) {
      options.id = video_id

      youtube.changeVideoStatus(options, function (err, lres) {
        if (err) {
        } else {
          noOfSuccessfullyChanged = noOfSuccessfullyChanged + 1;
        }
      });
    });
    return res.send({ 'status': 'success', 'message': selected_videos.length + ' video(s) status changed successfully' });
  } else {
    return res.send({ 'status': 'error', 'message': 'Error while changing video status' });
  }
});

module.exports = router;