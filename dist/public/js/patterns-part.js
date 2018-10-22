
function getPatterns() {
    $.ajax({
        type: 'get',
        url: '/pattern',
        dataType: 'json',
        // username: 'ub',
        // password: 'ps',
        data: {},
        response: 'json',
        success: function (data) {
            console.log('getPatterns');
            console.log(data);
            makePatternCard(data);
        }
    });
}

function makePatternCard(data) {
    let patternField = document.getElementById('pattern-row');
    patternField.innerHTML = '';
    let patternAmount = '';
    if (typeof data === "object") {
        patternAmount = data.length;
        for (let i = 0; i < data.length; i++) {
            let patten = data[i];
            let patternCard = document.createElement('div');
            patternCard.id = 'pattern' + patten.id;
            patternCard.data = patten;
            patternCard.classList.add('col-sm-4');
            patternCard.innerHTML +=
                '<div class = "card border-primary mb-4">' +
                '<div class = "card-header">' +
                '<div style="float: left"><strong>' + patten.type + '</strong>' +
                // '<span class="badge badge-primary">id:' + patternCard.data.patternId + '</span></a>'+
                '</div>' +
                '<div class=" rounded float-right ">' +
                '<img src="../img/EventAdd.png" class="img-fluid btn-outline-success ico newEvent" href="#" data-tooltip="tooltip" title="Заплпнировать событие" data-toggle="modal" data-target="#event-modal-form">' +
                '<img src="../img/PatternEdit.png" class="img-fluid btn-outline-info ico editPattern" href="#" data-tooltip="tooltip" title="Редактировать шаблон" data-toggle="modal" data-target="#pattern-modal-form">' +
                '<img src="../img/PatternDelete.png" class="img-fluid btn-outline-danger ico delPater" href="#" data-tooltip="tooltip" title="Удалить шаблон" data-toggle="modal" removeType="pattern" data-target="#remove-modal-form">' +
                '</div></div>' +
                '<div class = "card-body text-primary">' +
                '<p class="card-text">' + patten.description + '</p>' +
                '<h6 class="card-title">Количество учасников: ' + patten.number + '</h6>\n' +
                '<h6 class="card-title">Продолжительность: ' + patten.duration + ' мин</h6>';
            patternField.appendChild(patternCard);
        }
    }
    document.getElementById('pattern-amount').innerText = patternAmount;

    $(document).ready(function () {
        $('[data-tooltip="tooltip"]').tooltip();
    });

    $("#pattern-row .newEvent").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.data;
            console.log(data);
            data.eventId = 0;
            data.reason = true;
            data.label = 'Запланировать событие';
            fillModalEventForm(data);
        });
    $("#pattern-row .delPater").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.data;
            console.log(data);
            remove =
            // document.getElementsByClassName('removeId')[0].onclick =
                function () {
                    deletePattern(data.patternId, $("#removeDescription").val());
                }
        });
    $("#pattern-row .editPattern").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.data;
            console.log('>editPattern');
            console.log(data);
            $("input#inputPatternType").val(data.type);
            $("#inputDescription").val(data.description);
            $("input#inputNumber").val(data.number);
            $("input#inputDuration").val(data.duration);
            $("input#modalPattern_patternId").val(data.patternId);
        }
    );
}

function putPattern() {
    let pattern = {};
    pattern.patternId = $("input#modalPattern_patternId").val();
    pattern.type = $("input#inputPatternType").val();
    pattern.description = $("#inputDescription").val();
    pattern.number = $("input#inputNumber").val();
    pattern.duration = $("input#inputDuration").val();
    console.log('putPattern>>>');
    console.log(pattern);
    $.ajax({
        type: (pattern.patternId === "0") ? "POST" : "PUT",
        url: '/pattern',
        dataType: 'json',
        data: JSON.stringify(pattern),
        contentType: 'application/json',
        success: function (data) {
            console.log('/pattern<<<');
            console.log(data);
            getPatterns();
        }
    });
}

function newPattern() {
    console.log('>newPattern')
    $("input#modalPattern_patternId").val('0');
    $("input#inputPatternType").val('');
    $("#inputDescription").val('');
    $("input#inputNumber").val('');
    $("input#inputDuration").val('');
    // putPattern();
}

function deletePattern(id, description) {
    console.log(id);
    console.log(description);
    $.ajax({
        type: "delete",
        url: '/pattern/' + id,
        dataType: 'json',
        data: JSON.stringify({'Reason': description}),
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            getPatterns();
            getEvents();
        }
    });
}
