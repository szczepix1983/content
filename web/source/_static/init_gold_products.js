$(document).ready(function() {
    $('#my-table').DataTable( {
        "ajax": 'https://raw.githubusercontent.com/szczepix1983/content/main/web/source/_static/gold_products.json?_=' + Date.now(),
        "columns": [
            { data: "image", render: function(data, type) { return '<img loading="lazy" width="120" height="80" src="' + data + '">'; } },
            { data: "name" },
            { data: "tags" },
            { data: "price" },
            { data: "url", render: function(data, type) { return '<a href="' + data + '" target="_blank">Pokaż produkt</a>'; } },
        ],
        "language": {
            "lengthMenu": "Wyświetl _MENU_ rekordów na stronie",
            "zeroRecords": "Nic nie znaleziono",
            "info": "Strona _PAGE_ z _PAGES_",
            "infoEmpty": "Brak dostępnych danych",
            "infoFiltered": "(Wynik z _MAX_ rekordów)",
            "sSearch": "Wyszukaj",
            "paginate": {
                "previous": "Wstecz",
                "next": "Dalej"
            }
        }
    } );
} );