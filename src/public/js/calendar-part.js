$(document).ready(function () {
    $('#calendar').fullCalendar({
        header: {
            right: 'today,month,listYear, prev,next ',
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
            // removeModalForm.modal('hide');
            $('#editEvents-modal-form').modal();
            if (selectDates.length === 1) {

            }
            else {

            }
            console.log(getDates(startDate, endDate));
        },
    });
});

function getDates(startDate, endDate) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(endDate);
    while (currentDate < stopDate) {
        dateArray.push({
            start: currentDate,
            rendering: 'background'
        });
        currentDate = moment(currentDate).add(1, 'days');
    }
    console.log(dateArray);
    return (dateArray);
}


function appentEvetntsToCalendar(events) {
    var dataEvents = [];
    Object.values(events).forEach(function (event, i, data) {
        // var pattern = $('#patternId' + event.patternId)[0];
        dataEvents.push({
            title: event.time,
            start: moment(event.date).format('YYYY-MM-DD'),
            eventData: event,
            //patternData: event,
            // color: pattern.patternData.color,
            // description: pattern.patternData.description
        });
    });
    var calendar = $('#calendar');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', dataEvents);
}