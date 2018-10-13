
    let object = {email: 'andrey@gmail.com', password: "z001"};


        $.ajax({
            type: "POST",
            url: '/login',
            dataType: 'json',
            data: JSON.stringify(object),
            contentType: 'application/json',
            success: function (data) {
                console.log(data);
                getEvents();
            }
        });