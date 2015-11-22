angular.module('breakpoint.directives', ['breakpoint.services', 'amliu.timeParser'])

.directive('navButtons', function() {
	return {
		templateUrl: 'directives/nav_buttons.html'
	}
})

// Youtube Directive, help from: http://blog.oxrud.com/posts/creating-youtube-directive/
.directive('youtube', function($window, parse, timeParser) {
  return {
    restrict: "E",

    scope: {
      height: "@",
      width: "@",
      videoid: "@", // Our video ID (not the yt one)
      player: "=", // iFrame YT player element

      duration: "=", // Duration of the YT video in seconds
      duration_formatted: "=", // Duration of video formatted

      currentBp: "=", // Current BP

      currentTime: "=", // Current time in seconds
      currentTime_formatted: "=", // Current time that's been formated 00:00:00
      currentTime_timeoutId: "=", // ID of the timeout event that updates current time

      breakpoints: "=", // Array of Parse Breakpoint Objs
      api_timeoutId: "=" // ID of the timeout event that rechecks yt API load state
    },
    templateUrl: '../templates/videoOverlay.html',

    link: function(scope, element) {

        // --------------------------------------------------
        // INITIALIZATION

        // We wrap the youtube initialization in an event listener because we don't know when parse
        // will get back to us and let us know videoId and youtubeID and also because we don't know when
        // the youtube API has loaded
        scope.$on('INIT', function(event, data) {
            scope.currentBp = 0;
            initPage(data);
            console.log(scope.videoid);
        });
        function initPage(data) {
            if ((typeof(YT) !== "undefined") && (typeof(YT.Player) !== "undefined")) {
                resetPlayer(data);
                resetAnnyang();
                annyang.start(); // Startup the listener
            } else { // Youtube API still not loaded, wait a second and try again
                console.log("TRY");
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

        scope.$on('PLAY', function() { playPlayer(); })
        scope.$on('PAUSE', function() { pausePlayer(); })
        scope.$on('STOP', function() { scope.stopPlayer(); })
        scope.$on('BACK', function() { scope.backPlayer(); })
        scope.$on('FORWARD', function() { scope.forwardPlayer(); })
        scope.$on('REPEAT', function() { scope.repeatPlayerSegment(); })

        scope.$on('FULLSCREEN', function() { scope.fullscreen(); })

        // --------------------------------------------------
        // VIDEO METHODS

        function resetAnnyang() {
            // Setup annyang words to listen for and methods to call for each
            var commands = {
                'play': scope.playPlayer,
                'stop' : scope.pausePlayer,
                'forward' : scope.forwardPlayer,
                'back' : scope.backPlayer,
                'repeat' : scope.repeatPlayerSegment
            };
            annyang.addCommands(commands); // Add our commands to annyang
        }

        function resetPlayer(data) {
            scope.player = new YT.Player(element.children()[0], {
                playerVars: {
                    autoplay: 0,
                    html5: 1,
                    theme: "light",
                    modestbranding: 1,
                    color: "white",
                    iv_load_policy: 3,
                    showinfo: 0,
                    controls: 0,
                    iv_load_policy: 3,
                    playsinline: 1
                },
                height: "100%",
                width: "100%",
                videoId: data,
                events: {
                    'onReady': onPlayerReady
                }
            });
        }
        function onPlayerReady() {
            scope.duration = scope.player.getDuration();
            scope.duration_formatted = timeParser.convertSeconds(scope.duration);
            scope.currentTime = scope.player.getCurrentTime();
            scope.currentTime_formatted = "00:00"
        }

        scope.stopPlayer = function stopPlayer() {
            scope.player.seekTo(0);
            scope.player.stopVideo();

            // Stop the current time event firer
            window.clearTimeout(scope.currentTime_timeoutId);
            scope.currentTime = scope.player.getCurrentTime();
        }

        scope.pausePlayPlayer = function pausePlayPlayer() {
            if (scope.player.getPlayerState() !== 1) { // Paused, need to play
                playPlayer();
            } else { // Playing, need to pause
                pausePlayer();
            }
        }

        function playPlayer() {
            scope.currentTime_timeoutId = setTimeout(refreshCurrentTime, 500);
            positionBreakpoints();
            scope.player.playVideo();
        }

        function pausePlayer() {
            window.clearTimeout(scope.currentTime_timeoutId);
            scope.player.pauseVideo();
        }

        scope.forwardPlayer = function forwardPlayer() {
            increaseCurrent();
            scope.player.seekTo(scope.breakpoints[scope.currentBp].get("time"), true);
            scope.currentTime = scope.player.getCurrentTime();
        }

        scope.backPlayer = function backPlayer() {
            decreaseCurrent();
            scope.player.seekTo(scope.breakpoints[scope.currentBp].get("time"), true);
            scope.currentTime = scope.player.getCurrentTime();
        }

        scope.repeatPlayerSegment = function repeatPlayerSegment() {
            var currentTime = scope.player.getCurrentTime();
            if (currentIsSynced(currentTime)) {
                scope.player.seekTo(scope.breakpoints[scope.currentBp].get("time"), true);
            } else {
                 // Player scrubbed or skipped sections, meaning our current pointer is no longer correct
                findCurrent(currentTime);
            }
            scope.player.seekTo(scope.breakpoints[scope.currentBp].get("time"), true);
            scope.currentTime = scope.player.getCurrentTime();
        }

        scope.fullscreen = function fullscreen() {
            positionBreakpoints();

            // Parent of the youtube tag is the scroller container. We use ID to ensure we grab the currently viewed page
            angular.element(document.getElementById(scope.videoid).parentNode).addClass("no-scroll");

            angular.element(document.getElementsByTagName("ion-view")).removeClass("has-header");
            angular.element(document.getElementsByTagName("ion-nav-bar")).addClass("hide");
            angular.element(document.getElementsByTagName("ion-footer-bar")).addClass("hide");

            angular.element(document.querySelectorAll("youtube#"+scope.videoid+" .yt_playoverlay")).removeClass("hide");
            angular.element(document.querySelector("youtube#"+scope.videoid)).addClass("fullscreen");
            positionBreakpoints();
        }

        scope.leave_fullscreen = function leave_fullscreen() {
            angular.element(document.getElementById(scope.videoid).parentNode).removeClass("no-scroll");

            angular.element(document.getElementsByTagName("ion-view")).addClass("has-header");
            angular.element(document.getElementsByTagName("ion-nav-bar")).removeClass("hide");
            angular.element(document.getElementsByTagName("ion-footer-bar")).removeClass("hide");

            angular.element(document.querySelectorAll("youtube#"+scope.videoid+" .yt_playoverlay")).addClass("hide");
            angular.element(document.querySelector("youtube#"+scope.videoid)).removeClass("fullscreen");
            positionBreakpoints();
        }

        scope.getCurrentTime = function getCurrentTime() {
            return scope.player.getCurrentTime();
        }

        function refreshCurrentTime() {
            scope.$apply(function() {
                console.log("GOOGO");
                scope.currentTime = scope.player.getCurrentTime();
                scope.currentTime_formatted = timeParser.convertSeconds(scope.currentTime);
            })
            scope.currentTime_timeoutId = setTimeout(refreshCurrentTime, 250);
        }

        // Used to watch when 
        scope.$watch("currentTime", function(newValue, oldValue) {
            console.log(scope.currentTime);
            if (scope.currentTime > 2) {
                console.log("AYYYY!!!!");
            }
        })

        // Used in the bottom player slider to get input from slider and set the video
        // to that location in seconds
        scope.setToSpot = function() {
            scope.player.seekTo(scope.currentTime, true);
            positionPlayedSegments(); // TODO -> MOVE THIS OUT LATER. Could probably do better in the watch above
        }



        // --------------------------------------------------
        // METHODS

        function increaseCurrent() {
            scope.currentBp++;
            scope.currentBp = scope.currentBp % scope.breakpoints.length;
        }
        function decreaseCurrent() {
            scope.currentBp--;
            if (scope.currentBp < 0) {
                scope.currentBp = scope.breakpoints.length - 1;
            }
        }

        // Given current time, returns true if current is pointing to right BP 
        // (the closest one that is less than current time)
        function currentIsSynced(currentTime) {
            var currBP = scope.breakpoints[scope.currentBp].get("time");
            if (scope.currentBp !== scope.breakpoints.length - 1) {
                var forwardBP = scope.breakpoints[scope.currentBp + 1].get("time");
                return ((currentTime < forwardBP) && (currentTime >= currBP));
            } else {
                return currentTime >= currBP;
            }
        }
        function findCurrent(currentTime) {
            for (var i = 0; i < scope.breakpoints.length; i++) {
                if (i === scope.breakpoints.length - 1) {
                    scope.currentBp = scope.breakpoints.length - 1;
                    return;
                }
                var bpstart = scope.breakpoints[i].get("time");
                var bpend = scope.breakpoints[i+1].get("time");
                if ((currentTime < bpend) && (currentTime >= bpstart)) {
                    scope.currentBp = i;
                    return;
                }
            }
        }

        // Repositions breakpoints to line up with the video's custom bottom player
        function positionBreakpoints() {
            var bottomplayer_width = document.querySelector("youtube#"+scope.videoid+" .bottom_player input").offsetWidth;
            for (var i = 0; i < scope.breakpoints.length; i++) {
                var breakpoint = scope.breakpoints[i];
                var position = Math.floor((breakpoint.get("time") / scope.duration) * bottomplayer_width);
                var breakpointEl = angular.element(document.querySelector("#"+breakpoint.id)).css("left", position+"px");
            }
        }

        // Repositions the darker violet bar that indicates already played/passed segments
        function positionPlayedSegments() {
            var bottomplayer_width = document.querySelector("youtube#"+scope.videoid+" .bottom_player input").offsetWidth;
            findCurrent(scope.currentTime);
            var breakpoint = scope.breakpoints[scope.currentBp];
            var playedWidth = Math.floor( (breakpoint.get("time") / scope.duration) * bottomplayer_width);
            angular.element(document.querySelector("youtube#"+scope.videoid+" .bottom_player .played")).css("width", playedWidth+"px");
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
