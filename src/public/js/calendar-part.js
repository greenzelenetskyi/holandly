$(document).ready(function () {
    $('#scheduledEventCalendar').fullCalendar({
        header: {right: 'today,prev,next '},
        defaultView: 'month',
        locale: 'ru',
        eventLimit: true,
        selectable: true,
        selectHelper: true,
        views: {
            listYear: {buttonText: 'Список'},
        },
        select: function (startDate, endDate) {
            editPatternEvents.startDate = startDate;
            editPatternEvents.endDate = endDate;
            EventSchedulerShow(editPatternEvents);
        },
        eventRender: function (event, element) {
            element.bind('dblclick', function () {
                // console.log(event.title + " dblclick on " + event.start.format());
                $('#descriptionText')[0].innerText =
                    'Удаление события [' + event.eventData.type + '] \n заплпнированого на [' +
                    moment(event.eventData.time, 'hh:mm:ss').format("HH:mm") + '  ' +
                    moment(event.eventData.date).format('DD/MM/YYYY') + ']';
                remove = function () {
                    deleteEvent(event.eventData.eventId, $("#reason").val());
                };
                $("#remove-modal-form").modal();
            });
        }
    });
    $('#scheduledEventList').fullCalendar({
        header: {left: '', center: '', right: '',},
        defaultView: 'listYear',
        locale: 'ru',
    });
});

function viewPatternEvents(events) {
    var dataEvents = [];
    Object.values(events).forEach(function (event, i, data) {
        dataEvents.push({
            title: '',
            start: moment(event.date).format('YYYY-MM-DD') + 'T' + event.time,
            eventData: event,
        });
    });
    var calendar = $('#scheduledEventCalendar');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', dataEvents);
    calendar = $('#scheduledEventList');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', dataEvents);
}
