angular.module('breakpoint.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicPopup) {
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
})

.controller('LandingCtrl', function($scope) {
})

.controller('BrowseCtrl', function($scope) {
	// hardcoding these until we use Parse 
	$scope.categories = [
		{id: 1, name: 'Recipes', url: 'recipes'},
		{id: 2, name: 'Lectures', url: 'lectures'},
		{id: 3, name: 'Fix It Yourself', url: 'fix-it-yourself'},
		{id: 4, name: 'Music', url: 'music'},
	]
})

.controller('CategoryCtrl', function($scope, $stateParams) {
	// get category name from params so can know which category 
	var category = $stateParams.categoryName;
	getCategory(category);

	function getCategory(name) {
		// hardcoding these until we use Parse 
		categories = [
			{id: 1, name: 'Recipes', url: 'recipes'},
			{id: 2, name: 'Lectures', url: 'lectures'},
			{id: 3, name: 'Fix It Yourself', url: 'fix-it-yourself'},
			{id: 4, name: 'Music', url: 'music'},
		]

		categories.forEach( function(category) {
			if (category.url == name) {
				$scope.category = category;
			}
		})
	}
})