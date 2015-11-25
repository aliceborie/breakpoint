
angular.module('breakpoint.controllers', ['breakpoint.services', 'amliu.timeParser'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopup, $sce, $ionicScrollDelegate) {
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
					return true;
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


.controller('VideoCtrl', function($window, $rootScope, $scope, $stateParams, parse, timeParser) {

    $scope.timeParser = timeParser;

    $scope.videoId = $stateParams.videoId;

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

    // Page has enetered
    $scope.$on('$ionicView.beforeEnter', function() {
        parse.getVideo($stateParams.videoId).then(function(video) {
            $scope.video = video;
            $scope.$broadcast('INIT', video.get("yt_videoId"));
            // Loading sets, breakpoints, sorting breakpoints in order of time
            parse.getSetsForVideo(video.id).then(function(sets) {
                // For now, just default to first set always
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

    $scope.leave_fullscreen = function() {
        screen.lockOrientation('portrait');
        this.$broadcast("LEAVE_FULLSCREEN");
    }

})

