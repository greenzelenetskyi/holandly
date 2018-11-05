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

function newPattern() {
    console.log('>newPattern')
    $("input#modalPattern_patternId").val('0');
    $("input#inputPatternType").val('');
    $("#inputDescription").val('');
    $("input#inputNumber").val('');
    $("input#inputDuration").val('');
    // putPattern();
}

// var patternColors = [
//     'aqua',
//     'black',
//     'blue',
//     'fuchsia',
//     'gray',
//     'green',
//     'lime',
//     'maroon',
//     'navy',
//     'olive',
//     'purple',
//     'red',
//     'silver',
//     'teal',
//     'white',
//     'yellow',
// ];

// function appendPattern(data) {
//
//     var patternList = document.getElementById('external-events');
//     patternList.innerHTML = '<h4>Шаблоны событий</h4>';
//     var colorIndex = 0;
//     data.forEach(function (pattern, index, data) {
//         var patternElement = document.createElement('div');
//         patternElement.classList.add('fc-event');
//         patternElement.patternData = pattern;
//         patternElement.innerText = pattern.type;
//         patternList.appendChild(patternElement);
//         patternElement.id = 'patternId' + pattern.patternId;
//         patternElement.style.backgroundColor = patternColors[colorIndex];
//         patternElement.setAttribute('data-color', patternColors[colorIndex]);
//         pattern.color = patternColors[colorIndex];
//         colorIndex++;
//         if (colorIndex >= patternColors.length) {
//             colorIndex = 0;
//         }
//     });
//
//     $('#external-events .fc-event').each(function () {
//         $(this).data('event', {
//             title: $.trim($(this).text()), // use the element's text as the event title
//             stick: true,// maintain when user navigates (see docs on the renderEvent method)
//             patternData: this.patternData,
//             description: this.patternData.description,
//             color: $(this).data('color')
//         });
//
//         $(this).draggable({
//             zIndex: 999,
//             revert: true,      // will cause the event to go back to its
//             revertDuration: 0  //  original position after the drag
//         });
//     });
// }

