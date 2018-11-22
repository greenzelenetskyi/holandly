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
    removeEvents();
    $.ajax({
        type: 'get',
        url: '/edit/events',
        dataType: 'json',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('======> Events');
            console.log(data);
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
    if (!!editPatternEvents.patternId)
        viewPatternEvents(userPatterns[editPatternEvents.patternId].scheduledEvents);
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
    var pattern = {
        patternId: $("#modalPattern_patternId").val(),
        type: $("input#inputPatternType").val(),
        description: $("#inputDescription").val(),

        number: $("input#inputNumber").val(),
        duration: $("input#inputDuration").val(),
        multiaccess: $("#inputMultiAccess").is(':checked') === true ? 1 : 0,
        hasApiHook: $("#inputWebHookEnable").is(':checked') === true ? 1 : 0,
    };
    console.log('putPattern>>>');
    console.log(pattern);
    $.ajax({
        type: (pattern.patternId === '0') ? "POST" : "PUT",
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


function apiDataForm(data) {
    $('#apiKey').val(data.apikey);
    $('#endpointData').val(data.endpoints);
    $('#aboutData').val(data.about);
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
            apiDataForm(data);
        }
    });
}

function updateEnpoint(apiData) {
    console.log('>updateEnpoint');
    $.ajax({
        type: "POST",
        url: '/edit/apiData',
        data: JSON.stringify(apiData),
        contentType: 'application/json',
        success: function (data) {
            console.log('======> updateEnpoint');
            console.log(data);
        }
    });
}


function generateApiKey() {
    console.log('>generateApiKey');
    $.ajax({
        type: "PUT",
        url: '/edit/apiData',
        data: {},
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            apiDataForm(data);
        }
    });
}