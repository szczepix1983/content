console.log("init_table");
$(document).ready(function() {
    console.log("loaded_table");
    $('#my-table').DataTable( {
        "ajax": 'https://raw.githubusercontent.com/szczepix1983/content/main/web/content.json?_=' + Date.now(),
        "columns": [
            { "content" : "" }
        ]
    } );
} );