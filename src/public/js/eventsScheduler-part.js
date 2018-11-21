var userPatterns = {};
var editPatternEvents = {};

$(document).ready(function () {
    $('#eventScheduler .tab-content').hide();
    $('#select-repeat').change(function sr() {
        $('#eventScheduler .tab-content').hide();
        var dropdown = $('#select-repeat').val();
        $('#' + "tab-" + dropdown).show();
        $('#finalDate').val(moment(editPatternEvents.endDate).format('YYYY-MM-DD'));
    });

    $('.addStartTime').click(function () {
        appendTimeToSchedule();
        addHandlerRemoveScheduledEvent('.removeEvent');
    });

    var editPatternTimeModalForm = $("#editEvents-modal-form");
    editPatternTimeModalForm.submit(function (event) {
        event.preventDefault();
        editPatternTimeModalForm.modal('hide');
        editPatternEvents.newTimes = getScheduledTimes();
        editPatternEvents.newDates = getScheduledDates();
        saveEditedEvents(editPatternEvents);
    });

    $('#closeCalendar').click(function () {
        $('#patternEdit')[0].hidden = true;
        $('#patternsView')[0].hidden = false;
    });

    $('#pattern-modal-form').on('hide.bs.modal', function () {
        setDefaultPatternData();
    });
});

function setDefaultPatternData() {
    console.log('hide pattern-modal-form');
    $("#modalPattern_patternId").val('0');
    $("#inputPatternType").val('');
    $("#inputDescription").val('');
    $("input#inputNumber").val('1');
    $("input#inputDuration").val('60');
    $("#inputMultiAccess").prop('checked', true);
    $("#inputWebHookEnable").prop('checked', false);
}

function appendTimeToSchedule(timeEvent) {
    var elem = document.createElement('div');
    var tempTime = document.getElementById('templateStarTime').cloneNode(true).innerHTML;
    if (!!timeEvent) {
        tempTime = tempTime.replace(/data-value=""/gi, 'value = \'' + timeEvent.time + '\'');
        tempTime = tempTime.replace(/data-eventId="0"/gi, 'data-eventId= \'' + timeEvent.eventId + '\'');
    }
    elem.innerHTML = tempTime;
    document.getElementById('eventStartTimes').appendChild(elem);
    //addHandlerRemoveScheduledEvent('.removeEvent');
}

function getScheduledTimes() {
    var times = [];
    $('.liTime').each(function (i, el) {
        if (el.value !== '')
            times.push({time: el.value, eventId: el.getAttribute('data-eventId')})
    });
    return times;
}

function getScheduledDates() {
    var dates = [];
    var repeatOption = $('#select-repeat').val();
    if (repeatOption === '3') {
        return editPatternEvents.selectedDates;//getDates(editPatternEvents.startDate, editPatternEvents.endDate);
    }
    if (repeatOption === '2') {
        editPatternEvents.endDate = $('#finalDate').val();
        var selectedDay = [];
        $('.dayOfWeek').each(function (i) {
            if ($(this)[0].checked) {
                selectedDay.push($(this)[0].getAttribute('selectDayCode') * 1);
            }
        });
        return getDates(editPatternEvents.startDate, editPatternEvents.endDate, selectedDay);
    }
    return getDates(editPatternEvents.startDate, editPatternEvents.endDate);
}

function saveEditedEvents(editPatternEvents) {
    var events = [];
    editPatternEvents.newTimes.forEach(function (editTime) {
        editPatternEvents.newDates.forEach(function (editDate) {
            events.push({
                    eventId: editTime.eventId,
                    patternId: editPatternEvents.patternId,
                    date: editDate,
                    reason: '',
                    time: editTime.time
                }
            )
        })
    });
    if (events.length > 0) {
        putEvent(events);
    }
    else {
        alert('Событий не запланировано! \r Возможно нет задания времени события. ')
    }
}

function getDateEvents(date, patternID) {
    var dateEvents = [];
    var patternsEvents = userPatterns[patternID].scheduledEvents;
    patternsEvents.forEach(function (event, i, data) {
        if (moment(event.date).isSame(date, 'day')) {
            dateEvents.push(event);
        }
    });
    editPatternEvents.editTimes = dateEvents;
    //  console.log(dateEvents)
    return dateEvents
}

function addScheduledTime(ScheduledEvents) {
    Object.values(ScheduledEvents).forEach(function (event, i, data) {
        appendTimeToSchedule(event);
    });
    addHandlerRemoveScheduledEvent('.removeEvent');
}

function EventSchedulerShow(editDate) {
    $('#select-repeat').val(1);
    $('#eventScheduler .tab-content').hide();
    document.getElementById('eventStartTimes').innerHTML = '';
    $('#editEvents-modal-form').modal();
    if ((!!editDate) && (getDates(editDate.startDate, editDate.endDate).length === 1)) {
        addScheduledTime(getDateEvents(editDate.startDate, editDate.patternId));
    }
    editPatternEvents.selectedDates = [];
    $('#dateSelectorCalendar').fullCalendar('removeEvents');
}


$(document).ready(function () {
    editPatternEvents.selectedDates = [];
    var calendarScheduler = $('#dateSelectorCalendar');
    calendarScheduler.fullCalendar({
        header: {right: 'today, prev,next'},
        defaultView: 'month',
        locale: 'ru',
        selectable: true,
        select: function (startDate, endDate) {
            getDates(startDate, endDate).forEach(function (date) {
                var index = editPatternEvents.selectedDates.indexOf(date);
                if (index === -1) {
                    editPatternEvents.selectedDates.push(date);
                }
                else {
                    editPatternEvents.selectedDates.splice(index, 1);
                }
            });
            calendarScheduler.fullCalendar('removeEvents');
            calendarScheduler.fullCalendar('renderEvents', backgroundDates(editPatternEvents.selectedDates));
        },
        viewRender: function () {
            calendarScheduler.fullCalendar('renderEvents', backgroundDates(editPatternEvents.selectedDates));
        }
    });
});


function getDates(startDate, endDate, weekDays) {
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(endDate);
    while (currentDate < stopDate) {
        if (!!weekDays) {
            if (weekDays.indexOf(moment(currentDate).days()) !== -1)
                dateArray.push(currentDate.format());
        }
        else {
            dateArray.push(currentDate.format());
        }
        currentDate = moment(currentDate).add(1, 'days');
    }
    return (dateArray);
}

function backgroundDates(dates) {
    return dates.map(function (date) {
        return {
            start: date,
            rendering: 'background',
            overlap: false,
            color: '#0109ff'
        };
    });
}



