function parseTime(v) {
	if(v.indexOf(':') == -1) {
		v = v+':'+'00';
	}
	return v;
}
var audio = new Audio('inc/66136__theta4__ding30603-spedup.wav');



var mainApp = angular.module('mainApp', ['ngAnimate']);

mainApp.controller('mainCtrl', function($scope, $http, $timeout) {

    function daemonFunc() {
	    //console.log("In daemonFunc()");
	    if($scope.isOn == true) {
		    remainingTimeMs = $scope.timeLength*1000 - $scope.timeOffset + $scope.dStart-Date.now();
		    refreshDisplay();
		    if(remainingTimeMs < 0 && alarmTriggered == false) {
			    alarmTriggered = true;
			    ringFunc();
		    }
		    $timeout(function() {
			    daemonFunc();
		    }, 100);
	    }
    }

    function ringFunc() {
	    if($scope.isOn == true && alarmTriggered == true) {
		    audio.play();
		    displayTimeInTitle = !displayTimeInTitle;
		    $timeout(function() {
			    ringFunc();
		    }, 5000);
	    }
    }

    function refreshDisplay() {
	    //console.log("In refreshDisplay()");
	    var remainingTimeSeconds = Math.abs(remainingTimeMs/1000);
	    signStr = (remainingTimeMs < 0 ? '-' : '');
	
	    minutes = Math.floor(remainingTimeSeconds/60).toString();
	    minutes = ((minutes.length == 1) ? '0' : '')+minutes
	    seconds = Math.floor(remainingTimeSeconds%60).toString();
	    seconds = ((seconds.length == 1) ? '0' : '')+seconds
	    //console.log(minutes+':'+seconds);
	    $scope.remainingTime = signStr+minutes+':'+seconds;
	    $scope.pageTitle = (displayTimeInTitle == true) ? "Chronometer: "+$scope.remainingTime : "Time is up!";
	    //console.log(alarmTriggered);

        /*
         * Set background image
         */
        document.getElementsByTagName('html')[0].style.backgroundImage = "url('" + $scope.payload.backgroundImage + "')";

        /*
         * Set quotes
         */
        var quotesBlock = document.getElementById('quotes');
        quotesBlock.innerHTML = '';
        for(var i = 0, I = $scope.payload.quotes.length; i <I; i+=1) {
            var quote = $scope.payload.quotes[i];
            quotesBlock.innerHTML += "<h1>"+ quote.title +"</h1>";
            if(quote.quote !=undefined) quotesBlock.innerHTML += '<p>' + quote.quote + '</p>';
        }

    }



	$scope.payload = {}
    try {
        $scope.payload = JSON.parse(decodeURIComponent(window.location.hash.substring(1)));
    } catch(e) {}
	
    $scope.displaySettings = false;
	$scope.isOn = false;
	$scope.remainingTime = null;
	$scope.timeOffsetMs = 0; // For hold mode
	$scope.dStart = null;
	$scope.stopStartLabel = "Start";
	remainingTimeMs = undefined;
	displayTimeInTitle = true;
	alarmTriggered = false;



	$scope.chronoStartStop = function() {
		if($scope.isOn == true) {
			chronoStop();
			$scope.stopStartLabel = "Start";
		}
		else {
			chronoStart();
			$scope.stopStartLabel = "Stop";
		}
	};

	function chronoStart() {
		$scope.dStart = Date.now();
		alarmTriggered = false;
		if($scope.isOn == false) {
			$scope.isOn = true;
			daemonFunc();
		}
		displayTimeInTitle = true;		
	}

	function chronoStop() {
		$scope.timeOffset = $scope.timeLength*1000-remainingTimeMs;
		displayTimeInTitle = true;
		alarmTriggered = false;
		$scope.isOn = false;
	}
	
	$scope.chronoReset = function(noConfirm) {
        var action = function() {
            chronoStop();
            $scope.stopStartLabel = "Start";
            $scope.timeOffset = 0;
            remainingTimeMs = $scope.timeLength*1000;
            displayTimeInTitle = true;
            alarmTriggered = false;

            /*
             * Default value for timing + parsing
             */
            if($scope.payload.timeLengthDisplayed == undefined) $scope.payload.timeLengthDisplayed = '30:00';

            /*
             * Default value for quotes
             */
            if($scope.payload.quotes == undefined) $scope.payload.quotes = [
                {title: "Mental contrasting", quote: "Think about where you are now and contrast it with what you want to achieve."},
                {title: "Focus on process, not product"}
            ];

            /*
             * Default value for background
             */
            if($scope.payload.backgroundImage == undefined) $scope.payload.backgroundImage = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Messier51_sRGB.jpg/1280px-Messier51_sRGB.jpg';

            /*
             * Default value for ask confirm
             */
            if($scope.payload.askConfirmReset == undefined) $scope.payload.askConfirmReset = false;
            $scope.askConfirmReset = $scope.payload.askConfirmReset;

            /*
             * Default value for stoppable
             */
            if($scope.payload.stoppable == undefined) $scope.payload.stoppable = true;
            $scope.stoppable = $scope.payload.stoppable;

            refreshDisplay();
        }

        if($scope.askConfirmReset == true && noConfirm != true) {
            var confirmStatus = confirm("Do you really want to stop and reset the chrono?");
            if(confirmStatus == true) action();
        }
        else action();
	};

	$scope.chronoSetNewTimeCountAndReset = function() {
		$scope.payload.timeLengthDisplayed = parseTime($scope.payload.timeLengthDisplayed);

		var timeLengthDisplayedArr = $scope.payload.timeLengthDisplayed.split(':');

        var obj = 
		window.location = window.location.pathname+'#'+encodeURIComponent(JSON.stringify($scope.payload));
		$scope.timeLength = parseInt(timeLengthDisplayedArr[0])*60+parseInt(timeLengthDisplayedArr[1]);
		$scope.chronoReset(true);
	};
	

    $scope.deleteQuote = function(index) {
        $scope.payload.quotes.splice(index, 1);
    }

    $scope.addQuote = function() {
        $scope.payload.quotes.push({title:"", quote:""});
    }

	$scope.chronoSetNewTimeCountAndReset();
	refreshDisplay();

	window.onbeforeunload = confirmExit;
	function confirmExit() {
		if($scope.isOn == true) {
			return "The chronometer is running. Do you really want to close it?";
		}
	}

});


