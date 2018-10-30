function createTableVisitors(signedVisitors, eventId) {
    var tableVisitor = document.createElement('table');
    tableVisitor.classList.add('table', 'table-sm')
    tableVisitor.innerHTML =
        '<div class="col-7 " id="visitorsTable">' +
        '<thead><tr><td>#</td>' +
        '<td>Имя</td>' +
        '<td>E-mail</td>' +
        '<td>Отмена участия</td>' +
        '</tr></thead><tbody>';
    signedVisitors.forEach(function (visitor, index, signedVisitors) {
        tableVisitor.innerHTML +=
            '<tr>' +
            '<th scope="row">' + (index + 1) + '</th>' +
            '<td>' + visitor.name + '</td>' +
            '<td>' + visitor.email + '</td>' +
            '<td><button type="button" class="btn btn-link cancelVisitor" ' +
            'email="' + visitor.email + '" ' +
            'eventId="' + eventId + '"' +
            'removeType="visitor"' +
            'data-toggle="modal" data-target="#remove-modal-form">Отменить участие</button></td>' +
            '</tr>';
    });
    tableVisitor.innerHTML +=
        '</tbody>' +
        '</table>';
    return tableVisitor;
}

function createTimeEvent(timeEvent, date) {
    timeEvent.date = date;
    var TimeEvent = document.createElement('div');
    TimeEvent.classList.add("accordion");
    TimeEvent.id = 'accordionVisitorsList' + timeEvent.eventId;
    TimeEvent.data = timeEvent;

    var timeEnd = moment(timeEvent.time, 'hh:mm:ss');
    timeEnd.add(timeEvent.duration, 'minutes');
    TimeEvent.innerHTML +=
        '<div class="card">' +
        '<div class="card-header" id="heading' + timeEvent.eventId + '">' +
        '<div class="row ">' +
        '<div class="col-3">' +
        moment(timeEvent.time, 'hh:mm:ss').format("HH:mm") + '-' +
        moment(timeEnd, 'mm').format("HH:mm") +
        '</div><div class="col-3"><strong>' +
        timeEvent.type +
        '</strong></div><div class="col-3">' +
        'Участников ' + timeEvent.occupied + ' из ' + timeEvent.number +
        '</div><div class="col text-right"><a href="#" data-toggle="collapse" data-target="#collapse' + timeEvent.eventId + '" aria-expanded="false"' +
        'aria-controls="collapse' + timeEvent.eventId + '">Дополнительно</a></div></div></div>';

    TimeEvent.innerHTML +=
        '<div id="collapse' + timeEvent.eventId + '" class="collapse " aria-labelledby="heading' + timeEvent.eventId + '"' +
        'data-parent="#' + TimeEvent.id + '">' +
        '<div class="container align-items-center">' +
        '<div class="row ">' +
        '<div class="col-3 align-self-center">' +
        '<div class="btn-group-vertical">' +
        '<button type="button" class="btn btn-outline-success reScheduledEvents" data-toggle="modal" data-target="#event-modal-form"' +
        'data=' + JSON.stringify(timeEvent) + '>' +
        'Перепланировать' +
        '</button>' +
        '<button type="button" data-toggle="modal" data-target="#remove-modal-form" ' +
        'class="btn btn-outline-info removeScheduledEvents"' +
        'data=' + JSON.stringify(timeEvent) + '>' +
        'Отменить' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="col-7 " id="visitorsTable' + timeEvent.eventId + '">' +
        createTableVisitors(timeEvent.visitors, timeEvent.eventId).outerHTML;
    return TimeEvent;
}

function createDateEvent(dateEvent, dateIndex) {
    var dateElement = document.createElement('div');
    dateElement.classList.add('shadow-lg', 'p-3', 'mb-5', 'bg-white', 'rounded');
    dateElement.innerHTML = '<strong>' + moment(dateEvent.date).format('DD/MM/YYYY') + '</strong><hr>';
    var date = dateEvent.date;
    dateEvent.appointments.forEach(function (timeEvent, index, dateEvent) {
        dateElement.appendChild(createTimeEvent(timeEvent, date));
    });
    return dateElement;
}

function makeVisitorsList(signedVisitorsList) {
    var visitorsField = document.getElementById('div-dashboard');
    visitorsField.innerHTML = '';
    if (typeof signedVisitorsList === "object") {
        signedVisitorsList.forEach(function (dateEvent, index, signedVisitorsList) {
            visitorsField.appendChild(createDateEvent(dateEvent, index));
        });
        // document.getElementById('visitors-amount').innerText = getVisitorEventsAmount(signedVisitorsList);
        addHandlerRemoveScheduledEvent('.removeScheduledEvents');
        addHandlerCancelVisitor('.cancelVisitor');
        addHandlerEditEvent('.reScheduledEvents');
    }
}

function getVisitorEventsAmount(signedVisitorsList) {
    var amount = 0;
    signedVisitorsList.forEach(function (dateEvent, index, signedVisitorsList) {
        dateEvent.appointments.forEach(function (timeEvents, i, dateEvent) {
            amount++;
        })
    });
    return amount;
}


