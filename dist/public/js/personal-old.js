window.onload = function () {
    console.log('------------------>');
    $(function () {
        $('[data-toggle="popover"]').popover()
    });

    $(function () {
        $('.example-popover').popover({
            container: 'body'
        })
    });

    $('.popover-dismiss').popover({
        trigger: 'focus'
    });

    $("li").hover(
        function () {
            $(this).css({
                fontWeight: "bolder"
            });
            $(this).click(function (eventObject) {
                // console.log(eventObject);
            });
        },
        function () {
            var cssObj = {
                fontWeight: "normal",
            };
            $(this).css(cssObj);
        }
    );
    $(function () {
        $('[data-toggle="popover"]').popover()
    });

    $(function () {
        $('.example-popover').popover({
            container: 'body'
        })
    });
};
$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            'Authorization': "Basic " + btoa('user' + ':' + 'passw')
        }
    });
    var eventModalForm = $("#newEventModal");
    eventModalForm.submit(function (event) {
        event.preventDefault();

        //alert("Submit prevented");
        eventModalForm.modal('hide');
    });
    $("#removeModal").submit(function (event) {
        event.preventDefault();

        //alert("Submit prevented");
        $("#removeModal").modal('hide');
    });
    updateAll();


});

function updateAll() {
    getPatterns();
    getEvents();
    getVisitors();

}

function logOut() {
    console.log('logout');
    $.ajax({
        type: "get",
        url: '/logout',
        success: function (data, textStatus, request) {
            $.ajax({
                type: "get",
                url: "/",
                dataType: "html",
                success: function (data, textStatus, request) {
                    window.location = "/";
                }
            })
        }
    });
}

function getVisitors() {
    $.ajax({
        type: 'get',
        url: '/scheduled',
        dataType: 'json',
        headers: {
            "Authorization": "Basic " + btoa('user' + ':' + 'passw')
        },
        data: {},
        response: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', "Basic " + btoa('user' + ':' + 'passw'))
        },
        success: function (data) {
            console.log(data);
            makeVisitorsList(data);
        }
    });
}

function cancelVisitor(data) {
    console.log(data);
    $.ajax({
        type: "delete",
        url: '/cancel',
        dataType: 'json',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getEvents();
            getVisitors();
        }
    });
}

