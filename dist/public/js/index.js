
$( document ).ready( function() {
    let el = document.createElement('p');
    el.textContent = "hi man";
    document.querySelector('body').appendChild(el);
  /*  
    let array = []
    let object = {};
    object.date = "2017-12-12";
    object.time = "17:00";
    object.patternId = 3;
    array.push(object);
    */

    $.ajax({
        url: "/event/1",
        type: "DELETE",
        success: function(data) {
            console.log("success");
        }
    })
} )




