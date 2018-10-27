$(document).ready(function (){
    currHref = $(location).attr('href');
});

$('ul').on('click', '.active', function () {
    updateDays();
    $(this).css('background-color', "#27AE60");
    $(this).css('color', "white");
    $('.time-container ul').html('');
    var currEl = $(this).index()/2;
    date = window.days[currEl].date;
    getTimeline(formatDate(date));
    $('.time-container').css('display', 'block');
});

$('.forward').on("click", function () {
    updateDays();
    $('.time-container').css('display', 'none');
    $('.time-container ul').html('');
    var last_date = window.days[6].date;
    var gottenDate = formatDate(last_date, true);
    getWeek(gottenDate);
});

$('.backward').on("click", function () {
    updateDays();
    $('.time-container').css('display', 'none');
    $('.time-container ul').html('');
    var first_date = window.days[0].date;
    var gottenDate = formatDate(first_date, false);
    getWeek(gottenDate);
});

function getTimeline(date) {
    $.ajax({
        type: 'GET',
        url: "/user/getTimeLine/"+date+"/" +patternId,
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            var events = data.events;
            for (var i = 0; i < events.length; i++){
                if (events[i].availability) {
                    var item = addTimeNode(events[i]);
                    $('.time-container ul').append(item);
                }
            }
            $('.time-container').attr('display', 'flex');
        }
    })
}

$('.time-container ul').on('click', '.pick', function () {
    eventId = $(this).children('.event-id').text();
    $('.submit-modal').css('display', 'flex');
    var startTime = $(this).parent().children('.time').text();
    $('#modal-start').html("Начало: "  +startTime.slice(0, 5));
    var modalDate = new Date(formatDate(date));
    var arr = [weekArray[modalDate.getDay()].full, modalDate.getDate()];
    var dateMssg = arr.join(', ');
    dateMssg += " " + monthArray[modalDate.getMonth()].full;
    $('#modal-date').html(dateMssg);
});

$('.submit-modal').on('mouseover mouseout', function (e) {
    if (e.target !== this)
        return;
    $(this).toggleClass('hovered');
    $('i.fa.fa-times.error#close-modal').toggleClass('hovered');
});

$('.submit-modal').on('click', function (e) {
    if (e.target !== this)
        return;
    $('.submit-modal').css('display', 'none');
});

$('.submit-modal').on('click', 'i.fa.fa-times.error#close-modal', function (e) {
    if (e.target !== this)
        return;
    $('.submit-modal').css('display', 'none');
});

$('#visitorName').on('keydown keyup focusout', function () {
    checkName();
});

$('#visitorEmail').on('keydown keyup focusout', function () {
    checkEmail();
});

$('.modal-confirm').on('click', function () {
    if (!error_name && !error_email) {
        var vName = $('#visitorName').val();
        var vEmail = $('#visitorEmail').val();
        sendVisitor({name: vName, email: vEmail, event: eventId});
    }
});

$('.submission-failed#2').on('click', 'p', function () {
    currHref = currHref.slice(0, currHref.lastIndexOf('/'));
    $(location).attr('href', currHref);
});

$('.submission-failed#1').on('click', 'p', function () {
    location.reload(true);
});

$('p#reschedule').on('click', function () {
    currHref = currHref.substr(0, currHref.lastIndexOf('user')+5);
    var appendData = ['reschedule', patternId, reschedule_data.evId, reschedule_data.mail];
    $(location).attr('href', (currHref + appendData.join('/')));
});

$('p#cancel').on('click', function () {
    currHref = currHref.substr(0, currHref.lastIndexOf('user')+5);
    $(location).attr('href', currHref+'/'+window.user+'/');
});

function getWeek(date) {
    $.ajax({
        type: 'GET',
        url: "/user/getWeek/"+date+'/'+patternId,
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            var days = window.days = data.days;
            for (var i = 0; i < days.length; i++) {
                var iDate = new Date(days[i].date);
                var currLi = $('.date-bar li').eq(i);
                currLi.children('.list-full-date').html(iDate.getDate() + '/'+ (iDate.getMonth()+1) + '/' +iDate.getFullYear());
                currLi.children('.list-day').html(weekArray[iDate.getDay()].short);
                currLi.children('.list-date').html(iDate.getDate());
                currLi.children('.list-month').html(monthArray[iDate.getMonth()].short);
                $('.date-bar li').eq(i).attr('class', days[i].available ? 'active' : '');
            }
        }
    })
}

function formatDate(date, increase){
    var dateArray = date.split('/');
    var gottenDate = new Date(dateArray[2] + "-" + dateArray[0] + '-' + dateArray[1]);
    if (increase) {
        gottenDate.setDate(gottenDate.getDate()+1);
    }
    else if (increase === false) {
        gottenDate.setDate(gottenDate.getDate()-7);
    }
    gottenDate = gottenDate.toISOString().slice(0, 10);
    return gottenDate;
}

function updateDays(){
    $('.active').css('background-color', '');
    $('.active').css('color', '');
}

