
// UTILITIES
function getTimeStamp(){
    var dt = new Date();
    var utcDate = dt.toUTCString();
    return utcDate;
}
/*
    $('.input-lg').on('keypress', function (event) {
        var regex = new RegExp("^[a-zA-Z0-9]+$");
        var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
        if (!regex.test(key)) {
           event.preventDefault();
           return false;
        }
    });
function getCalendar(year){
    var monthsIndex = [Jan,Feb,Mar,Apr,May,June,July,Aug,Sep,Oct,Nov,Dec];
    var daysIndexStart = [];
    var daysIndexEnd = [];
    tmpStartTime = tmpStartTime.split(":");
    tmpCurrentTime = tmpCurrentTime.split(":");
    if(tmpStartTime[2] - tmpCurrentTime[2] === 0){
        //no year diff
    }
    var daysIndex = [];
    // [31,28,31,30,31,30,31,31,30,31,30,31]
    for(var i=0; i<12; i++){
        if((i==1) || (i==7)){
            if((i==1) && ((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0))){
                daysIndex[i] = 29;
            }
            else if((i==1) && !((year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0))){
                daysIndex[i] = 28;
            } else {
                daysIndex[i] = 30;
            }
        }
        else
            daysIndex[i] = 31;
    }
    return daysIndex;
}
function makeDateAdjust(tmpValOne, tmpValTwo){
    if((tmpValTwo/60) > 1){
        tmpValOne = tmpValOne + parseInt(tmpValTwo / 60);
        tmpValTwo = (tmpValTwo % 60);
    }
    return [tmpValOne,tmpValTwo];
}
function getDayDiff(tmpStartTime, tmpCurrentTime){
    // 11:Jan:2017
    var dayDiff = 0;
    var oneDay = 24*60*60*1000;
    tmpStartTime = tmpStartTime.split(":");
    tmpCurrentTime = tmpCurrentTime.split(":");
    var monthsIndex = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for(var i=0; i<12; i++){
        if(tmpStartTime[1] === monthsIndex[i])
            tmpStartTime[1] = i;
        if(tmpCurrentTime[1] === monthsIndex[i])
            tmpCurrentTime[1] = i;
    }
    // REFACTOR NEEDED
    var tmpStart = new Date(tmpStartTime[2],tmpStartTime[1],tmpStartTime[0]);
    var tmpCurrent = new Date(tmpCurrentTime[2],tmpCurrentTime[1],tmpCurrentTime[0]);
    dayDiff =  Math.round(Math.abs((tmpCurrent.getTime() - tmpStart.getTime())/(oneDay)));
    return dayDiff;
    
    diff = parseInt(currentTime[1]) + ((parseInt(startTime[1])===0)?0:(60 - parseInt(startTime[1])));
}
*/
function getDateVal(tmpDateVal){
    // Wed, 11 Jan 2017 12:15:20 GMT
    tmpDateVal = tmpDateVal.split(" ");
    var dateVal =  tmpDateVal[1] + "-" + tmpDateVal[2] + "-" + tmpDateVal[3];
    return dateVal;
    // 11-Jan-2017
}
function getDayDiff(tmpStartTime, tmpCurrentTime){
    // Wed, 11 Jan 2017 12:15:20 GMT
    var dayDiff = 0;
    var oneDay = 24*60*60*1000;
    var tmpStartDate = new Date(tmpStartTime);
    var tmpCurrentDate = new Date(tmpCurrentTime);
    dayDiff =  Math.round(Math.abs((tmpCurrentDate.getTime() - tmpStartDate.getTime())/(oneDay)));
    return dayDiff;
}
function getHourDiff(tmpStartTime, tmpCurrentTime){
    // Wed, 11 Jan 2017 12:15:20 GMT
    var hourDiff = 0;
    var startTime = tmpStartTime.split(" ");
    var currentTime = tmpCurrentTime.split(" ");
    
    // IF THE END TIME IS WITHIN THE SAME DAY
    if((startTime[1] === currentTime[1]) && (startTime[2] === currentTime[2]) && (startTime[3] === currentTime[3])){
        startTime = startTime[4].split(":");
        currentTime = currentTime[4].split(":");
        hourDiff = parseInt(currentTime[0]) - parseInt(startTime[0]);
        
    // IF THE END TIME FALLS ON THE VERY NEXT DAY
    } else if (((parseInt(currentTime[1]) - parseInt(startTime[1])) === 1) && (startTime[2] === currentTime[2]) && (startTime[3] === currentTime[3])){
        startTime = startTime[4].split(":");
        currentTime = currentTime[4].split(":");
        if(parseInt(startTime[1]) !== 0) // to do: testing needed
            hourDiff = parseInt(currentTime[0]) + (23 - parseInt(startTime[0]));
        else
            hourDiff = parseInt(currentTime[0]) + (24 - parseInt(startTime[0]));

    // IF THE END TIME IS MORE THAN A DAY LONG
    } else {
        var dayDiff = getDayDiff(tmpStartTime,tmpCurrentTime);
        dayDiff = parseInt(dayDiff)-1;
        startTime = startTime[4].split(":");
        currentTime = currentTime[4].split(":");
        hourDiff = parseInt(currentTime[0]) + (24 - parseInt(startTime[0])) + (dayDiff*24);
    }
    return hourDiff;
}
function getMinSecDiff(tmpStartTime, tmpCurrentTime, tmpFlag){
    // Wed, 11 Jan 2017 12:15:20 GMT
    var diff = 0;
    var startTime = tmpStartTime.split(" ");
    var currentTime = tmpCurrentTime.split(" ");

    // TO USE DURING THE SAME MINUTE OR HOUR CONDITION CHECK
    tmpStartTime = tmpStartTime.split(" ");
    tmpCurrentTime = tmpCurrentTime.split(" ");
    
    startTime = startTime[4].split(":");
    currentTime = currentTime[4].split(":");
    
    if(tmpFlag === "sec"){
        // IF THE END TIME IS IN THE SAME MINUTE
        if((tmpStartTime[1] === tmpCurrentTime[1]) && (tmpStartTime[2] === tmpCurrentTime[2]) && (tmpStartTime[3] === tmpCurrentTime[3]) && (startTime[0] === currentTime[0]) && (startTime[1] === currentTime[1]) ){
            diff = parseInt(currentTime[2]) - parseInt(startTime[2]);

        // IF THE END TIME IS IN A DIFFERENT MINUTE
        } else {
            diff = parseInt(currentTime[2]) + (60 - parseInt(startTime[2]));
        }
    }
    else {
        // IF THE END TIME IS IN THE SAME HOUR
        if((tmpStartTime[1] === tmpCurrentTime[1]) && (tmpStartTime[2] === tmpCurrentTime[2]) && (tmpStartTime[3] === tmpCurrentTime[3]) && (startTime[0] === currentTime[0])){
            diff = parseInt(currentTime[1]) - parseInt(startTime[1]);
            
        // IF THE END TIME IS IN A DIFFERENT HOUR
        } else {
            diff = parseInt(currentTime[1]) + (60 - parseInt(startTime[1]));
        }
    }
    return diff;
}
// END UTILITIES


