angular.module('breakpoint.directives', ['breakpoint.services'])

.directive('navButtons', function() {
	return {
		templateUrl: 'directives/nav_buttons.html'
	}
})

// Youtube Directive, help from: http://blog.oxrud.com/posts/creating-youtube-directive/
.directive('youtube', function($window, parse) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@",
      player: "=", // iFrame YT player element
      current: "=", // Current BP
      breakpoints: "=", // Array of Parse Breakpoint Objs
      api_timeoutId: "=" // ID of the timeout event that rechecks yt API load state
    },

    template: '<div></div>',

    link: function(scope, element) {

        // --------------------------------------------------
        // INITIALIZATION

        // Retrieving the YT iFrame API
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        // We wrap the youtube initialization in an event listener because we don't know when parse
        // will get back to us and let us know videoId and youtubeID and also because we don't know when
        // the youtube API has loaded
        scope.$on('INIT', function(event, data) {
            scope.current = 0;
            initPage(data);
        });
        function initPage(data) {
            if (typeof(YT) !== "undefined") {
                resetPlayer(data);
                resetAnnyang();
                annyang.start(); // Startup the listener
            } else { // Youtube API still not loaded, wait a second and try again
                scope.api_timeoutId = setTimeout(function() {initPage(data);}, 1000);
            }
        }

        // Loading in Sets and Breakpoints from controller
        scope.$on('LOAD_BPS', function(event, data) {
            scope.breakpoints = data;
        })

        // An event that is emitted when the videoshow page is 'popped'
        scope.$on("LEAVE_VIDEOSHOW", function() {
            window.clearTimeout(scope.api_timeoutId); // Stop this timeout event
            stopPlayer();
            annyang.removeCommands(); // Reset annyang so it doesn't use the old player
            annyang.abort();
        })


        // --------------------------------------------------
        // PLAYER CHANGES

        scope.$watch('height + width', function(newValue, oldValue) {
            if (newValue == oldValue) {
                return;
            }
            scope.player.setSize(scope.width, scope.height);
        });


        // --------------------------------------------------
        // PLAYER EVENT LISTENERS

        scope.$on('STOP', function () { stopPlayer(); });
        scope.$on('PLAY', function () { playPlayer(); }); 
        scope.$on('PAUSE', function () { pausePlayer(); }); 
        scope.$on('FORWARD', function() { forwardPlayer(); });
        scope.$on('BACK', function() { backPlayer(); });
        scope.$on('REPEAT', function() { repeatPlayerSegment(); });

        // --------------------------------------------------
        // VIDEO METHODS

        function resetAnnyang() {
            // Setup annyang words to listen for and methods to call for each
            var commands = {
                'play': playPlayer,
                'stop' : pausePlayer,
                'forward' : forwardPlayer,
                'back' : backPlayer,
                'repeat' : repeatPlayerSegment
            };
            annyang.addCommands(commands); // Add our commands to annyang
        }

        function resetPlayer(data) {
            scope.player = new YT.Player(element.children()[0], {
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

        function stopPlayer() {
            scope.player.seekTo(0);
            scope.player.stopVideo();
        }

        function playPlayer() {
            scope.player.playVideo();
        }

        function pausePlayer() {
            scope.player.pauseVideo();
        }

        function forwardPlayer() {
            increaseCurrent();
            scope.player.seekTo(scope.breakpoints[scope.current].get("time"), true);
        }

        function backPlayer() {
            decreaseCurrent();
            scope.player.seekTo(scope.breakpoints[scope.current].get("time"), true);
        }

        function repeatPlayerSegment() {
            var currentTime = scope.player.getCurrentTime();
            if (currentIsSynced(currentTime)) {
                scope.player.seekTo(scope.breakpoints[scope.current].get("time"), true);
            } else {
                 // Player scrubbed or skipped sections, meaning our current pointer is no longer correct
                findCurrent(currentTime);
            }
            scope.player.seekTo(scope.breakpoints[scope.current].get("time"), true);
        }

        // --------------------------------------------------
        // METHODS

        function increaseCurrent() {
            scope.current++;
            scope.current = scope.current % scope.breakpoints.length;
        }
        function decreaseCurrent() {
            scope.current--;
            if (scope.current < 0) {
                scope.current = scope.breakpoints.length - 1;
            }
        }

        // Given current time, returns true if current is pointing to right BP 
        // (the closest one that is less than current time)
        function currentIsSynced(currentTime) {
            var currBP = scope.breakpoints[scope.current].get("time");
            if (current !== scope.breakpoints.length - 1) {
                var forwardBP = scope.breakpoints[scope.current + 1].get("time");
                return ((currentTime < forwardBP) && (currentTime >= currBP));
            } else {
                return currentTime >= currBP;
            }
        }
        function findCurrent(currentTime) {
            for (var i = 0; i < scope.breakpoints.length; i++) {
                if (i === scope.breakpoints.length - 1) {
                    scope.current = scope.breakpoints.length - 1;
                    return;
                }
                var bpstart = scope.breakpoints[i].get("time");
                var bpend = scope.breakpoints[i+1].get("time");
                if ((currentTime < bpend) && (currentTime >= bpstart)) {
                    scope.current = i;
                    return;
                }
            }
        }

    }  
  };
})

// Allow use of script tag on partials
// https://gist.github.com/subudeepak/9617483#file-angular-loadscript-js
// Use: <script type="text/javascript-lazy"></script>
.directive('script', function() {
    return {
      restrict: 'E',
      scope: false,
      link: function(scope, elem, attr) 
      {
        if (attr.type==='text/javascript-lazy') 
        {
          var s = document.createElement("script");
          s.type = "text/javascript";                
          var src = elem.attr('src');
          if(src!==undefined)
          {
              s.src = src;
          }
          else
          {
              var code = elem.text();
              s.text = code;
          }
          document.head.appendChild(s);
          elem.remove();
        }
      }
    };
})
//http://stackoverflow.com/questions/12197880/angularjs-how-to-make-angular-load-script-inside-ng-include