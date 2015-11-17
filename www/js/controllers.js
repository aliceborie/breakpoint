
angular.module('breakpoint.controllers', ['breakpoint.services', 'breakpoint.player'])

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

  	// $scope.top = function(){
  	// 	$scope.scrollTop;
  	// }
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
	
	// getCategory(category);
	// function getCategory(name) {
	// 	// hardcoding these until we use Parse 
	// 	categories = [
	// 		{id: 1, name: 'Recipes', url: 'recipes'},
	// 		{id: 2, name: 'Lectures', url: 'lectures'},
	// 		{id: 3, name: 'Fix It Yourself', url: 'fix-it-yourself'},
	// 		{id: 4, name: 'Music', url: 'music'},
	// 	]

	// 	categories.forEach( function(category) {
	// 		if (category.url == name) {
	// 			$scope.category = category;
	// 		}
	// 	})
	// }
})

.controller('VideoCtrl', function($scope, $stateParams, testFactory) {

    
    $scope.breakpoints = [
        {id: 1, time: 0},
        {id: 2, time: 1},
        {id: 3, time: 10}
    ]

    $scope.$on( "$ionicView.enter", function( scopes, states ) {


        document.getElementById("player").innerHTML = "TEST";

        // $("div#player").text("TEST");
    });

    $scope.init = function() {
        console.log("init");
    }

    console.log(testFactory.Hello());
})