function logoVisibility() {
    var Menu = $('#menuLogo');
    if ($(window).width() < 800) {
        Menu.hide();
    }
    else {
        Menu.show();
    }
}

$(document).ready(function () {
    $(window).resize(function () {
        logoVisibility();
    });
    logoVisibility();
    addHandlerFormSubmit();


    $(".updateData").click(function () {
        updateAll();
    });

    $("#logOut").click(function () {
        logOut();
    });

    updateAll();
});

function addHandlerFormSubmit() {
    var patternModalForm = $("#pattern-modal-form");
    patternModalForm.submit(function (event) {
        event.preventDefault();
        putPattern();
        patternModalForm.modal('hide');
    });

    var eventModalForm = $("#event-modal-form");
    eventModalForm.submit(function (event) {
        event.preventDefault();
        newEvent();
        eventModalForm.modal('hide');
    });

    var removeModalForm = $("#remove-modal-form");
    removeModalForm.submit(function (event) {
        event.preventDefault();
        removeModalForm.modal('hide');
        if (!!remove) {
            remove();
        }
    });
}


var remove;

function updateAll() {
    getPatterns();
    getVisitors();
}

function fillModalEventForm(data) {
    $("#modalPatternId").val(data.patternId);
    $("#modalEventId").val(data.eventId);
    $("#inputDate").val(moment(data.date).format('YYYY-MM-DD'));
    $("#inputTime").val(data.time);
    $("#oldDate").val(moment(data.date).format('YYYY-MM-DD'));
    $("#oldTime").val(data.time);
    $("#eventDuration").val(userPatterns[data.patternId].duration);
}

function newEvent() {
    var events = [];
    events.push({
        patternId: $("#modalPatternId").val(),
        eventId: $("#modalEventId").val(),
        date: $("#inputDate").val(),
        time: $("#inputTime").val(),
        dateOld: $("#oldDate").val(),
        timeOld: $("#oldTime").val(),
        reason: $("#reScheduledDescription").val(),
        duration: $("#eventDuration").val()
    });
    putEvent(events);
}

function addHandlerEditEvent(element) {
    $(element).click(
        function (event) {
            data = userEvents[this.getAttribute('data-eventId')];
            console.log(data);
            fillModalEventForm(data);
        }
    );
}

function addHandlerRemoveScheduledEvent(element) {
    $(element).click(
        function (handlerEvent) {
            console.log(this);
            console.log(handlerEvent);
            var event = userEvents[this.getAttribute('data-eventId')];
            var nodeTime = this.parentNode;
            if (!!event) {
                $('#descriptionText')[0].innerText =
                    'Удаление события [' + event.type + '] \n заплпнированого на [' +
                    moment(event.time, 'hh:mm:ss').format("HH:mm") + '  ' +
                    moment(event.date).format('DD/MM/YYYY') + ']';
                remove = function () {
                    deleteEvent(event.eventId, $("#reason").val());
                    nodeTime.parentNode.removeChild(nodeTime);
                };
                $('#remove-modal-form').modal();
            }
            else {
                console.log(this);
                nodeTime.parentNode.removeChild(nodeTime);
            }
        });
}


function addHandlerRemovePattern(element) {
    $(element).click(
        function (handlerEvent) {
            var pattern = userPatterns[this.getAttribute('data-patternID')];
            $('#descriptionText')[0].innerText =
                'Удаление шаблона [' + pattern.type + '] со всеми заплпнированими собитиями';
            remove = function () {
                deletePattern(pattern.patternId, $("#reason").val());
            };
            $('#remove-modal-form').modal();
        });
}

function addHandlerEditPattern(element) {
    $(element).click(
        function (handlerEvent) {
            var pattern = userPatterns[this.getAttribute('data-patternID')];
            console.log('======> Edit pattern');
            console.log(pattern);
            $("#inputPatternType").val(pattern.type);
            $("#inputDescription").val(pattern.description);
            $("#inputNumber").val(pattern.number);
            $("#inputDuration").val(pattern.duration);
            $("#modalPattern_patternId").val(pattern.patternId);
            $("#inputMultiAccess").prop('checked', (pattern.multiaccess === '1' || pattern.multiaccess === 1));
            $("#inputWebHookEnable").prop('checked', (pattern.hasApiHook === '1' || pattern.hasApiHook === 1));
        });
}

function addHandlerPatternScheduler(element) {
    $(element).click(
        function (handlerEvent) {
            var pattern = userPatterns[this.getAttribute('data-patternID')];
            console.log('======> Edit schedule');
            console.log(pattern);
            $('#patternEdit')[0].hidden = false;
            $('#patternsView')[0].hidden = true;
            $('#editPatternType')[0].textContent = pattern.type;
            pattern.textContent = pattern.type;
            editPatternEvents.patternId = pattern.patternId;
            viewPatternEvents(pattern.scheduledEvents);
        });
}

function addHandlerCancelVisitor(element) {
    $(element).click(
        function () {
            console.log(this);
            var data = {
                email: this.getAttribute('data-email'),
                eventId: this.getAttribute('data-eventId'),
                visitorId: this.getAttribute('data-visitorId')
            };
            $('#descriptionText')[0].innerText =
                'Отмена участия: ' + this.getAttribute('data-visitor') + ' [' + data.email + ']';
            console.log(data);
            remove = function () {
                data.reason = $("#reason").val();
                cancelVisitor(data);
            };
        })
}


$(document).ready(function () {
    var modalWebHook = $('#webhook-modal-form');
    modalWebHook
        .on('show.bs.modal', function (event) {
            // console.log(event);
            // console.log(this);
            // console.log('webhook show');
            getApiData();
        })
        .on('hide.bs.modal', function () {
            // console.log('webhook hide')
        })
        .on('submit.bs.modal', function (event) {
            event.preventDefault();
            // console.log('webhook submit');
            updateEnpoint({
                endpoints: $('#endpointData').val(),
                about: $('#aboutData').val(),
            });
            modalWebHook.modal('hide');
        });
    $('#apiKayGenerate').on('click', function () {
        generateApiKey();
    })
});

//
// $(document).ready(function () {
//     $('#pattern-modal-form')
//         .on('show.bs.modal', function (event) {
//             console.log(event);
//             console.log(this);
//             console.log('pattern show');
//
//         })
//         .on('hide.bs.modal', function () {
//             console.log('pattern hide')
//         })
//         .on('submit.bs.modal', function (event) {
//             event.preventDefault();
//             console.log('pattern submit');
//
//         });
// });
