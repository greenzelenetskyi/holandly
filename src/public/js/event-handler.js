var eventType = '';
var patternId = '';

$('ul').on('click', 'li', function () {
    var event_owner = window.eventsOwner;
    eventType = window.eventsList[$(this).index()].event;
    patternId = window.eventsList[$(this).index()].patternId;
    $('.bg-modal').css('display', 'flex');
    $('#modal-owner').text(event_owner);
    $('#modal-desc').text("Вы уверены что хотите посетить событие " + eventType + "?");
});


$('.confirm').on('click', function () {
    var currHref = $(location).attr('href');
    if (currHref.endsWith('/')){
        currHref = currHref.slice(0, currHref.length-1);
    }
    $(location).attr('href', currHref + '/' + patternId );
});

$('.modal-button').on('click', function () {
    $('.bg-modal').css('display', "none");
});