function makeVisitorsList(data) {
    //createDateCard(data);
    let visitorsField = document.getElementById('div-dashboard');
    visitorsField.innerHTML = '';
    let eventAmount = 0;
    if (typeof data === "object") {
        for (let d = 0; d < data.length; d++) {
            let DayEvents = document.createElement('div');
            DayEvents.id = 'dateEvent' + d;
            DayEvents.classList.add('shadow-lg', 'p-3', 'mb-5', 'bg-white', 'rounded');
            DayEvents.innerHTML = '<strong>' + moment(data[d].date).format('DD/MM/YYYY') + '</strong><hr>';
            let visitorsListColapse = document.createElement('div');
            visitorsListColapse.classList.add("accordion");
            visitorsListColapse.id = 'accordionVisitorsList' + DayEvents.id;
            visitorsField.appendChild(DayEvents);

            let timeEvents = data[d].appointments;
            for (let t = 0; t < timeEvents.length; t++) {
                let TimeEvent = document.createElement('div');
                TimeEvent.classList.add("accordion");
                TimeEvent.id = 'accordionVisitorsList' + DayEvents.id;
                TimeEvent.data = {
                    'date': data[d].date,
                    'time': timeEvents[t].time,
                    'eventId': timeEvents[t].eventId,
                    'patternId': timeEvents[t].patternId
                };
                let timeEnd = moment(timeEvents[t].time, 'hh:mm:ss');
                timeEnd.add(timeEvents[t].duration, 'minutes');
                TimeEvent.innerHTML +=
                    '<div class="card">' +
                    '<div class="card-header" id="heading' + eventAmount + '">' +
                    '<div class="row ">' +
                    '<div class="col-3">' +
                    moment(timeEvents[t].time, 'hh:mm:ss').format("HH:mm") + '-' +
                    moment(timeEnd, 'mm').format("HH:mm") +
                    '</div><div class="col-3"><strong>' +
                    timeEvents[t].type +
                    '</strong></div><div class="col-3">' +
                    'Участников ' + timeEvents[t].occupied + ' из ' + timeEvents[t].number +
                    '</div><div class="col text-right"><a href="#" data-toggle="collapse" data-target="#collapse' + eventAmount + '" aria-expanded="false"' +
                    'aria-controls="collapse' + eventAmount + '">Дополнительно</a></div></div></div>';

                TimeEvent.innerHTML +=
                    '<div id="collapse' + eventAmount + '" class="collapse " aria-labelledby="heading' + eventAmount + '"' +
                    'data-parent="#' + TimeEvent.id + '">' +
                    '<div class="container align-items-center">' +
                    '<div class="row ">' +
                    '<div class="col-3 align-self-center">' +
                    '<div class="btn-group-vertical">' +
                    '<button type="button" class="btn btn-outline-success reScheduledEvents" data-toggle="modal" data-target="#newEventModal">' +
                    'Перепланировать' +
                    '</button>' +
                    '<button type="button" data-toggle="modal" data-target="#removeModal" class="btn btn-outline-info removeScheduledEvents">' +
                    'Отменить' +
                    '</button>' +
                    '</div>' +
                    '</div>' +
                    '<div class="col-7 " id="visitorsTable' + eventAmount + '">';
                let tableVisitor = document.createElement('table');
                tableVisitor.classList.add('table', 'table-sm')
                tableVisitor.innerHTML =
                    '<thead><tr><td>#</td>' +
                    '<td>Имя</td>' +
                    '<td>E-mail</td>' +
                    '<td>Отмена участия</td>' +
                    '</tr></thead><tbody>';

                let visitorsEvents = timeEvents[t].visitors;
                for (let v = 0; v < visitorsEvents.length; v++) {
                    tableVisitor.innerHTML +=
                        '<tr>' +
                        '<th scope="row">' + v + '</th>' +
                        '<td>' + visitorsEvents[v].name + '</td>' +
                        '<td>' + visitorsEvents[v].email + '</td>' +
                        '<td><button type="button" class="btn btn-link cancelVisitor" ' +
                        'email="' + visitorsEvents[v].email + '" ' +
                        'eventId="' + timeEvents[t].eventId + '"' +
                        'data-toggle="modal" data-target="#removeModal">Отменить участие</button></td>' +
                        '</tr>';
                }
                tableVisitor.innerHTML +=
                    '</tbody>' +
                    '</table>';
                visitorsListColapse.appendChild(TimeEvent);
                DayEvents.appendChild(visitorsListColapse);
                let id = 'visitorsTable' + eventAmount;
                let element = document.getElementById(id);
                element.appendChild(tableVisitor);
                eventAmount++;
                $("this .removeVisitor").click(
                    function () {
                        alert(this);
                    });
            }
        }
    }

    if (data.length > 0)
        document.getElementById('visitor-amount').innerText = eventAmount;
    $("#div-dashboard .reScheduledEvents").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.data;
            console.log(data);
            data.reason = false;
            data.label = 'Изменить событие';
            fillModalEventForm(data);
        }
    );

    $("#div-dashboard .removeScheduledEvents").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.data;
            console.log(data);
            document.getElementsByClassName('removeId')[0].onclick =
                function () {
                    deleteEvent(data.eventId, $("#removeDescription").val());
                };
        });

    $(".cancelVisitor").click(
        function () {
            let data = {};
            data.email = this.getAttribute('email');
            data.eventId = this.getAttribute('eventId');
            console.log(data);
            document.getElementsByClassName('removeId')[0].onclick =
                function () {
                    data.reason = $("#removeDescription").val();
                    cancelVisitor(data);
                };
        });
}

function fillModalEventForm(data) {
    let modalE = $(".Reason");
    modalE[0].hidden = data.reason;
    let label = $("#newEventModalLabel");
    label[0].innerText = data.label;
    // $("#newEventModalLabel")[0].innerText('Изменить событие');
    $("#modalPatternId").val(data.patternId);
    $("#modalEventId").val(data.eventId);
    $("input#inputDate").val(moment(data.date).format('YYYY-MM-DD'));
    $("#inputTime").val(data.time);
}

function getEvents() {
    $.ajax({
        type: 'get',
        url: '/events',
        dataType: 'json',
        headers: {
            "Authorization": "Basic " + btoa('user' + ':' + 'passw')
        },
        data: {},
        response: 'json',
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', "Basic " + btoa('user' + ':' + 'passw'))
        },
        success: function (data) {
            console.log('getEvents');
            console.log(data);
            makeEventsPoint(data);
        }
    });
}

