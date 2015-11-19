// A simple time parser that takes seconds and converts to something like
// 03:30 or 1:24:56, etc

angular.module('amliu.timeParser', [])

.service('timeParser', function() {
    function addZeroPadding(time) {
        return (time < 10) ? "0"+time : time;
    };
    return {
        convertSeconds: function(seconds) {
            var h = 0; var m = 0; var s = 0;
            if (seconds >= 3600) { // Greater than an hour
                h = Math.floor(seconds / 3600);
                seconds = seconds % 3600;
            }
            m = Math.floor(seconds / 60);
            s = Math.floor(seconds % 60);
            if (h > 0) {
                return addZeroPadding(h) + ":" + addZeroPadding(m) + ":" + addZeroPadding(s);
            } else {
                return addZeroPadding(m) + ":" + addZeroPadding(s);
            }
        }
    }
})