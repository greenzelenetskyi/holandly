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
    $.ajaxSetup({
        headers: {
            'Authorization': "Basic " + btoa('user' + ':' + 'passw')
        }
    });
    var eventModalForm = $("#newEventModal");
    eventModalForm.submit(function (event) {
        event.preventDefault();
        newEvent();
        eventModalForm.modal('hide');
    });
    $("#removeModal").submit(function (event) {
        event.preventDefault();

        //alert("Submit prevented");
        $("#removeModal").modal('hide');
    });
    updateAll();
});

function updateAll() {
    getPatterns();
    getEvents();
    getVisitors();
}

function logOut() {
    console.log('logout');
    $.ajax({
        type: "get",
        url: '/logout',
        success: function (data, textStatus, request) {
            $.ajax({
                type: "get",
                url: "/",
                dataType: "html",
                success: function (data, textStatus, request) {
                    window.location = "/";
                }
            })
        }
    });
}