function makeEventsPoint(data) {
    let eventField = document.getElementById('div-event');
    eventField.innerHTML = '';
    let eventAmount = 0;
    if (typeof data === "object") {
        for (let i = 0; i < data.length; i++) {

            let PatternEvent = $('#PatternEvent' + data[i].patternId);
            if (PatternEvent.length === 0) {
                PatternEvent = document.createElement('div');
                //if (i>1)
                PatternEvent.classList.add('alert', 'alert-success', 'text-left');
                //else PatternEvent.classList.add('alert', 'alert-info', 'text-left');

                PatternEvent.id = 'PatternEvent' + data[i].patternId;
                let type = $('#pattern' + data[i].patternId);
                PatternEvent.innerHTML =
                    ' <div className="alert alert-success text-left" role="alert">' +
                    '<strong>' + data[i].type + '</strong><hr>';
                eventField.appendChild(PatternEvent);
                eventAmount++;
            }
            else
                PatternEvent = PatternEvent[0];

            let eventCard = document.createElement('div');
            eventCard.classList.add("btn-group");
            eventCard.role = "group";
            eventCard.data = {
                patternId: data[i].patternId,
                eventId: data[i].eventId,
                time: data[i].time,
                date: data[i].date
            };

            eventCard.innerHTML +=
                '<button id="btnGroupDrop2" type="button" class="btn btn-outline-dark dropdown-toggle"' +
                '       data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
                moment(data[i].date).format('DD/MM/YY') + '<br/>' +
                moment(data[i].time, 'hh:mm:ss').format("HH:mm") + '<br/>' +
                'Своб.' + (data[i].number - data[i].occupied) + '/' + data[i].number +
                '</button>';
            eventCard.innerHTML +=
                '<div class="dropdown-menu" aria-labelledby="btnGroupDrop1">' +
                '<a class="dropdown-item updateEvent" href="#" data-toggle="modal" data-target="#newEventModal">Перепланировать</a>' +
                '<a class="dropdown-item delEvent" data-toggle="modal" data-target="#removeModal" href="#">Отменить</a>' +
                '</div>';
            PatternEvent.appendChild(eventCard);
        }
    }

    document.getElementById('event-amount').innerText = eventAmount;
    $("#div-event .updateEvent").click(
        function () {
            let data = this.parentNode.parentNode.data;
            console.log(data);
            data.reason = false;
            data.label = 'Изменить событие';
            fillModalEventForm(data);
        }
    );

    $("#div-event .delEvent").click(
        function () {
            let data = this.parentNode.parentNode.data;
            console.log(data);
            document.getElementsByClassName('removeId')[0].onclick =
                function () {
                    deleteEvent(data.eventId, $("#removeDescription").val());
                };
        });
}

function putEvent(events) {
    console.log('>putEvent');
    console.log(events);
    $.ajax({
        type: "POST",
        url: '/events',
        dataType: 'json',
        data: JSON.stringify(events),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getEvents();
            getVisitors();
        }
    });
}

function deleteEvent(id, description) {
    console.log('>deleteEvent');
    console.log(id);
    console.log(description);
    $.ajax({
        type: "delete",
        url: '/events/' + id,
        dataType: 'json',
        data: JSON.stringify({'Reason': description}),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getEvents();
            getVisitors();
        }
    });
}

function newEvent() {
    console.log('>newEvent');
    let event = {
        "patternId": 0,
        "time": 0,
        "date": 0,
        "eventId": null
    };
    let id = $("#modalEventId").val();
    if (id !== '0') event.eventId = id;
    else event.eventId = null;
    event.patternId = $("#modalPatternId").val();
    event.date = $("input#inputDate").val();
    event.time = $("#inputTime").val();
    event.reason = $("#reScheduledDescription").val()
    var events = [];
    events.push(event);
    console.log(events);
    putEvent(events);
}

function getPatterns() {
    $.ajax({
        type: 'get',
        url: '/pattern',
        dataType: 'json',
        // username: 'ub',
        // password: 'ps',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('getPatterns');
            console.log(data);
            makePatternCard(data);
        }
    });
}