// BUTTON CLICKS
function disableInput(){
    $('.input-lg').attr('readonly', true);
    $('.input-lg').attr("data-content","Use the RESET to start over");

    $('.btn-warning').attr('disabled',true);
    $('.btn-warning').removeClass("btn-warning").addClass("btn-warning-disabled");

    $('.btn-reset-disabled').attr('disabled',false);
    $('.btn-reset-disabled').removeClass("btn-reset-disabled").addClass("btn-reset");
}
function enableInput(){
    $('.input-lg').attr('readonly', false);
    $('.input-lg').attr("data-content","Limit to 25 alpha-numeric characters");

    $('.btn-warning-disabled').attr('disabled',false);
    $('.btn-warning-disabled').removeClass("btn-warning-disabled").addClass("btn-warning");

    $('.btn-reset').attr('disabled',true);
    $('.btn-reset').removeClass("btn-reset").addClass("btn-reset-disabled");
}

$('document').ready(function() {
    enableInput();
    $('.input-lg').popover({trigger: "hover", placement: "top"});
    $('.input-lg').on('click', function(){
        $('.input-lg').popover('hide');
    });

    $('.input-lg').on('input', function() {
        var c = this.selectionStart,
            r = /[^A-Za-z0-9_\s]/gi,
            v = $(this).val();
        if(r.test(v)) {
            $(this).val(v.replace(r, ''));
            c--;
        }
        this.setSelectionRange(c, c);
    });

});

// DECORATIONS
function toggleClass(toggleMsg){
    if(toggleMsg === "stop"){
        $('.round-button').removeClass("round-button").addClass("round-button-stop");
        $('.round-button-circle').removeClass("round-button-circle").addClass("round-button-circle-stop");
    } else {
        $('.round-button-stop').removeClass("round-button-stop").addClass("round-button");
        $('.round-button-circle-stop').removeClass("round-button-circle-stop").addClass("round-button-circle");
    }
}
function showToast(msg,msgStatus,toastStatus) {
    if(msgStatus === "success") {
        $('.toast').css('background-color', '#DFF2BF');
        $('.toast').css('color', '#4F8A10');
    }
    else if(msgStatus === "message") {
        $('.toast').css('background-color', '#BDE5F8');
        $('.toast').css('color', '#00529B');
    }
    else if (msgStatus === "warning"){
        $('.toast').css('background-color', '#FEEFB3');
        $('.toast').css('color', '#9F6000');
    }
    else
        ;
    
    if(toastStatus === "hide") {
        $('.toast').html(msg).clearQueue().fadeIn(400).delay(2000).fadeOut(400);
    } else {
        $('.toast').html(msg).clearQueue().fadeIn(400);
    }
}




function getScope(ctrlName) {
    var sel = 'div[ng-controller="' + ctrlName + '"]';
    return angular.element(sel).scope();
}
function addNewTimer(){
    var $scope = getScope('MainCtrl');
    $scope.curTimer = $('#inp_timerName').val();
    $scope.$apply();
    var tmpVal = $('#inp_timerName').val();
    $('.input-lg').val(tmpVal);
}
