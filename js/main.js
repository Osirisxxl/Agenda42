(function () {
      "use strict";

    $(document).ready(function(){
        //Init selected values;
        document.agenda42 = {};
        document.agenda42.selections = {
            date : new Date()
        };
        document.agenda42.webService = {
            baseURI : "http://10.33.33.4:8080/agenda/resources/agenda/",
            ownerID : "testJeremie"
        };


        //Init Calendar buttons
        var $myCalendarButtons = $( "#calendar" ).find( "button" );
        $myCalendarButtons.on("click", function(){
            //$( "#dayResults").empty();
            $.mobile.changePage( "#day", { transition: "slide" });
            /*document.agenda42.selections.date.setDate( $(this).html() );
            $( "#day" ).find( "div:first" ).find( "h1" ).html( document.agenda42.selections.date.toLocaleDateString());

            $.support.cors = true;
            var date = document.agenda42.selections.date;
            $.ajax({
                // the URL for the request
                url: document.agenda42.webService.baseURI + "events/" +
                    document.agenda42.webService.ownerID + "/" +date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),

                // whether this is a POST or GET request
                type: "GET",

                //Enable CORS
                crossDomain : true,

                // the type of data we expect back
                dataType : "json",
                contentType: "application/json",

                // code to run if the request succeeds;
                // the response is passed to the function
                success: function( results ) {
                    var $results = $( "#dayResults" );

                    for (var i = 0; i < results.length; i++ ) {
                        $results.append( "<div data-role='collapsible'>" +
                                            "<h3>"+results[i].name + "</h3>" +
                                            "<p>" + results[i].description + "</p>" +
                                        "</div> ");
                    }
                    $results.collapsibleset( "refresh" );
                },

                // code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function( xhr, status ) {
                    alert( "Sorry, there was a problem!" );
                },

                // code to run regardless of success or failure
                complete: function( xhr, status ) {
                }
            });             */
        });



    });

 })();