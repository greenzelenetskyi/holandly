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

function setMenuVisible() {
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
        setMenuVisible();
    });
    setMenuVisible();
    // $.ajaxSetup({
    //     headers: {
    //         'Authorization': "Basic " + btoa('user' + ':' + 'passw')
    //     }
    // });

    var patternModalForm = $("#pattern-modal-form");
    patternModalForm.submit(function (event) {
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
        remove();
        removeModalForm.modal('hide');
    });

    $(".updateData").click(function () {
        updateAll();
    });

    $("#logOut").click(function () {
        logOut();
    });

    updateAll();


});


var remove;
var events = {};
var patterns = {};

function updateAll() {
    getPatterns();
    getEvents();
    getVisitors();
}

function addHandlerEditEvent(element) {
    $(element).click(
        function (event) {
            data = events[this.getAttribute('data-eventId')];
            console.log(data);
            data.reason = false;
            data.label = 'Изменить событие';
            fillModalEventForm(data);
        }
    );
}

function addHandlerRemoveScheduledEvent(element) {
    $(element).click(
        function (handlerEvent) {
            var event = events[this.getAttribute('data-eventId')];
            // console.log(event);
            $('#descriptionText')[0].innerText =
                'Удаление события [' + event.type + '] заплпнированого на [' +
                moment(event.time, 'hh:mm:ss').format("HH:mm") + '  ' +
                moment(event.date).format('DD/MM/YYYY') + ']';
            remove = function () {
                deleteEvent(event.eventId, $("#removeDescription").val());
            };
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


