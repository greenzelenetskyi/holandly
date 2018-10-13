$('ul').on('click', '.active', function () {
    updateDays();
    $(this).css('background-color', "#27AE60");
    $(this).css('color', "white");
    $('.time-container ul').html('');
    date = $(this).children($('.list-full-date')).html();
    getTimeline(formatDate(date));
    $('.time-container').css('display', 'block');
});

$('.forward').on("click", function () {
    updateDays();
    $('.time-container').css('display', 'none');
    $('.time-container ul').html('');
    let last_date = $('.date-bar li').last().children($('.list-full-date')).html();
    let gottenDate = formatDate(last_date, true);
    console.log(gottenDate);
    getWeek(gottenDate);
});

$('.backward').on("click", function () {
    updateDays();
    $('.time-container').css('display', 'none');
    $('.time-container ul').html('');
    let first_date = $('.date-bar li').first().children($('.list-full-date')).html();
    let gottenDate = formatDate(first_date, false);
    getWeek(gottenDate);
});

function getTimeline(date) {
    $.ajax({
        type: 'GET',
        url: "/user/getTimeLine/"+date+"/" +patternId,
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            let events = data.events;
            for (let i = 0; i < events.length; i++){
                if (events[i].availability) {
                    let item = addTimeNode(events[i]);
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
    let startTime = $(this).parent().children('.time').text();
    $('#modal-start').html("Начало: "  +startTime.slice(0, 5));
    let modalDate = new Date(formatDate(date));
    let arr = [weekArray[modalDate.getDay()].full, modalDate.getDate()];
    let dateMssg = arr.join(', ');
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
        let vName = $('#visitorName').val();
        let vEmail = $('#visitorEmail').val();
        sendVisitor({name: vName, email: vEmail, event: eventId});
    }
});

function getWeek(date) {
    $.ajax({
        type: 'GET',
        url: "/user/getWeek/"+date+'/'+patternId,
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
            let days = data.days;
            for (let i = 0; i < days.length; i++) {
                let iDate = new Date(days[i].date);
                let currLi = $('.date-bar li').eq(i);
                currLi.children('.list-full-date').html(iDate.getDate() + '/'+ (iDate.getMonth()+1) + '/' +iDate.getFullYear());
                currLi.children('.list-day').html(weekArray[iDate.getDay()].short);
                currLi.children('.list-date').html(iDate.getDate());
                currLi.children('.list-month').html(monthArray[iDate.getMonth()].short);
                if (days[i].available) {
                    $('.date-bar li').eq(i).attr('class', 'active');
                }
                else {
                    $('.date-bar li').eq(i).attr('class', '');
                }
            }
        }
    })
}

function formatDate(date, increase){
    let dateArray = date.split('/');
    let gottenDate = new Date(dateArray[2] + "-" + dateArray[1] + '-' + dateArray[0]);
    if (increase) {
        gottenDate.getDate() >= 10 ? gottenDate.setDate(gottenDate.getDate() + 1) : gottenDate.setDate(gottenDate.getDate() +2);
    }
    else if (increase === false) {
        gottenDate.getDate() >= 10? gottenDate.setDate(gottenDate.getDate()-7) : gottenDate.setDate(gottenDate.getDate()-6);
    }
    gottenDate = gottenDate.toISOString().slice(0, 10);
    return gottenDate;
}

function updateDays(){
    $('.active').css('background-color', '');
    $('.active').css('color', '');
}

function addTimeNode(data){
    let timelineTime = formatTimelineTime(data.date, data.time);
    let li = $('<li>');
    li.append('<span>');
    let id = $('<div>');
    id.addClass('event-id');
    id.html(data.eventId);
    let pick = $('<div>');
    pick.addClass('pick');
    pick.html('Записаться');
    let remain = $('<div>');
    remain.addClass('remain');
    remain.html('Осталось мест: ' + data.remain);
    pick.append(id);
    pick.append(remain);
    li.append(pick);
    let time = $('<div>');
    time.addClass('time');
    let startSpan = $('<span>').html(timelineTime.getHours() + ":" +
        ('0'+timelineTime.getMinutes()).slice(-2));
    time.append(startSpan);
    timelineTime.setMinutes(timelineTime.getMinutes() + duration);
    let endSpan = $('<span>').html(timelineTime.getHours() + ":" +
        ('0'+timelineTime.getMinutes()).slice(-2));
    time.append(endSpan);
    li.append(time);
    return li;
}

function formatTimelineTime(date, time){
    let timeArr = time.split(':');
    let timelineTime = new Date(date);
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
            $('.timeline').css('display', 'none');
            $('.submit-modal').css('display', 'none');
            $('.submission-content').css('display', 'flex');
            if (data.success == 0){
                $('.submission-success').css('display', 'block');
            }
        }
    })
}

function checkName() {
    let pattern = /^[A-Za-zА-Яа-яёЁ]*$/;
    let currItem = $('#visitorName');
    let name = currItem.val().trim();
    clearWarnings(currItem);
    if (pattern.test(name) && name !== ''){
        currItem.css('border-bottom', '2px solid #34F458');
        currItem.parent().children('i.fa.fa-check.success').css('display', 'inline');
        error_name = false;
    }
    else {
        if (name === '') {
            currItem.parent().children('i.fa.fa-exclamation.warning').css('display', 'inline');
            currItem.parent().children('span.spanEmpty').css('display', 'inline');
            currItem.css('border-bottom', '2px solid orange');
        } else {
            currItem.parent().children('i.fa.fa-times.error').css('display', 'inline');
            currItem.parent().children('span.spanInvalid').css('display', 'inline');
            currItem.css('border-bottom', '2px solid #f90a0a');
        }
        error_name = true;
    }
}

function checkEmail() {
    let pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let currItem = $('#visitorEmail');
    clearWarnings(currItem);
    let mail = currItem.val().trim();
    if (pattern.test(mail) && mail !== ''){
        currItem.css('border-bottom', '2px solid #34F458');
        currItem.parent().children('i.fa.fa-check.success').css('display', 'inline');
        error_email = false;
    }
    else {
        if (mail === '') {
            currItem.parent().children('i.fa.fa-exclamation.warning').css('display', 'inline');
            currItem.parent().children('span.spanEmpty').css('display', 'inline');
            currItem.css('border-bottom', '2px solid orange');

        } else {
            currItem.parent().children('i.fa.fa-times.error').css('display', 'inline');
            currItem.parent().children('span.spanInvalid').css('display', 'inline');
            currItem.css('border-bottom', '2px solid #f90a0a');
        }
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

var duration = $('#eventDuration').html();
duration = parseInt(duration);
var patternId = $('#patternId').html();

var eventId;


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