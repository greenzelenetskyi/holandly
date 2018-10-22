

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