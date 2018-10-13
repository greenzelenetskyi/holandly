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

$.ajaxSetup({
    headers: {
        'Authorization': "Basic " + btoa('user' + ':' + 'passw')
    }
});

$("li").hover(
    function () {
        $(this).css({
            fontWeight: "bolder"
        });
        $(this).click(function (eventObject) {
            console.log(eventObject);
            //TabsSelect();
            console.log(this.data - value);
            removeTask(this.parentNode.data.index);
        });
    },
    function () {
        var cssObj = {
            fontWeight: "normal",
        };
        $(this).css(cssObj);
    }
);

window.onload = function () {
    console.log('------------------>');
    $(function () {
        $('[data-toggle="popover"]').popover()
    })

    $(function () {
        $('.example-popover').popover({
            container: 'body'
        })
    })

    $('.popover-dismiss').popover({
        trigger: 'focus'
    })
    getPatterns();
    getEvents();
    deleteEvent(1);
};

function TabsSelect() {
    var penel = document.getElementById('pattern');
    penel.hidden = true;
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
            console.log(data);
            makeEventsPoint(data);
        }
    });
}

function makeEventsPoint(data) {
    let eventField = document.getElementById('div-event');
    eventField.innerHTML = '';
    let eventAmount = 0;
    for (let i = 0; i < data.length; i++) {

        let PatternEvent = $('#PatternEvent' + data[i].patternId);
        if (PatternEvent.length === 0) {
            PatternEvent = document.createElement('div');
            PatternEvent.classList.add('alert', 'alert-success', 'text-left');
            PatternEvent.id = 'PatternEvent' + data[i].patternId;
            let type = $('#pattern' + data[i].patternId);
            PatternEvent.innerHTML =
                ' <div className="alert alert-success text-left" role="alert">' +
                '<strong>' + type[0].data.patternType + '</strong><hr>';
            eventField.appendChild(PatternEvent);
            eventAmount++;
        }
        else
            PatternEvent = PatternEvent[0];

        let eventCard = document.createElement('div');
        eventCard.classList.add("btn-group");
        eventCard.role = "group";
        eventCard.data = {patternId: data[i].patternId, eventId: data[i].id};
        eventCard.innerHTML +=
            '<button id="btnGroupDrop2" type="button" class="btn btn-outline-dark dropdown-toggle"' +
            '       data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            data[i].date + '<br/>' +
            data[i].time + '<br/>' +
            'Своб.8/6' +
            '</button>';
        eventCard.innerHTML +=
            '<div class="dropdown-menu" aria-labelledby="btnGroupDrop1">' +
            '<a class="dropdown-item updateEvent" href="#">Перепланировать</a>' +
            '<a class="dropdown-item delEvent" href="#">Отменить</a>' +
            '</div>';
        PatternEvent.appendChild(eventCard);
    }
    if (eventAmount > 0)
        document.getElementById('event-amount').innerText = eventAmount;
    $("#div-event .updateEvent").click(
        function () {
            console.log(this.parentNode.parentNode.data);
            //updateEvent(this.parentNode.parentNode.data);

            $("#modalPatternId").val(this.parentNode.parentNode.data.patternId);
            $("#modalEventId").val(this.parentNode.parentNode.data.eventId);
        }
    );

    $("#div-event .delEvent").click(
        function () {
            console.log(this.parentNode.parentNode.data.eventId);
            deleteEvent(this.parentNode.parentNode.data.eventId);
        }
    );
}

function formatDate(date) {
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;
    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;
    var yy = date.getFullYear() % 100;
    if (yy < 10) yy = '0' + yy;
    return dd + '.' + mm + '.' + yy;
}

function putEvent(events) {
    $.ajax({
        type: "POST",
        url: '/events',
        dataType: 'json',
        data: JSON.stringify(events),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getEvents();
        }
    });
}

function deleteEvent(id) {
    $.ajax({
        type: "delete",
        url: '/event/' + id,
        dataType: 'json',
        data: '',
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getEvents();
        }
    });
}

