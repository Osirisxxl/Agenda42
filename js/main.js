(function () {
      "use strict";


    $(document).ready(function(){
        /*//Init fastclick
        $(function() {
            FastClick.attach(document.body);
        });*/
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
        var $myCalendarButtons = $( "#calendar" ).find( "a" );
        $myCalendarButtons.on("tap", function(){
            //clears events display
            $( "#dayResults").empty();
            //Navigation
            $.mobile.changePage( "#day", { transition: "slide" });
            //Sets selected date
            document.agenda42.selections.date.setDate( $(this).text() );
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
                        var $newEventCollapsible = $( "<div data-role='collapsible' id='event" + i + "'>" +
                            "<h3>"+results[i].name + "</h3>" +
                            "<p>" + results[i].description + "</p>" +
                            "</div> " );
                        $newEventCollapsible.bind('expand',function(){

                            document.agenda42.selections.selectedEvent = document.agenda42.selections.results[parseInt(this.id.substring(5))];
                        });

                        $results.append( $newEventCollapsible );
                    }
                    $results.collapsibleset( "refresh" );
                    document.agenda42.selections.results = results;
                },

                // code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function( xhr, status ) {
                    alert( "Server appears to be unreachable.\n Check your connection" );
                },

                // code to run regardless of success or failure
                complete: function( xhr, status ) {
                }
            });
        });

        //Fill edit event page
        $( "#eventEdit").on("pagebeforeshow",function(){
            var selectedEvent = document.agenda42.selections.selectedEvent;

            if(selectedEvent === undefined) {
                $( "#eventEditHeader").html( "New event" );
                //Reset the values to default
                $("#eventName").val("");
                $("#eventBeginDate").val((new Date()).toJSON().slice(0,10));
                var $eventDuration = $("#eventDuration");
                $eventDuration.val(60);
                try{$eventDuration.slider("refresh")}catch(e){}
                $("#eventBeginTime").val((new Date()).toLocaleTimeString());
                var $eventAlarm = $("#eventAlarm");
                try{$eventAlarm.val('off');}catch (e){}
                $( "#eventDescription").val("");
                $( "#eventPlace").val("");
            }
            else{
                // Display correct header
                $( "#eventEditHeader").html( "Edit event" );

                //Display event info
                $( "#eventName").val(selectedEvent.name);
                var date = new Date(selectedEvent.beginDate);
                $( "#eventBeginDate").val(date.toJSON().slice(0,10));

                var $eventDuration = $("#eventDuration");
                $eventDuration.val(selectedEvent.duration);
                try{
                    $eventDuration.slider("refresh");
                }catch (e){}

                $( "#eventBeginTime").val(date.toLocaleTimeString());

                var $eventAlarm = $("#eventAlarm");
                if(selectedEvent.alert){
                    $eventAlarm.val('on');
                }else{
                    $eventAlarm.val('off');
                }
                try{$eventAlarm.slider("refresh")}catch (e){}
                $( "#eventDescription").val(selectedEvent.description);
                $( "#eventPlace").val(selectedEvent.place);
            }
        });
        //Init new event action click
        $( "#newEventAction" ).on("tap", function(){
            //Removing previous event selection
            document.agenda42.selections.selectedEvent = undefined;
            //collapse events
            $("#dayResults").find('div[data-role="collapsible"]')
            .each(function(){$(this).trigger("collapse");});

        });

        //Init the saveEvent click
        $( "#saveEvent").on("tap", function(){
            $.mobile.loading( "show" );
            //Build data to send
            var data = document.agenda42.selections.selectedEvent || {};
            data.name = $( "#eventName" ).val();
            data.duration = $( "#eventDuration" ).val();
            data.alert = $( "#eventAlarm" ).val()==="on";
            data.place = $( "#eventPlace" ).val();
            data.description = $( "#eventDescription" ).val();
            data.ownerID = document.agenda42.webService.ownerID;
            var date = new Date(
                $( "#eventBeginDate" ).val() + " "
                + $( "#eventBeginTime" ).val()
            );
            data.beginDate = date.getFullYear()+"-"+(date.getMonth()+1) +"-"+date.getDate()+"-"
                + date.getHours()+"-"+date.getMinutes();
            alert(JSON.stringify(data));
            alert(JSON.stringify(data.beginDate));
            $.ajax({
                // the URL for the request
                url: document.agenda42.webService.baseURI + ((document.agenda42.selections.selectedEvent ===undefined)? "createEvent":"modifyEvent"),

                // whether this is a POST or GET request
                type: (document.agenda42.selections.selectedEvent ===undefined)? "POST":"PUT",
                data: JSON.stringify(data),

                //Enable CORS
                crossDomain : true,

                // the type of data we expect back
                dataType : "json",
                contentType: "application/json",

                // code to run if the request succeeds;
                // the response is passed to the function
                success: function( results ) {

                },

                // code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function( xhr, status ) {
                    alert( "The server appears to be unreachable.\n Check your connection");

                },
                // code to run regardless of success or failure
                complete: function() {
                    $.mobile.loading( "hide" );
                    $.mobile.changePage( "#month", { transition: "slidedown" });
                }
            });
        });

    });

 })();