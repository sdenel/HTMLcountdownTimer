var mainApp = angular.module('mainApp', []);

mainApp.controller('mainCtrl', function($scope, $http, $timeout) {
	$scope.timeLengthDisplayed = '55:00';

	var audio = new Audio('66136__theta4__ding30603-spedup.wav');

	$scope.isOn = false;
	$scope.remainingTime = null;
	$scope.timeOffsetMs = 0; // For hold mode
	$scope.dStart = null;
	remainingTimeMs = undefined;
	displayTimeInTitle = true;
	alarmTriggered = false;


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
	}



	$scope.chronoStart = function() {
		$scope.dStart = Date.now();
		alarmTriggered = false;
		if($scope.isOn == false) {
			$scope.isOn = true;
			daemonFunc();
		}
		displayTimeInTitle = true;		
	}

	$scope.chronoStop = function() {
		$scope.timeOffset = $scope.timeLength*1000-remainingTimeMs;
		displayTimeInTitle = true;
		alarmTriggered = false;
		$scope.isOn = false;
	}
	
	$scope.chronoReset = function() {
		$scope.dStart = Date.now();
		$scope.timeOffset = 0;
		var timeLengthDisplayedArr = $scope.timeLengthDisplayed.split(':');
		console.log(timeLengthDisplayedArr);
		$scope.timeLength = parseInt(timeLengthDisplayedArr[0])*60+parseInt(timeLengthDisplayedArr[1]);
		console.log($scope.timeLength);
		remainingTimeMs = $scope.timeLength*1000;
		displayTimeInTitle = true;
		alarmTriggered = false;
		refreshDisplay();
	}

	$scope.chronoSetNewTimeCount = function() {

	}
	
	$scope.chronoReset();
	refreshDisplay();

	window.onbeforeunload = confirmExit;
	function confirmExit() {
		if($scope.isOn == true) {
			return "The chronometer is running. Do you really want to close it?";
		}
	}

});



