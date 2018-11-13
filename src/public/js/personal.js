function logoVisibility() {
    $elMenu = $('#menuLogo');
    if ($(window).width() < 800) {
        $elMenu.hide();
    }
    else {
        $elMenu.show();
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
        if (!!remove) {
            remove();
        }
        removeModalForm.modal('hide');
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
    $("input#inputDate").val(moment(data.date).format('YYYY-MM-DD'));
    $("#inputTime").val(data.time);
}

function newEvent() {
    var events = [];
    events.push({
        patternId: $("#modalPatternId").val(),
        eventId: $("#modalEventId").val(),
        date: $("input#inputDate").val(),
        time: $("#inputTime").val(),
        reason: $("#reScheduledDescription").val()
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
            if (!!event) {
                $('#descriptionText')[0].innerText =
                    'Удаление события [' + event.type + '] \n заплпнированого на [' +
                    moment(event.time, 'hh:mm:ss').format("HH:mm") + '  ' +
                    moment(event.date).format('DD/MM/YYYY') + ']';
                remove = function () {
                    deleteEvent(event.eventId, $("#reason").val());
                };
                $('#remove-modal-form').modal();
            }
            else {
                console.log(this);
                this.parentNode.parentNode.removeChild(this.parentNode);
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
                eventId: this.getAttribute('data-eventId')
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


