(function () {
      "use strict";
    window.agenda42 = {};

    $(document).ready(function(){
        /*//Init fastclick
        $(function() {
            FastClick.attach(document.body);
        });*/
        //Init selected values;
        agenda42.selections = {
            date : new Date()
        };
        agenda42.webService = {
            baseURI : "http://10.33.33.4:8080/agenda/resources/agenda/",
            ownerID : "testJeremie"
        };


        //Init Calendar buttons
        var $myCalendarButtons = $( "#calendar" ).find( "a" );
        $myCalendarButtons.on("tap", function(){
            //Navigation
            $.mobile.changePage( "#day", { transition: "slide" });
            //Sets selected date
            agenda42.selections.date.setDate( $(this).text() );

        });

        //Fill day page
        $( "#day").on("pagebeforeshow",function(){

            //clears events display and selection
            $( "#dayResults").empty();
            agenda42.selections.selectedEvent = undefined;
            //Display correct date
            $( "#day" ).find( "div:first" ).find( "h1" ).html( agenda42.selections.date.toLocaleDateString());

            var date = agenda42.selections.date;
            $.mobile.loading( "show" );
            $.ajax({
                // the URL for the request
                url: agenda42.webService.baseURI + "events/" +
                    agenda42.webService.ownerID + "/" +date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate(),

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

                            agenda42.selections.selectedEvent = agenda42.selections.results[parseInt(this.id.substring(5))];
                        });

                        $results.append( $newEventCollapsible );
                    }
                    $results.collapsibleset( "refresh" );
                    agenda42.selections.results = results;
                },

                // code to run if the request fails; the raw request and
                // status codes are passed to the function
                error: function( xhr, status ) {
                    alert( "Server appears to be unreachable.\n Check your connection" );
                },

                // code to run regardless of success or failure
                complete: function( xhr, status ) {
                    $.mobile.loading( "hide" );
                }
            });
        });


        //Fill edit event page
        $( "#eventEdit").on("pagebeforeshow",function(){
            var selectedEvent = agenda42.selections.selectedEvent;

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
                var s = agenda42.selections.selectedEvent.beginDate;
                var a = s.split(/[^0-9]/);
                var date = new Date (a[0],a[1]-1,a[2],a[3],a[4],a[5]) || new Date();

                //Display event info
                $( "#eventName").val(selectedEvent.name);
                $( "#eventBeginDate").val(date.toJSON().slice(0,10));

                var $eventDuration = $("#eventDuration");
                $eventDuration.val(selectedEvent.duration);
                try{
                    $eventDuration.slider("refresh");
                }catch (e){}

                $( "#eventBeginTime").val(date.getHours()+date.getTimezoneOffset()/60 + ":" + date.getMinutes());

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
            agenda42.selections.selectedEvent = undefined;
            //collapse events
            $("#dayResults").find('div[data-role="collapsible"]')
            .each(function(){$(this).trigger("collapse");});

        });

        //Init the saveEvent click
        $( "#saveEvent").on("tap", function(){
            $.mobile.loading( "show" );
            //Build data to send
            var data = agenda42.selections.selectedEvent || {};
            data.name = $( "#eventName" ).val();
            data.duration = $( "#eventDuration" ).val();
            data.alert = $( "#eventAlarm" ).val()==="on";
            data.place = $( "#eventPlace" ).val();
            data.description = $( "#eventDescription" ).val();
            data.ownerID = agenda42.webService.ownerID;
            var date = new Date(
                $( "#eventBeginDate" ).val() + "T"
                + $( "#eventBeginTime" ).val()
            );
            data.beginDate = date.getFullYear()+"-"+(date.getMonth()+1) +"-"+date.getDate()+"-"
                + date.getHours()+"-"+date.getMinutes();
            $.ajax({
                // the URL for the request
                url: agenda42.webService.baseURI + ((agenda42.selections.selectedEvent ===undefined)? "createEvent":"modifyEvent"),

                // whether this is a POST or GET request
                type: (agenda42.selections.selectedEvent ===undefined)? "POST":"PUT",
                data: JSON.stringify(data),

                //Enable CORS
                //crossDomain : true,

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
                    $.mobile.changePage( "#day", { transition: "slidedown" });
                }
            });
        });

        //Init the saveEvent click
        $( "#deleteEventAction").on("tap", function(){
            if(agenda42.selections.selectedEvent === undefined){
                // display info to user that he needs to select an event first
                alert("Please pick an event first");
            }
            else {
                $.mobile.loading( "show" );
                $.ajax({
                    // the URL for the request
                    url: agenda42.webService.baseURI + "deleteEvent",

                    //Type of request
                    type: "DELETE",
                    data: JSON.stringify(agenda42.selections.selectedEvent),

                    //Enable CORS
                    crossDomain : true,

                    // the type of data we expect back
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
                        $.mobile.changePage( "#day", { transition: "slidedown" });
                    }
                });
            }
        });
    });

 })();