function makePatternCard(data) {
    let patternField = document.getElementById('pattern-row');
    patternField.innerHTML = '';
    let patternAmount = '';
    if (typeof data === "object") {
        patternAmount = data.length;
        for (let i = 0; i < data.length; i++) {
            let patten = data[i];
            let patternCard = document.createElement('div');
            patternCard.id = 'pattern' + patten.id;
            patternCard.data = patten;
            patternCard.classList.add('col-sm-4');
            patternCard.innerHTML +=
                '<div class = "card border-primary mb-4">' +
                '<div class = "card-header">' +
                '<div style="float: left"><strong>' + patten.type + '</strong>' +
                // '<span class="badge badge-primary">id:' + patternCard.data.patternId + '</span></a>'+
                '</div>' +
                '<div class=" rounded float-right ">' +
                '<img src="../login/EventAdd.png" class="img-fluid btn-outline-success ico newEvent" href="#" data-tooltip="tooltip" title="Заплпнировать событие" data-toggle="modal" data-target="#newEventModal">' +
                '<img src="../login/PatternEdit.png" class="img-fluid btn-outline-info ico editPattern" href="#" data-tooltip="tooltip" title="Редактировать шаблон" data-toggle="modal" data-target="#newPatternModal">' +
                '<img src="../login/PatternDelete.png" class="img-fluid btn-outline-danger ico delPater" href="#" data-tooltip="tooltip" title="Удалить шаблон" data-toggle="modal" data-target="#removeModal">' +
                '</div></div>' +
                '<div class = "card-body text-primary">' +
                '<p class="card-text">' + patten.description + '</p>' +
                '<h6 class="card-title">Количество учасников: ' + patten.number + '</h6>\n' +
                '<h6 class="card-title">Продолжительность: ' + patten.duration + ' мин</h6>';
            patternField.appendChild(patternCard);
        }
    }
    document.getElementById('pattern-amount').innerText = patternAmount;

    $(document).ready(function () {
        $('[data-tooltip="tooltip"]').tooltip();
    });

    $("#pattern-row .newEvent").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.data;
            console.log(data);
            data.eventId = 0;
            data.reason = true;
            data.label = 'Запланировать событие';
            fillModalEventForm(data);
        });
    $("#pattern-row .delPater").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.data;
            console.log(data);
            document.getElementsByClassName('removeId')[0].onclick =
                function () {
                    deletePattern(data.patternId, $("#removeDescription").val());
                }
        });
    $("#pattern-row .editPattern").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.data;
            console.log('>editPattern');
            console.log(data);
            $("input#inputPatternType").val(data.type);
            $("#inputDescription").val(data.description);
            $("input#inputNumber").val(data.number);
            $("input#inputDuration").val(data.duration);
            $("input#modalPattern_patternId").val(data.patternId);
        }
    );
}

function putPattern() {
    let pattern = {};
    pattern.patternId = $("input#modalPattern_patternId").val();
    pattern.type = $("input#inputPatternType").val();
    pattern.description = $("#inputDescription").val();
    pattern.number = $("input#inputNumber").val();
    pattern.duration = $("input#inputDuration").val();
    console.log('putPattern>>>');
    console.log(pattern);
    $.ajax({
        type: (pattern.patternId === "0") ? "POST" : "PUT",
        url: '/pattern',
        dataType: 'json',
        data: JSON.stringify(pattern),
        contentType: 'application/json',
        success: function (data) {
            console.log('/pattern<<<');
            console.log(data);
            getPatterns();
        }
    });
}

function newPattern() {
    console.log('>newPattern')
    $("input#modalPattern_patternId").val('0');
    $("input#inputPatternType").val('');
    $("#inputDescription").val('');
    $("input#inputNumber").val('');
    $("input#inputDuration").val('');
    // putPattern();
}

function deletePattern(id, description) {
    console.log(id);
    console.log(description);
    $.ajax({
        type: "delete",
        url: '/pattern/' + id,
        dataType: 'json',
        data: JSON.stringify({'Reason': description}),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getPatterns();
            getEvents();
        }
    });
}

// $(document).ready(function () {
//     $('#external-events .fc-event').each(function () {
//         // store data so the calendar knows to render an event upon drop
//         $(this).data('event', {
//             title: $.trim($(this).text()), // use the element's text as the event title
//             stick: true // maintain when user navigates (see docs on the renderEvent method)
//         });
//         // make the event draggable using jQuery UI
//         $(this).draggable({
//             zIndex: 999,
//             revert: true,      // will cause the event to go back to its
//             revertDuration: 0  //  original position after the drag
//         });
//     });
//     /* initialize the calendar
//     -----------------------------------------------------------------*/
//     initThemeChooser({
//         init: function (themeSystem) {
//             $('#calendar').fullCalendar({
//                 themeSystem: themeSystem,
//                 header: {
//                     left: 'prev,next today',
//                     center: 'title',
//                     right: 'month,agendaWeek,agendaDay,listMonth'
//                 },
//                 editable: true,
//                 droppable: true, // this allows things to be dropped onto the calendar
//                 drop: function () {
//                     // is the "remove after drop" checkbox checked?
//                     if ($('#drop-remove').is(':checked')) {
//                         // if so, remove the element from the "Draggable Events" list
//                         $(this).remove();
//                     }
//                 }
//             });
//
//         },
//         change: function (themeSystem) {
//             $('#calendar').fullCalendar('option', 'themeSystem', themeSystem);
//         }
//     });
// });