function updateEvent(evenObj) {
    $("#modalPatternId").val(evenObj.patternId);
    $("#modalEventId").val(evenObj.eventId);
    event.patternID = $("#modalPatternId").val();
    event.date = $("input#inputDate").val();
    event.time = $("#inputTime").val();
    event.patternID = $("#modalEvent").val();
    event.date = $("input#inputDate").val();
    event.time = $("#inputTime").val();
    var events = [];
    events.push(event);
    console.log(events);
    putEvent(events);
}

function newEvent() {
    let event = {
        "patternID": 0,
        "time": 0,
        "date": 0,
        "id": 0
    };
    event.id = $("#modalEventId").val();
    event.patternID = $("#modalPatternId").val();
    event.date = $("input#inputDate").val();
    event.time = $("#inputTime").val();
    var events = [];
    events.push(event);
    console.log(events);
    putEvent(events);
}

function getPatterns() {
    $.ajax({
        type: 'get',
        url: '/pattern',
        // url: 'http://andrey.4.holateam.io:8130/data',
        dataType: 'json',
        username: 'ub',
        password: 'ps',
        data: {},
        response: 'json',
        success: function (data) {
            console.log(data);
            makePatternCard(data);
        }
    });
}

function makePatternCard(data) {
    var patternField = document.getElementById('pattern-row');
    patternField.innerHTML = '';
    document.getElementById('pattern-amount').innerText = data.length;
    for (let i = 0; i < data.length; i++) {
        let pattenn = data[i];
        var patternCard = document.createElement('div');
        patternCard.id = 'pattern' + pattenn.id;
        patternCard.data = {'patternID': pattenn.id, 'patternType': pattenn.type};
        patternCard.classList.add('col-sm-4');
        patternCard.innerHTML +=
            '<div class = "card border-primary mb-4">' +
            '<div class = "card-header">' +
            '<button id="btnGroupDrop2" type="button" class="btn btn-link dropdown-toggle"' +
            '       data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
            '<strong>' + pattenn.type + '</strong>' +
            '</button>' +
            '<div class="dropdown-menu" aria-labelledby="btnGroupDrop1">' +
            '<a class="dropdown-item newEvent" href="#" data-toggle="modal" data-target="#newEventModal"> Добавить в расписание</a>' +
            '<a class="dropdown-item delPater" href="#">Удалить</a>' +
            '</div>' +
            '<span class="badge badge-warning">' + patternCard.data.patternID + '</span></a>' +
            '</div>' +
            '<div class = "card-body text-primary">' +
            '<p class="card-text">' + pattenn.description + '</p>' +
            '<h6 class="card-title">Количество учасников: ' + pattenn.number + '</h6>\n' +
            '<h6 class="card-title">Продолжительность: ' + pattenn.duration + ' мин</h6>';
        // '<button type="button" class="btn btn-primary"' +
        // 'data-toggle="modal" data-target="#newEventModal">' +
        // ' +Добавить в расписание </button>';
        patternField.appendChild(patternCard);
    }
    $("#pattern-row .newEvent").click(
        function () {
            console.log(this.parentNode.parentNode.parentNode.parentNode.data.patternID);
            $("#modalPatternId").val(this.parentNode.parentNode.parentNode.parentNode.data.patternID);
            $("#modalEventId").val(0);

        }
    );
    $("#pattern-row .delPater").click(
        function () {
            console.log(this.parentNode.parentNode.parentNode.parentNode.data.patternID);
            deletePattern(this.parentNode.parentNode.parentNode.parentNode.data.patternID);
        }
    );
}

function putPattern(pattern) {
    $.ajax({
        type: "POST",
        url: '/pattern',
        dataType: 'json',
        data: JSON.stringify(pattern),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getPatterns();
        }
    });
}

function newPattern() {
    let pattern = {
        "type": '',
        "number": 0,
        "duration": 0,
        "description": '',
        "id": 0
    };
    pattern.type = $("input#inputPatternType").val();
    pattern.description = $("#inputDescription").val();
    pattern.number = $("input#inputNumber").val();
    pattern.duration = $("input#inputDuration").val();
    putPattern(pattern);
}

function deletePattern(id) {
    $.ajax({
        type: "delete",
        url: '/pattern/' + id,
        dataType: 'json',
        data: '',
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getPatterns();
        }
    });
}
