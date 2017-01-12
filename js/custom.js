// UTILITIES
function getTimeStamp(){
    var dt = new Date();
    var utcDate = dt.toUTCString();
    return utcDate;
}
/*
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
function closeOverlay(){
    $('#divOverlay').hide();
    $('#inp_timerName').val("");
}

function showOverlay(divName){
    //var tmpStr = $('#'+divName).html();
    //$('#divModal').html(tmpStr);
    $('#divOverlay').show();
    $('#inp_timerName').focus();
}

function addTimer() {
    if(event.keyCode == 13) {
        event.preventDefault();
        addNewTimer();
        closeOverlay();
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
    $('#inp_dispName').val(tmpVal);
}

$('document').ready(function() {
    
    // new timer click
    $('#lnk_new').on('click', function(evnt){
        evnt.stopPropagation();
        showOverlay("test");
    });
    
    // close overlay click
    $('.divClose').on('click', function(evnt){
        evnt.stopPropagation();
        closeOverlay();
    });
    
    // confirm new timer click
    $('#btn_cfmNew').on('click', function(evnt){
        evnt.stopPropagation();
        evnt.preventDefault();
        addNewTimer();
        closeOverlay();
    });
    
});


// DECORATIONS
function showToast(msg,msgStatus) {
    if(msgStatus === "success") {
        $('#sp_toast').css('background-color', '#DFF2BF');
        $('#sp_toast').css('color', '#4F8A10');
    }
    else if(msgStatus === "message") {
        $('#sp_toast').css('background-color', '#BDE5F8');
        $('#sp_toast').css('color', '#00529B');
    }
    else if (msgStatus === "warning"){
        $('#sp_toast').css('background-color', '#FEEFB3');
        $('#sp_toast').css('color', '#9F6000');
    }
    else
        ;
    
    $('#sp_toast').html(msg).clearQueue().fadeIn(400).delay(2000).fadeOut(400);
}

// loader image when the webpage loads for the first time
/*$(window).on("load",function(){$(".loader").fadeOut("slow");});*/