// function makeVisitorsList2(signedVisitorsList) {
//     var visitorsField = document.getElementById('div-dashboard');
//     visitorsField.innerHTML = '';
//     var eventAmount = 0;
//     if (typeof signedVisitorsList === "object") {
//         for (let d = 0; d < signedVisitorsList.length; d++) {
//             let DayEvents = document.createElement('div');
//             DayEvents.id = 'dateEvent' + d;
//             DayEvents.classList.add('shadow-lg', 'p-3', 'mb-5', 'bg-white', 'rounded');
//             DayEvents.innerHTML = '<strong>' + moment(signedVisitorsList[d].date).format('DD/MM/YYYY') + '</strong><hr>';
//             let visitorsListColapse = document.createElement('div');
//             visitorsListColapse.classList.add("accordion");
//             visitorsListColapse.id = 'accordionVisitorsList' + DayEvents.id;
//             visitorsField.appendChild(DayEvents);
//
//             let timeEvents = signedVisitorsList[d].appointments;
//             for (let t = 0; t < timeEvents.length; t++) {
//                 let TimeEvent = document.createElement('div');
//                 TimeEvent.classList.add("accordion");
//                 TimeEvent.id = 'accordionVisitorsList' + DayEvents.id;
//                 TimeEvent.data = {
//                     'date': signedVisitorsList[d].date,
//                     'time': timeEvents[t].time,
//                     'eventId': timeEvents[t].eventId,
//                     'patternId': timeEvents[t].patternId
//                 };
//                 let timeEnd = moment(timeEvents[t].time, 'hh:mm:ss');
//                 timeEnd.add(timeEvents[t].duration, 'minutes');
//                 TimeEvent.innerHTML +=
//                     '<div class="card">' +
//                     '<div class="card-header" id="heading' + eventAmount + '">' +
//                     '<div class="row ">' +
//                     '<div class="col-3">' +
//                     moment(timeEvents[t].time, 'hh:mm:ss').format("HH:mm") + '-' +
//                     moment(timeEnd, 'mm').format("HH:mm") +
//                     '</div><div class="col-3"><strong>' +
//                     timeEvents[t].type +
//                     '</strong></div><div class="col-3">' +
//                     'Участников ' + timeEvents[t].occupied + ' из ' + timeEvents[t].number +
//                     '</div><div class="col text-right"><a href="#" data-toggle="collapse" data-target="#collapse' + eventAmount + '" aria-expanded="false"' +
//                     'aria-controls="collapse' + eventAmount + '">Дополнительно</a></div></div></div>';
//
//                 TimeEvent.innerHTML +=
//                     '<div id="collapse' + eventAmount + '" class="collapse " aria-labelledby="heading' + eventAmount + '"' +
//                     'data-parent="#' + TimeEvent.id + '">' +
//                     '<div class="container align-items-center">' +
//                     '<div class="row ">' +
//                     '<div class="col-3 align-self-center">' +
//                     '<div class="btn-group-vertical">' +
//                     '<button type="button" class="btn btn-outline-success reScheduledEvents" data-toggle="modal" data-target="#event-modal-form">' +
//                     'Перепланировать' +
//                     '</button>' +
//                     '<button type="button" data-toggle="modal" data-target="#remove-modal-form" ' +
//                     'class="btn btn-outline-info removeScheduledEvents">' +
//                     'Отменить' +
//                     '</button>' +
//                     '</div>' +
//                     '</div>' +
//                     '<div class="col-7 " id="visitorsTable' + eventAmount + '">';
//                 let tableVisitor = document.createElement('table');
//                 tableVisitor.classList.add('table', 'table-sm')
//                 tableVisitor.innerHTML =
//                     '<thead><tr><td>#</td>' +
//                     '<td>Имя</td>' +
//                     '<td>E-mail</td>' +
//                     '<td>Отмена участия</td>' +
//                     '</tr></thead><tbody>';
//
//                 let visitorsEvents = timeEvents[t].visitors;
//                 for (let v = 0; v < visitorsEvents.length; v++) {
//                     tableVisitor.innerHTML +=
//                         '<tr>' +
//                         '<th scope="row">' + v + '</th>' +
//                         '<td>' + visitorsEvents[v].name + '</td>' +
//                         '<td>' + visitorsEvents[v].email + '</td>' +
//                         '<td><button type="button" class="btn btn-link cancelVisitor" ' +
//                         'email="' + visitorsEvents[v].email + '" ' +
//                         'eventId="' + timeEvents[t].eventId + '"' +
//                         'removeType="visitor"' +
//                         'data-toggle="modal" data-target="#remove-modal-form">Отменить участие</button></td>' +
//                         '</tr>';
//                 }
//                 tableVisitor.innerHTML +=
//                     '</tbody>' +
//                     '</table>';
//                 visitorsListColapse.appendChild(TimeEvent);
//                 DayEvents.appendChild(visitorsListColapse);
//                 let id = 'visitorsTable' + eventAmount;
//                 let element = document.getElementById(id);
//                 element.appendChild(tableVisitor);
//                 eventAmount++;
//             }
//         }
//     }
//
//     if (signedVisitorsList.length > 0)
//         document.getElementById('visitors-amount').innerText = eventAmount;
//
//     addHandlerEditEvent(".reScheduledEvents", this.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.data);
//     addEventRemoveScheduledEvent();
//     addEventCancelVisitor();
// }


