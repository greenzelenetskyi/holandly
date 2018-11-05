$(document).ready(function () {
    $('#calendar').fullCalendar({
        header: {
            right: 'today,prev,next ',
            // right: 'today,month,listYear, prev,next ',
        },
        defaultView: 'month',
        locale: 'ru',
        eventLimit: true,
        selectable: true,
        selectHelper: true,
        views: {
            listYear: {buttonText: 'Список'},
        },
        // dayClick: function (date) {
        //     console.log('clicked ' + date.format());
        // },
        select: function (startDate, endDate) {
            var selectDates = getDates(startDate, endDate);
            editPatternEvents.startDate = startDate;
            editPatternEvents.endDate = endDate;
            if (selectDates.length === 1) {
                EventSchedulerShow(editPatternEvents);
            }
            else {
                EventSchedulerShow();
            }
        },
    });
    $('#calendarList').fullCalendar({
        header: {
            left: '',
            center: '',
            right: '',
        },
        defaultView: 'listYear',
        locale: 'ru',
    });
});


function appentEvetntsToCalendar(events) {
    var dataEvents = [];
    Object.values(events).forEach(function (event, i, data) {
        dataEvents.push({
            title: '',
            start: moment(event.date).format('YYYY-MM-DD') + 'T' + event.time,
            eventData: event,
        });
    });
    var calendar = $('#calendar');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', dataEvents);
    calendar = $('#calendarList');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', dataEvents);
}