angular.module('breakpoint.directives', ['breakpoint.services'])

.directive('navButtons', function() {
	return {
		templateUrl: 'directives/nav_buttons.html'
	}
})


// http://blog.oxrud.com/posts/creating-youtube-directive/
.directive('youtube', function($window, parse) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@"
    },

    template: '<div></div>',

    link: function(scope, element) {

        var player; // YT Javascript iframe
        var breakpoints = []; // Array of Parse Breakpoint Objs
        var current = 0;

        // --------------------------------------------------
        // INITIALIZATION

        // We wrap the youtube initialization in an event listener because we don't know when parse
        // will get back to us and let us know videoId and youtubeID
        scope.$on('INIT', function(event, data) {

            // Initializing the YT Player
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            $window.onYouTubeIframeAPIReady = function() {
                player = new YT.Player(element.children()[0], {
                    playerVars: {
                        autoplay: 0,
                        html5: 1,
                        theme: "light",
                        modesbranding: 0,
                        color: "white",
                        iv_load_policy: 3,
                        showinfo: 1,
                        controls: 1
                    },
                    height: scope.height,
                    width: scope.width,
                    videoId: data, 
                });
            }
        });

        // Loading in Sets and Breakpoints from controller
        scope.$on('LOAD_BPS', function(event, data) {
            breakpoints = data;
        })


        // --------------------------------------------------
        // PLAYER CHANGES

        scope.$watch('height + width', function(newValue, oldValue) {
            if (newValue == oldValue) {
                return;
            }
            player.setSize(scope.width, scope.height);
        });


        // --------------------------------------------------
        // PLAYER EVENT LISTENERS

        scope.$on('STOP', function () {
            player.seekTo(0);
            player.stopVideo();
        });

        scope.$on('PLAY', function () {
            player.playVideo();
        }); 

        scope.$on('PAUSE', function () {
            player.pauseVideo();
        }); 

        scope.$on('FORWARD', function() {
            increaseCurrent();
            player.seekTo(breakpoints[current].get("time"), true);
        });

        scope.$on('BACK', function() {
            decreaseCurrent();
            player.seekTo(breakpoints[current].get("time"), true);
        });

        scope.$on('REPEAT', function(event, data) {
            var currentTime = player.getCurrentTime();
            if (currentIsSynced(currentTime)) {
                player.seekTo(breakpoints[current].get("time"), true);
            } else {
                 // Player scrubbed or skipped sections, meaning our current pointer is no longer correct
                findCurrent(currentTime);
            }
            player.seekTo(breakpoints[current].get("time"), true);
        });


        // --------------------------------------------------
        // METHODS

        function increaseCurrent() {
            current++;
            current = current % breakpoints.length;
        }
        function decreaseCurrent() {
            current--;
            if (current < 0) {
                current = breakpoints.length - 1;
            }
        }

        // Given current time, returns true if current is pointing to right BP 
        // (the closest one that is less than current time)
        function currentIsSynced(currentTime) {
            var currBP = breakpoints[current].get("time");
            if (current !== breakpoints.length - 1) {
                var forwardBP = breakpoints[current + 1].get("time");
                return ((currentTime < forwardBP) && (currentTime >= currBP));
            } else {
                return currentTime >= currBP;
            }
        }
        function findCurrent(currentTime) {
            for (var i = 0; i < breakpoints.length; i++) {
                if (i === breakpoints.length - 1) {
                    current = breakpoints.length - 1;
                    return;
                }
                var bpstart = breakpoints[i].get("time");
                var bpend = breakpoints[i+1].get("time");
                if ((currentTime < bpend) && (currentTime >= bpstart)) {
                    current = i;
                    return;
                }
            }
        }

    }  
  };
});