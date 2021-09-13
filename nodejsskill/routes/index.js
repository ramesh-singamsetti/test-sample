var express = require('express');
var router = express.Router();
var axios = require('axios')

const convertSecondsToHms = (input) => {
  return new Date(input * 1000).toISOString().substr(11, 8)
}

const checkThumbnailUrl = (url) => {
  if (url.includes('static-ottera.com') && url.includes('/widescreen/')) return true;
  return false
}

const getCountryNames = (countries) => {
  return countries.map(country => country.name)
}

const getEntryId = (video_url) => {
  var subString = video_url.substring(
    video_url.indexOf("entryId/") + 18,
    video_url.indexOf("entryId/") + 8
  );
  return subString
}

router.get('/', function (req, res) {
  const { pageNumber, pageSize } = req.query;
  let start = pageNumber > 0 ? pageNumber - 1 : 0
  const API_END_POINT = `http://api.toongoggles.com/getobjects?version=12&object_type=video&video_type=feature&start=${start}&max=${pageSize}`
  axios.get(API_END_POINT)
    .then(function (response) {
      let { data: { num_results, objects } } = response
      let videos = objects.map(video => {
        let ad_breaks = video.ad_breaks && video.ad_breaks.map(item => convertSecondsToHms(item))
        return {
          id: video.id,
          name: video.name,
          ad_breaks,
          duration: convertSecondsToHms(video.duration),
          hasWidescreenThumbnail: checkThumbnailUrl(video.thumbnail_url),
          entryId: getEntryId(video.video_url),
          allowedCountries: video.allowed_countries.length ? getCountryNames(video.allowed_countries) : []
        }
      })

      videos.sort((a, b) => b.duration.localeCompare(a.duration))
      res.json({ numItemsReturned: num_results, videos })
    })
});

module.exports = router;
