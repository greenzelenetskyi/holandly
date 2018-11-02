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

            dayClick: function (date) {
                console.log('clicked ' + date.format());
            },
        select: function (startDate, endDate) {
            console.log('selected ' + startDate.format() + ' to ' + endDate.format());
            var view = $('#calendar').fullCalendar('getView');
            console.log(view);
            console.log("The view's title is " + view.title);
        },
        //     // drop: function (event) {
        //     //     console.log(this);
        //     //     console.log(event);
        //     // },
        //     // eventClick: function (event, element) {
        //     //     $('#calendar').fullCalendar('updateEvent', event);
        //     // },
        //     eventRender: function (event, element) {
        //         element.bind('dblclick', function () {
        //             console.log(event.title + " dblclick on " + event.start.format());
        //             remove = function () {
        //                 deleteEvent(event.eventData.eventId, $("#removeDescription").val());
        //             };
        //             $("#remove-modal-form").modal();
        //         });
        //         element.popover({
        //             title: event.title,
        //             content: event.description,
        //             trigger: 'hover',
        //             placement: 'top',
        //             container: 'body'
        //         });
        //     },
        //     eventDrop: function (event, delta, revertFunc) {
        //         if (!confirm("Перепланировать событие?")) {
        //             revertFunc({
        //                 zIndex: 999,
        //                 revert: true,      // will cause the event to go back to its
        //                 revertDuration: 0  //  original position after the drag
        //             });
        //         }
        //         else {
        //             $(".Reason").hidden = false;
        //             $("#newEventModalLabel").val('Изменить событие');
        //             $("#modalPatternId").val(event.patternData.patternId);
        //             $("#modalEventId").val(event.eventData.eventId);
        //             $("input#inputDate").val(moment(event.eventData.date).format('YYYY-MM-DD'));
        //             $("#inputTime").val(event.eventData.time);
        //             $("#event-modal-form").modal();
        //         }
        //     },
        //     eventReceive: function (event) {
        //         console.log(event.title + " eventReceive on " + event.start.startOf('day'));
        //         console.log(event.patternData);
        //         // $("#event-modal-form").modal();
        //         // $("#calendar").fullCalendar("removeEvents", event.start.id);
        //
        //         var newEventDay = event.start.startOf('day');
        //         var existingEvents = $("#calendar").fullCalendar("clientEvents", function (event) {
        //             //this callback will run once for each existing event on the current calendar view
        //             //if the event has the same start date as the new event, include it in the returned list (to be counted)
        //             if (event.start.startOf('day').isSame(newEventDay)) {
        //                 return true;
        //             } else {
        //                 return false;
        //             }
        //         });
        //
        //         //if this new event means there are now more than 2 events on that day, remove this new event again (N.B. we must do it like this because by this point the event has already been rendered on the calendar)
        //         if (existingEvents.length > 2) $("#calendar").fullCalendar("removeEvents", function (eventA) {
        //             if (event == eventA) return true;
        //         });
    });
});

function appentEvetntsToCalendar(events) {
    var dataEvents = [];
    Object.keys(events).forEach(function (event, i, data) {
        var pattern = $('#patternId' + event.patternId)[0];
        dataEvents.push({
            title: event.type,
            start: moment(event.date).format('YYYY-MM-DD') + 'T' + event.time,
            eventData: event,
            patternData: pattern,
            // color: pattern.patternData.color,
            description: pattern.patternData.description
        });
    });
    var calendar = $('#calendar');
    calendar.fullCalendar('removeEvents');
    calendar.fullCalendar('addEventSource', dataEvents);

}