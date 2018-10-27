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

$(document).ready(function () {
    // $.ajaxSetup({
    //     headers: {
    //         'Authorization': "Basic " + btoa('user' + ':' + 'passw')
    //     }
    // });

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
        remove();
        removeModalForm.modal('hide');
    });

    $(".updateData").click(function () {
        updateAll();
    });

    $(".logOut").click(function () {
        logOut();
    });

    updateAll();



});

var remove;

function updateAll() {
    getPatterns();
    getEvents();
    getVisitors();
}

function addHandlerEditEvent(element) {
    $(element).click(
        function (event) {
            var data = JSON.parse(this.getAttribute('data'));
            console.log(data);
            data.reason = false;
            data.label = 'Изменить событие';
            fillModalEventForm(data);
        }
    );
}

function addHandlerRemoveScheduledEvent(element) {
    $(element).click(
        function (event) {
            var data = JSON.parse(this.getAttribute('data'));
            console.log(data);
            remove = function () {
                deleteEvent(data.eventId, $("#removeDescription").val());
            };
        });
}

function addHandlerCancelVisitor(element) {
    $(element).click(
        function () {
            let data = {};
            data.email = this.getAttribute('email');
            data.eventId = this.getAttribute('eventId');
            console.log(data);
            remove = function () {
                data.reason = $("#removeDescription").val();
                cancelVisitor(data);
            };
        })
}


