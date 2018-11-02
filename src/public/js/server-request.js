function getVisitors() {
    $.ajax({
        type: 'get',
        url: '/edit/scheduled',
        dataType: 'json',
        data: {},
        response: 'json',
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
        url: '/edit/cancel',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getEvents();
            getVisitors();
        }
    });
}

function getEvents() {
    $.ajax({
        type: 'get',
        url: '/edit/events',
        dataType: 'json',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('received events');
            console.log(data);
            var tempEvents = {};
            data.forEach(function (event, index, data) {
                tempEvents[event.eventId] = event;
            });
            events = tempEvents;
            //appentEvetntsToCalendar(events);
           //makeEventsPoint(data);
        }
    });
}

function putEvent(events) {
    console.log('>putEvent');
    console.log(events);
    $.ajax({
        type: "POST",
        url: '/edit/events',
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
        url: '/edit/events/' + id,
        data: JSON.stringify({'Reason': description}),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getEvents();
            getVisitors();
        }
    });
}

function getPatterns() {
    $.ajax({
        type: 'get',
        url: '/edit/pattern',
        dataType: 'json',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('received patterns');
            console.log(data);
            var tempPatterns = {};
            data.forEach(function (pattern, index, data) {
                tempPatterns[pattern.patternId] = pattern;
            });
            patterns = tempPatterns;
            makePatternCard(data);
        }
    });
}

function putPattern() {
    let pattern = {};
    pattern.patternId = $("input#modalPattern_patternId").val();
    pattern.patternId = pattern.patternId < 1 ? 0 : pattern.patternId;
    pattern.type = $("input#inputPatternType").val();
    pattern.description = $("#inputDescription").val();
    pattern.number = $("input#inputNumber").val();
    pattern.duration = $("input#inputDuration").val();
    console.log('putPattern>>>');
    console.log(pattern);
    $.ajax({
        type: (pattern.patternId === 0) ? "POST" : "PUT",
        url: '/edit/pattern',
        data: JSON.stringify(pattern),
        contentType: 'application/json',
        success: function (data) {
            console.log('/pattern<<<');
            console.log(data);
            getPatterns();
        }
    });
}

function deletePattern(id, description) {
    console.log(id);
    console.log(description);
    $.ajax({
        type: "delete",
        url: '/edit/pattern/' + id,
        data: JSON.stringify({'Reason': description}),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getPatterns();
            getEvents();
        }
    });
}

function logOut() {
    console.log('logout');
    $.ajax({
        type: "get",
        url: '/edit/logout',
        success: function (data, textStatus, request) {
            $.ajax({
                type: "get",
                url: "/edit",
                dataType: "html",
                success: function (data, textStatus, request) {
                    window.location = "/edit";
                }
            })
        }
    });
}

function getVisitorsList() {
    console.log('getVisitorsList');
    $.ajax({
        type: 'get',
        url: '/edit/pattern',
        dataType: 'json',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('getVisitorsList');
            console.log(data);
            return (data);
        }
    });
}