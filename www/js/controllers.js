
angular.module('breakpoint.controllers', ['breakpoint.services', 'amliu.timeParser'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopup, $sce, $ionicScrollDelegate, $state) {
	$scope.goToCategories = function() {
		$state.go('app.browse')
	}

	$scope.search = {};
	// Opens search popup when search button in nav bar clicked
	$scope.openSearch = function() {
		$ionicPopup.show({
			title: 'Search',
			templateUrl: 'templates/modals/search.html',
			scope: $scope,
			buttons: [{
				text: 'Cancel',
				type: 'button-default',
				onTap: function(e) {
					return true;
				}, 
			},
			{
				text: '<i class="icon ion-search">',
				type: 'button-royal',
				onTap: function(e) {
					// Perform search 
					$state.go('app.search',{q: $scope.search.value});
					// Clear search value 
					$scope.search = {};
				}, 
			}]
		}).then(function(popup) {
			$scope.searchModal = popup;
		})
	}

	// Create login modal that gets opened when login button in nav clicked
	$ionicModal.fromTemplateUrl('templates/modals/login.html', {
		scope: $scope
	}).then(function(modal) {
		$scope.loginModal = modal
	})

	// Opens login modal when login button in nav bar clicked
	$scope.openLogin = function() {
		$scope.loginModal.show();
	}

	$scope.closeLogin = function() {
		$scope.loginModal.hide();
	}

	$scope.doLogin = function() {
		$scope.closeLogin();
	}

	// Use to trust concatenated URLs in templates (ex: youtube.com/+video_id)
	$scope.trust = function(URL) {
    	return $sce.trustAsResourceUrl(URL);
  	}

  	$scope.scrollTop = function() {
    	$ionicScrollDelegate.scrollTop();
  };
})

.controller('LandingCtrl', function($scope) {
})

.controller('BrowseCtrl', function($scope, parse){

	parse.getCategories().then(function(categories){
		$scope.categories = categories;
		})
	})


.controller('SubcategoryCtrl', function($scope, $stateParams, parse){
	var category = $stateParams.categoryName;
	parse.getSubcategories(category).then(function(subcategories){
		$scope.subcategories = subcategories;
	})
	
})


.controller('CategoryCtrl', function($scope, $stateParams, parse) {
	// get category name from params so can know which category 
	var category = $stateParams.subcategory;
	var parent = $stateParams.categoryName;
	parse.getCategory(category).then( function(category) {
		$scope.category = category;
	})
	parse.getVideosForCategory(category).then( function(videos) {
		$scope.videos = videos;
	})

	$scope.doRefresh = function() {
		parse.getVideosForCategory(category).then( function(videos) {
			$scope.videos = videos;
		})
    	$scope.$broadcast('scroll.refreshComplete');
    	$scope.$apply();
    }
})


.controller('SearchCtrl', function($scope, $http, $stateParams, youtubeData, parse) {
	$scope.videos = [];

	youtubeData.search($stateParams.q).success(function(response) {
		parse.getYTVideoIDs().then(function(breakpointedVideos) {
			angular.forEach(response.items, function(video) {
				// Check to see if video is already breakpointed by checking 
				// for inclusion of youtube video ID in breakpointed videos
				// if it doesn't exist in breakpointedVideos indexOf evaluates to -1
				video.isBreakpointed = (breakpointedVideos.indexOf(video.id.videoId) !== -1);
				$scope.videos.push(video);
			})
		}); 
	})

	$scope.all = true;
	$scope.breakpointed = true;

	$scope.showAll = function() {
		$scope.all = true;
	}

	$scope.showBreakpointed = function() {
		$scope.all = false;
	}
})

