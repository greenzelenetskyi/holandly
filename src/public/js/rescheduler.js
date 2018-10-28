var eventTable;
var email;
var access;

$(document).ready(function () {
    eventTable = window.visEvents;
    email = window.visEmail;
    access = window.access;
    remainCalc();
});

$('ul').on('click', 'li', function (e) {
    var curr = $(this).children('.checker');
    if (remainCalc() <= 0 && !curr.hasClass('checked'))
        return;
    curr.toggleClass('checked');
    var icon = $('<i>');
    icon.addClass('fas');
    var iconType = curr.hasClass('checked') ? 'fa-check-square' : 'fa-square';
    icon.addClass(iconType);
    curr.empty();
    curr.append(icon);
    var event = eventTable[$(this).index()];
    event.isRecord = !event.isRecord;
    remainCalc();
});

$('#confirm').on('click', function () {
    $.ajax({
        type: 'POST',
        url: '/user/rerecording',
        data: JSON.stringify({email: email, events: eventTable}),
        dataType: 'json',
        contentType: "application/json",
        success: function (data) {
        }
    });
});

$('#cancel').on('click', function () {
    var currHref = $(location).attr('href');
    var cutI = currHref.indexOf('reschedule');
    var resultHref = currHref.substr(0, cutI);
    var user = window.user;
    var pattern = currHref.substring(cutI+'reschedule'.length, currHref.indexOf('/', cutI+'reschedule'.length));
    resultHref += user + '/' + pattern;
    $(location).attr('href', resultHref);
});


function remainCalc(){
    var counter = 0;
    eventTable.forEach(v => v.isRecord ? counter++ : v.isRecord);
    $('#remain').html('Есть возможность записаться еще на ' + (access-counter));
    return access-counter;
}