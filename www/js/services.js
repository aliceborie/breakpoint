angular.module('breakpoint.services', [])

.service('parse', function() {
  Parse.initialize("YTjJBDfZmA8fdIC3gEZT9p7n2fp7lkg6tHYBMZ6N", "uLeLdclSTyOxKiJvO8B3CAaY8y0stiZWVlEJpG3q");
  return {
    getCategories: function() {
      var Category = Parse.Object.extend("Category");
      var query = new Parse.Query(Category).select(["name","url", "image_url","id","children"]).equalTo("hierarchy",1).exists("videos");
      return query.find();      
    },

    getSubcategories: function(category) {
      var Category = Parse.Object.extend("Category");
      var query = new Parse.Query(Category).equalTo("parent",category).exists("videos").select(["name","url","image_url","id"]);
      return query.find();
    },


    getVideosForCategory: function(categoryUrl) {
      var Category = Parse.Object.extend("Category");
      // get category that matches url 
      var query = new Parse.Query(Category).equalTo("url", categoryUrl);
      return query.first().then(function(category) {
        var categoryId = category.id;
        var Video = Parse.Object.extend("Video");
        var query = new Parse.Query(Video)
        // get all videos that that are part of the category
        query.equalTo("categories", categoryId);
        // select youtube title and youtube video ID 
        query.select(["yt_title","yt_videoId"])
        return query.find();
      })
    },

    getCategory: function(categoryUrl) {
      var Category = Parse.Object.extend("Category");
      // get category that matches url 
      var query = new Parse.Query(Category).equalTo("url", categoryUrl);
      return query.first()
    },

        getVideo: function(videoId) {
            var Video = Parse.Object.extend("Video");
            // get video that matches videoId
            var query = new Parse.Query(Video).equalTo("objectId", videoId).select(["yt_title", "yt_videoId"]);
            return query.first();
        },

        getVideoWithYT: function(videoId) {
            var Video = Parse.Object.extend("Video");
            // get video that matches yt_videoId
            var query = new Parse.Query(Video).equalTo("yt_videoId", yt_videoId);
            return query.first();
        },

        getSetsForVideo: function(videoOId) {
            var Set = Parse.Object.extend("Set");
            var query = new Parse.Query(Set).equalTo("videoOId", videoOId);
            return query.find();
        },

        getBreakpointsForSet: function(setId) {
            var Breakpoint = Parse.Object.extend("Breakpoint");
            var query = new Parse.Query(Breakpoint).equalTo("setId", setId).select(["description","time","title"]);
            return query.find();
        },
  }
})

.service('youtubeData', function($http) {
  return {
    search: function(searchTerms) {
      youtubeParams = {};
      youtubeParams.key = 'AIzaSyCTxnCjUXY9Yqi0FRytJtDoTVG55tv5Eds';
      youtubeParams.type = 'video';
      youtubeParams.maxResults = '20';
      youtubeParams.part = 'id,snippet';
      youtubeParams.q = searchTerms;
      youtubeParams.order = 'date';
      return $http.get('https://www.googleapis.com/youtube/v3/search', {params:youtubeParams})
    }
  }
})