
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
                '<a class="dropdown-item updateEvent" href="#" data-toggle="modal" data-target="#event-modal-form">Перепланировать</a>' +
                '<a class="dropdown-item delEvent" data-toggle="modal" data-target="#remove-modal-form" ' +
                'removeType="event"'+
                'href="#">Отменить</a>' +
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
            remove=
            // document.getElementsByClassName('removeId')[0].onclick =
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
