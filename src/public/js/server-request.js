function getVisitors() {
    $.ajax({
        type: 'get',
        url: '/edit/scheduled',
        dataType: 'json',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('======> Visitors');
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
            console.log('======> Events');
            console.log(data);
            removeEvents();
            addEvents(data);
            if (!!editPatternEvents.patternId)
                viewPatternEvents(userPatterns[editPatternEvents.patternId].scheduledEvents);
        }
    });
}

function addEvents(eventsArray) {
    userEvents = {};
    eventsArray.forEach(function (event, index, data) {
        userEvents[event.eventId] = event;
        userPatterns[event.patternId].scheduledEvents.push(event);
    });
}

function removeEvents() {
    Object.values(userPatterns).forEach(function (patternEvent) {
        patternEvent.scheduledEvents = [];
    });
}

function putEvent(eventsData) {
    console.log('>putEvent');
    console.log(eventsData);
    $.ajax({
        type: "POST",
        url: '/edit/events',
        data: JSON.stringify(eventsData),
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
            console.log('======> Patterns');
            console.log(data);
            var tempPatterns = {};
            data.forEach(function (pattern, index, data) {
                tempPatterns[pattern.patternId] = pattern;
                tempPatterns[pattern.patternId].scheduledEvents = [];

            });
            // patterns = tempPatterns;
            userPatterns = tempPatterns;
            getEvents();
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
    pattern.hasApiHook = $("#inputWebHookEnable").val()==="on"?1:0;
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


function getApiData() {
    console.log('> getApiData');
    $.ajax({
        type: 'get',
        url: '/edit/apiData',
        dataType: 'json',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('======> getApiData');
            console.log(data);
            //fillOptionsForm(data);
        }
    });
}

function updateEnpoint(endpointData) {
    console.log('>updateEnpoint');
    console.log(endpointData);
    $.ajax({
        type: "POST",
        url: '/edit/apiData',
        data: JSON.stringify({endpoints: endpointData}),
        contentType: 'application/json',
        success: function (data) {
            console.log('======> updateEnpoint');
            console.log(data);
            generateApiKay();
        }
    });
}

function generateApiKay() {
    console.log('>generateApiKay');
    $.ajax({
        type: "PUT",
        url: '/edit/apiData',
        data: {},
        contentType: 'application/json',
        success: function (data) {
            console.log(data);

        }
    });
}