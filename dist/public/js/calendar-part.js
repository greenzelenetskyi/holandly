$(document).ready(function () {
    var initialLocaleCode = 'ru';

    $.each($.fullCalendar.locales, function (localeCode) {
        $('#locale-selector').append(
            $('<option/>')
                .attr('value', localeCode)
                .prop('selected', localeCode == initialLocaleCode)
                .text(localeCode)
        );
    });
    initThemeChooser({
        init: function (themeSystem) {
            $('#calendar').fullCalendar({
                themeSystem: themeSystem,
                header: {
                    left: 'prev, next today',
                    center: 'title',
                    right: 'month,agendaWeek,listMonth'
                },
                locale: initialLocaleCode,
                editable: true,
                droppable: true,
                navLinks: true,
                eventLimit: true,
                drop: function (event) {
                    console.log(this);
                    console.log(event);
                },
                // eventClick: function (event, element) {
                //     $('#calendar').fullCalendar('updateEvent', event);
                // },
                eventRender: function (event, element) {
                    element.bind('dblclick', function () {
                        console.log(event.title + " dblclick on " + event.start.format());
                        console.log(event);
                    });
                    // element.popover({
                    //     title: event.title,
                    //     content: event.description,
                    //     trigger: 'hover',
                    //     placement: 'top',
                    //     container: 'body'
                    // });
                },
                eventDrop: function (event, delta, revertFunc) {
                    console.log(event.title + " was dropped on " + event.start.format());
                    if (!confirm("Перепланировать событие?")) {
                        revertFunc({
                            zIndex: 999,
                            revert: true,      // will cause the event to go back to its
                            revertDuration: 0  //  original position after the drag
                        });
                    }
                    else {

                    }
                },
            });
        },
        change: function (themeSystem) {
            $('#calendar').fullCalendar('option', 'themeSystem', themeSystem);
        }
    });
});

