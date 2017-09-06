$(document).ready(function() {
    renderOptions(events_data);
    renderTable(events_data[0]);

    $( "#room" )
        .change(function () {

            $( "select option:selected" ).each(function() {
                str = $( this ).text();
            });
            for (var i in events_data){
                if (events_data[i].name == str){
                    renderTable(events_data[i]);
                }
            }
        })
        .change();

});


function renderOptions(data){
    newOptions = '';
    for (var i in data) {
        newOptions += "<option value='"+data[i].name+"'>" + data[i].name + "</option>"
    }
    $("#room").html(newOptions);


}

function renderTable(event){
    var newRows = '';
    for (var i in event.schedules) {
        newRows += "<tr>"
        newRows += "<td>" + event.schedules[i].summary + "</td>"
        newRows += "<td class='info'>" + event.schedules[i].owner + "</td>"
        newRows += "<td class='success'>" + event.schedules[i].start_time + "</td>"
        newRows += "<td class='warning'>" + event.schedules[i].end_time + "</td>"
        newRows += "</tr>"

    }
    $("#table_events tbody").html(newRows);

}
