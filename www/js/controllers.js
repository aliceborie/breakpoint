
angular.module('breakpoint.controllers', ['breakpoint.services'])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopup, $sce) {
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
})

.controller('LandingCtrl', function($scope) {
})

.controller('BrowseCtrl', function($scope, parse) {
	// hardcoding these until we use Parse 
	// $scope.categories = [
	// 	{id: 1, name: 'Recipes', url: 'recipes'},
	// 	{id: 2, name: 'Lectures', url: 'lectures'},
	// 	{id: 3, name: 'Fix It Yourself', url: 'fix-it-yourself'},
	// 	{id: 4, name: 'Music', url: 'music'},
	// ]

	parse.getCategories().then( function(categories) {
		console.log(categories)
		$scope.categories = categories;
	})
})

.controller('CategoryCtrl', function($scope, $stateParams, parse) {
	// get category name from params so can know which category 
	var category = $stateParams.categoryName;
	
	parse.getCategory(category).then( function(category) {
		console.log(category);
		$scope.category = category;
	})
	parse.getVideosForCategory(category).then( function(videos) {
		console.log(videos);
		$scope.videos = videos;
	})

})

.controller('VideoCtrl', function($rootScope, $scope, $stateParams, parse) {

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

    $scope.yt = {
        width: 600, 
        height: 480
    }

    // Handles all events that don't require additional arguments
    $scope.sendControlEvent = function (event_name) {
        this.$broadcast(event_name);
    };

})


