angular.module('breakpoint.services', [])

.service('parse', function() {
  Parse.initialize("YTjJBDfZmA8fdIC3gEZT9p7n2fp7lkg6tHYBMZ6N", "uLeLdclSTyOxKiJvO8B3CAaY8y0stiZWVlEJpG3q");
  return {
    createVideo: function(videoDetails) {
      var Video = Parse.Object.extend("Video");
      var video = new Video();
      video.set("yt_title", videoDetails.title);
      video.set("yt_videoId", videoDetails.youtubeVideoId);
      video.categories = []

      var Category = Parse.Object.extend("Category");
      var categoryQuery = new Parse.Query(Category);
      categoryQuery.equalTo("name",videoDetails.category);
      var subcategoryQuery = new Parse.Query(Category);
      subcategoryQuery.equalTo("name",videoDetails.subcategory);
      // get ID for category and add it to categories array for video
      return categoryQuery.first().then(function(category) {
        video.categories.push(category.id);
        return subcategoryQuery.first()
      // get ID for subcategory and add it to categories array for video, then save the video
      }).then(function(subcategory) {
        video.categories.push(subcategory.id)
        video.set("categories", video.categories);
        return video.save();
      // once the video is saved, add it to the videos array for all the categories its in 
      }).then(function(video) {
        angular.forEach(video.categories, function(category) {
          var query = new Parse.Query(Category);
          query.get(category, {
            success: function(category) {
              category.addUnique("videos", video.id);
              category.save();
            },
            error: function(error) {
              console.log(error)
            }
          }); // query.get
        }) // forEach
        return video
      }) //, function(error) {
      //   console.log(error);
      // })
    },

    createSet: function(youtubeVideoId) {
      var Video = Parse.Object.extend("Video");
      // get video that matches videoId
      var query = new Parse.Query(Video).equalTo("yt_videoId", youtubeVideoId);
      return query.first().then(function(video) {
        var videoId = video.id;
        return videoId
      }).then(function(videoOId) {
        var Set = Parse.Object.extend("Set");
        var set = new Set();
        set.set("videoOId", videoOId);
        set.set("videoId", videoOId)
        return set.save();
      });
    },

    createBreakpoint: function(breakpointDetails) {
      var Breakpoint = Parse.Object.extend("Breakpoint");
      var breakpoint = new Breakpoint();
      breakpoint.set("time", breakpointDetails.time);
      breakpoint.set("title", breakpointDetails.title);
      breakpoint.set("description", breakpointDetails.description);
      breakpoint.set("setId", breakpointDetails.setId);
      breakpoint.save();
    },

    // For categories that contain breakpointed videos
    getCategories: function() {
      var Category = Parse.Object.extend("Category");
      var query = new Parse.Query(Category).select(["name","url", "image_url","id","children"]).equalTo("hierarchy",1).exists("videos");
      return query.find();      
    },

    // For subcategories that contain breakpointed videos
    getSubcategories: function(category) {
      var Category = Parse.Object.extend("Category");
      var query = new Parse.Query(Category).equalTo("parent",category).exists("videos").select(["name","url","image_url","id"]);
      return query.find();
    },

    getAllCategories: function() {
      var Category = Parse.Object.extend("Category");
      var query = new Parse.Query(Category).select(["name","url", "image_url","id","children"]).equalTo("hierarchy",1);
      return query.find();      
    },

    getAllSubcategories: function(category) {
      var Category = Parse.Object.extend("Category");
      var query = new Parse.Query(Category).equalTo("parent",category).select(["name","url","image_url","id"]);
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

    getVideo: function(youtubeVideoId) {
      var Video = Parse.Object.extend("Video");
      // get video that matches videoId
      var query = new Parse.Query(Video).equalTo("yt_videoId", youtubeVideoId).select(["yt_title", "yt_videoId"]);
      return query.first();
    },

    getYTVideoIDs: function() {
      var Video = Parse.Object.extend("Video");
      var query = new Parse.Query(Video).select(["yt_videoId"]);
      return query.find().then(function(videos) {
        var YTVideoIDs = []
        angular.forEach(videos, function(video) {
          YTVideoIDs.push(video.attributes.yt_videoId)
        })
        // console.log(YTVideoIDs)
        return YTVideoIDs;
      })
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
  youtubeParams = {};
  youtubeParams.key = 'AIzaSyCTxnCjUXY9Yqi0FRytJtDoTVG55tv5Eds';
  return {
    search: function(searchTerms) {
      // youtubeParams = {};
      // youtubeParams.key = 'AIzaSyCTxnCjUXY9Yqi0FRytJtDoTVG55tv5Eds';
      youtubeParams.type = 'video';
      youtubeParams.maxResults = '20';
      youtubeParams.part = 'id,snippet';
      youtubeParams.q = searchTerms;
      youtubeParams.order = 'date';
      return $http.get('https://www.googleapis.com/youtube/v3/search', {params:youtubeParams})
    },
    getVideo: function(youtubeVideoId) {
      youtubeParams.part = 'snippet,contentDetails';
      youtubeParams.id = youtubeVideoId;
      return $http.get('https://www.googleapis.com/youtube/v3/videos', {params: youtubeParams})
    }
  }
})