.controller('VideoCtrl', function($window, $rootScope, $scope, $stateParams, parse, timeParser) {

    $scope.timeParser = timeParser;
    $scope.playMode = "PM_PUSH";
    // $scope.videoId = $stateParams.videoId;

  parse.getVideo($stateParams.youtubeVideoId).then(function(video) {
    $scope.videoId = video.id;
  })
  
  $scope.youtubeVideoId = $stateParams.youtubeVideoId;

  document.addEventListener("deviceready", onDeviceReady, false);
  function onDeviceReady() {
      console.log("READY!");
      $scope.changeOriantationLandspace = function() {
          screen.lockOrientation('landscape');
      }
       
      $scope.changeOriantationPortrait = function() {
          screen.lockOrientation('portrait');
      } 
  }

  // Page has entered
  $scope.$on('$ionicView.beforeEnter', function() {
      parse.getVideo($stateParams.youtubeVideoId).then(function(video) {
          $scope.video = video;
          // $scope.$broadcast('INIT', video.get("yt_videoId"));
          $scope.$broadcast('INIT', $stateParams.youtubeVideoId);
          // Loading sets, breakpoints, sorting breakpoints in order of time
          parse.getSetsForVideo(video.id).then(function(sets) {
              // For now, just default to first set always
              if (sets[0]) {
              	parse.getBreakpointsForSet(sets[0].id).then(function(set_breakpoints) {
                  $scope.breakpoints = set_breakpoints;
                  $scope.breakpoints.sort(function(a, b) {
                      if (a.get("time") < b.get("time"))
                          return -1;
                      if (a.get("time") > b.get("time"))
                          return 1;
                      return 0;
                  })
                  // Pass sorted breakpoints into the youtube directive too
                  $scope.$broadcast('LOAD_BPS', $scope.breakpoints);
              	})
              } 
          })
      })
  });

  // When the page is "popped" and we go back
  $scope.$on('$stateChangeStart', function(event) {
    // For some we don't have access to scope, so just use rootscope
    $rootScope.$broadcast("LEAVE_VIDEOSHOW");
  });

  // Handles all events that don't require additional arguments
  $scope.sendControlEvent = function (event_name) {
    this.$broadcast(event_name);
  };

  // Need to figure this out ... not working yet
  // For some reason the cordova screen oritentaion plugin works above but not here
  $scope.fullscreen = function() {
      screen.lockOrientation('landscape');
      this.$broadcast("FULLSCREEN");
  }

    $scope.changePlayMode = function() {
        console.log($scope.playMode);
        var selectEl = document.querySelector(".player-controls#"+$scope.videoId+" .playmode select");
        var newPlaymode = selectEl.selectedOptions[0].value;
        $rootScope.$broadcast("CHANGE_PLAYMODE", newPlaymode);
    }

  $scope.leave_fullscreen = function() {
    screen.lockOrientation('portrait');
    this.$broadcast("LEAVE_FULLSCREEN");
  }

})

.controller('CreateBreakpointVideoCtrl', function($scope, $stateParams, $state, parse, youtubeData) {
	$scope.video = {};

	$scope.video.youtubeVideoId = $stateParams.youtubeVideoId;

	youtubeData.getVideo($scope.video.youtubeVideoId).success(function(response) {
		var videoDetails = response.items[0].snippet;
		$scope.video.defaultTitle = videoDetails.title;
		$scope.video.description = videoDetails.description;
		$scope.video.title = videoDetails.title;
	})

	$scope.showInstructions = true;
	$scope.showCreateForm = false;

	$scope.activateShowInstructions = function() {
		$scope.showInstructions = true;
		$scope.showCreateForm = false;
	} 

	$scope.activateShowCreateForm = function() {
		$scope.showInstructions = false;
		$scope.showCreateForm = true;
	}

	parse.getCategories().then(function(parseCategoryObjects) {
		$scope.categories = []
		angular.forEach(parseCategoryObjects, function(parseCategoryObject) {
			$scope.categories.push(parseCategoryObject.attributes.name)
		})
	})

	$scope.categoryChanged = function(selectedCategory) {
		$scope.video.category = selectedCategory;
		$scope.video.subcategory = '';
		parse.getSubcategories(angular.lowercase(selectedCategory)).then(function(parseSubcategoryObjects) {
			$scope.subcategories = [];
			angular.forEach(parseSubcategoryObjects, function(parseSubcategoryObject) {
				$scope.$apply(function() {
					$scope.subcategories.push(parseSubcategoryObject.attributes.name);
				})
			})
		})
	}

	$scope.createVideo = function(video) {
		parse.createVideo(video);
		$state.go('app.addBreakpoints',{youtubeVideoId: $scope.video.youtubeVideoId});
	}
})

.controller('AddBreakpointsCtrl', function($scope, $stateParams, parse) {
	$scope.youtubeVideoId = $stateParams.youtubeVideoId

	parse.getVideo($scope.youtubeVideoId).then(function(video) {
        $scope.video = video;
    });

    // Gets time that the video is currently at 
  	$scope.getCurrentTime = function() {
    	this.$broadcast('getCurrentTime');
  	};	
})

