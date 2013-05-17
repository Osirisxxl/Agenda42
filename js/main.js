(function () {
      "use strict";
    //Creating a global object for utilities and user selections
    window.agenda42 = {};
    agenda42.utils= { month : [{name:"Jan", dayNumber : 31},
        {name:"Feb", dayNumber : 28}, {name:"Mar", dayNumber : 31},
        {name:"Apr", dayNumber : 30}, {name:"May", dayNumber : 31},
        {name:"Jun", dayNumber : 30}, {name:"Jul", dayNumber : 31},
        {name:"Aug", dayNumber : 31}, {name:"Sep", dayNumber : 30},
        {name:"Oct", dayNumber : 31}, {name:"Nov", dayNumber : 30},
        {name:"Dec", dayNumber : 31}],
        hideExtraDayButtons : function() {
            var buttons = $( "#calendar").find("a");
            for(var i = 0; i <= 30  ; i++){
                if(i < agenda42.utils.month[agenda42.selections.date.getMonth()].dayNumber){
                    buttons.eq(i).css("display", "block");
                } else {
                    buttons.eq(i).css("display", "none");
                }
            }

        }
    };
    agenda42.webService = {
        baseURI : "http://10.33.33.4:8080/agenda/resources/agenda/",
        ownerID : "testJeremie"
    };

    //DOM is ready
    $(document).ready(function(){
        //Init selected values and month view
        agenda42.selections = {
            date : new Date()
        };
        //Display correct numbers of buttons and month name
        $( "#monthDisplay").text(agenda42.utils.month[agenda42.selections.date.getMonth()].name
            + " " +agenda42.selections.date.getFullYear());
        agenda42.utils.hideExtraDayButtons();




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
            // If no event has been selected in the first place => new event
            if(selectedEvent === undefined) {
                $( "#eventEditHeader").html( "New event" );
                //Reset the values to default
                $("#eventName").val("");
                var date = new Date();
                $("#eventBeginDate").val(date.toJSON().slice(0,10));
                var $eventDuration = $("#eventDuration");
                $eventDuration.val(60);
                try{$eventDuration.slider("refresh")}catch(e){}
                $("#eventBeginTime").val(date.getHours()+date.getTimezoneOffset()/60 + ":" + date.getMinutes());
                var $eventAlarm = $("#eventAlarm");
                try{$eventAlarm.val('off');}catch (e){}
                $( "#eventDescription").val("");
                $( "#eventPlace").val("");
            }
            else{
                // Set the event data we're editing
                // Display correct header
                $( "#eventEditHeader").html( "Edit event" );
                //Parsing date(to ensure support across all browsers
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

        // Init next month button
        $( "#nextMonth").on("tap", function(){
            var date = agenda42.selections.date;
            date.setMonth(date.getMonth() + 1);
            $( "#monthDisplay").text(agenda42.utils.month[date.getMonth()].name + " " +date.getFullYear());
            //determines number of buttons and wether to show or hide buttons
            agenda42.utils.hideExtraDayButtons();
        });
        // Init prev month button
        $( "#prevMonth").on("tap", function(){
            var date = agenda42.selections.date;
            date.setMonth(date.getMonth() - 1);
            $( "#monthDisplay").text(agenda42.utils.month[date.getMonth()].name + " " +date.getFullYear());
            //determines number of buttons and wether to show or hide buttons
            agenda42.utils.hideExtraDayButtons();
        });
    });

 })();