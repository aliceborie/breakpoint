angular.module('breakpoint.controllers', ['breakpoint.player'])

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