function addTimeNode(data){
    var timelineTime = formatTimelineTime(data.date, data.time);
    var li = $('<li>');
    li.append('<span>');
    var id = $('<div>');
    id.addClass('event-id');
    id.html(data.eventId);
    var pick = $('<div>');
    pick.addClass('pick');
    pick.html('Записаться');
    var remain = $('<div>');
    remain.addClass('remain');
    remain.html('Осталось мест: ' + data.remain);
    pick.append(id);
    pick.append(remain);
    li.append(pick);
    var time = $('<div>');
    time.addClass('time');
    var startSpan = $('<span>').html(timelineTime.getHours() + ":" +
        ('0'+timelineTime.getMinutes()).slice(-2));
    time.append(startSpan);
    timelineTime.setMinutes(timelineTime.getMinutes() + duration);
    var endSpan = $('<span>').html(timelineTime.getHours() + ":" +
        ('0'+timelineTime.getMinutes()).slice(-2));
    time.append(endSpan);
    li.append(time);
    return li;
}

function formatTimelineTime(date, time){
    var timeArr = time.split(':');
    var timelineTime = new Date(date);
    timelineTime.setHours(timeArr[0]);
    timelineTime.setMinutes(timeArr[1]);
    timelineTime.setSeconds(timeArr[2]);
    return timelineTime;
}

function sendVisitor(inputData){
    $.ajax({
        type: 'POST',
        url: '/user/submitVisitor',
        data: JSON.stringify({name: inputData.name, email: inputData.email, event: inputData.event}),
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            var success = data.success;
            $('.timeline').css('display', 'none');
            $('.submit-modal').css('display', 'none');
            $('.submission-content').css('display', 'flex');
            switch (success) {
                case 0:
                    $('.submission-success').css('display', 'block');
                    break;
                case 1:
                    $('.submission-failed#1').css('display', 'flex');
                    break;
                case 2:
                    $('.submission-failed#2').css('display', 'flex');
                    break;
                case 3:
                    $('.submission-failed#3').css('display', 'flex');
                    reschedule_data = {mail: data.email, evId: data.eventId};
                    break;
            }
        }
    })
}

function checkName() {
    var pattern = /^[A-Za-zА-Яа-яёЁ]*$/;
    var currItem = $('#visitorName');
    var name = currItem.val().trim();
    clearWarnings(currItem);
    if (pattern.test(name) && name !== ''){
        currItem.css('border-bottom', '2px solid #34F458');
        currItem.parent().children('i.fa.fa-check.success').css('display', 'inline');
        error_name = false;
    }
    else {
        var bool= name==='';
        currItem.parent().children(bool ? 'i.fa.fa-exclamation.warning' : 'i.fa.fa-times.error').css('display', 'inline');
        currItem.parent().children(bool ? 'span.spanEmpty' : 'span.spanInvalid').css('display', 'inline');
        currItem.css('border-bottom', bool ? '2px solid orange': '2px solid #f90a0a');
        error_name = true;
    }
}

function checkEmail() {
    // regExp to check if user did a correct e-mail input. Example = example@example.com, example@x.com.ua, example@y.x.com.gb
    var pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var currItem = $('#visitorEmail');
    clearWarnings(currItem);
    var mail = currItem.val().trim();
    if (pattern.test(mail) && mail !== ''){
        currItem.css('border-bottom', '2px solid #34F458');
        currItem.parent().children('i.fa.fa-check.success').css('display', 'inline');
        error_email = false;
    }
    else {
        var checkMl = mail === '';
        currItem.parent().children(checkMl ? 'i.fa.fa-exclamation.warning' : 'i.fa.fa-times.error').css('display', 'inline');
        currItem.parent().children(checkMl ? 'span.spanEmpty' : 'span.spanInvalid').css('display', 'inline');
        currItem.css('border-bottom', checkMl ? '2px solid orange' : '2px solid #f90a0a');
        error_email = true;    }
}


function clearWarnings(item){
    item.parent().children('i.fa.fa-check.success').css('display', 'none');
    item.parent().children('i.fa.fa-times.error').css('display', 'none');
    item.parent().children('i.fa.fa-exclamation.warning').css('display', 'none');
    item.parent().children('span.spanEmpty').css('display', 'none');
    item.parent().children('span.spanInvalid').css('display', 'none');
}


var error_name = false;
var error_email = false;

var duration = window.duration;
duration = parseInt(duration);
var patternId = window.patternId;

var eventId;

var reschedule_data = {evId: 21, mail: 'v@v.com'};


var weekArray = [{short: 'ВС', full: 'Воскресенье'},
    {short: 'ПН', full: 'Понедельник'},
    {short: 'ВТ', full: 'Вторник'},
    {short: 'СР', full: 'Среда'},
    {short: 'ЧТ', full: 'Четверг'},
    {short: 'ПТ', full: 'Пятница'},
    {short: 'СБ', full: 'Суббота'}];
var monthArray = [{short: 'Янв', full: "Января"},
    {short: 'Фев', full: "Февраля"},
    {short: 'Март', full: "Марта"},
    {short: 'Апр', full: "Апреля"},
    {short: 'Май', full: "Мая"},
    {short: 'Июнь', full: "Июня"},
    {short: 'Июль', full: "Июля"},
    {short: 'Авг', full: "Августа"},
    {short: 'Сент', full: "Сентября"},
    {short: 'Окт', full: "Октября"},
    {short: 'Ноя', full: "Ноября"},
    {short: 'Дек', full: "Декабря"}];

var date;
var currHref;