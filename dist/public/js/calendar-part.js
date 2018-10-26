$(document).ready(function () {
    initThemeChooser({
        init: function (themeSystem) {
            $('#calendar').fullCalendar({
                themeSystem: themeSystem,
                header: {
                    left: 'prev, next today',
                    center: 'title',
                    right: 'month,agendaWeek,listYear'
                },
                views: {
                    listYear: {buttonText: 'Список'},
                    listWeek: {buttonText: 'Список'}
                },
                locale: 'ru',
                editable: true,
                droppable: true,
                navLinks: true,
                eventLimit: true,
                // drop: function (event) {
                //     console.log(this);
                //     console.log(event);
                // },
                // eventClick: function (event, element) {
                //     $('#calendar').fullCalendar('updateEvent', event);
                // },
                eventRender: function (event, element) {
                    element.bind('dblclick', function () {
                        console.log(event.title + " dblclick on " + event.start.format());
                        remove = function () {
                            deleteEvent(event.eventData.eventId, $("#removeDescription").val());
                        };
                        $("#remove-modal-form").modal();
                    });
                    element.popover({
                        title: event.title,
                        content: event.description,
                        trigger: 'hover',
                        placement: 'top',
                        container: 'body'
                    });
                },
                eventDrop: function (event, delta, revertFunc) {
                    if (!confirm("Перепланировать событие?")) {
                        revertFunc({
                            zIndex: 999,
                            revert: true,      // will cause the event to go back to its
                            revertDuration: 0  //  original position after the drag
                        });
                    }
                    else {
                        $(".Reason").hidden = false;
                        $("#newEventModalLabel").val('Изменить событие');
                        $("#modalPatternId").val(event.patternData.patternId);
                        $("#modalEventId").val(event.eventData.eventId);
                        $("input#inputDate").val(moment(event.eventData.date).format('YYYY-MM-DD'));
                        $("#inputTime").val(event.eventData.time);
                        $("#event-modal-form").modal();
                    }
                },
                eventReceive: function (event) {
                    console.log(event.title + " eventReceive on " + event.start.startOf('day'));
                    console.log(event.patternData);
                    // $("#event-modal-form").modal();
                    // $("#calendar").fullCalendar("removeEvents", event.start.id);

                    var newEventDay = event.start.startOf('day');
                    var existingEvents = $("#calendar").fullCalendar("clientEvents", function (event) {
                        //this callback will run once for each existing event on the current calendar view
                        //if the event has the same start date as the new event, include it in the returned list (to be counted)
                        if (event.start.startOf('day').isSame(newEventDay)) {
                            return true;
                        } else {
                            return false;
                        }
                    });

                    //if this new event means there are now more than 2 events on that day, remove this new event again (N.B. we must do it like this because by this point the event has already been rendered on the calendar)
                    if (existingEvents.length > 2) $("#calendar").fullCalendar("removeEvents", function (eventA) {
                        if (event == eventA) return true;
                    });
                }
            });
        },
        change: function (themeSystem) {
            $('#calendar').fullCalendar('option', 'themeSystem', themeSystem);
        }
    });
});

