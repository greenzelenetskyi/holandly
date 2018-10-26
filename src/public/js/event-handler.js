var eventType = '';
var patternId = '';

$('ul').on('click', 'li', function () {
    var event_owner = $(this).children(".event-owner").html();
    eventType = $(this).children(".event-header").html();
    patternId = $(this).children('.patternId').html();
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