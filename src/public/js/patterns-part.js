function makePatternCard(data) {
    // appendPattern(data);
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
                '<img src="../img/EventAdd.png" class="img-fluid btn-outline-success ico newEvent" href="#" data-tooltip="tooltip" title="Заплпнировать событие" >' +
                // '<img src="../img/EventAdd.png" class="img-fluid btn-outline-success ico newEvent" href="#" data-tooltip="tooltip" title="Заплпнировать событие" data-toggle="modal" data-target="#event-modal-form">' +
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
    // document.getElementById('patterns-amount').innerText = patternAmount;

    $(document).ready(function () {
        $('[data-tooltip="tooltip"]').tooltip();
    });

    $("#pattern-row .newEvent").click(
        function () {
            let data = this.parentNode.parentNode.parentNode.parentNode.data;
            console.log('======> Edit pattern');
            console.log(data);
            $('#patternEdit')[0].hidden = false;
            $('#patternsView')[0].hidden = true;
            var pattern = $('#editPatternType')[0];
            pattern.textContent = userPatterns[data.patternId].type;
            editPatternEvents.patternId = userPatterns[data.patternId].patternId;
            appentEvetntsToCalendar(userPatterns[editPatternEvents.patternId].scheduledEvents);
        });

    // $("#pattern-row .newEvent").click(
    //     function () {
    //         let data = this.parentNode.parentNode.parentNode.parentNode.data;
    //         console.log(data);
    //         data.eventId = 0;
    //         data.reason = true;
    //         data.label = 'Запланировать событие';
    //         fillModalEventForm(data);
    //     })

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




