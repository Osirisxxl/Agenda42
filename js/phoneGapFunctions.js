/**
 * Created with JetBrains WebStorm.
 * User: jepicard
 * Date: 21/05/13
 * Time: 10:45
 * This script enables specific device actions through phoneGap
 */


(function () {
    "use strict";
    //Init contactWidget
    $(document).ready(function(){
        var $eventInvitedPeople = $( "#eventInvitedPeople" );
        var $contactsListView = $( "#contactsListView" );
        $( "#buttonEventInvitedPeople").on( "tap", function(){
            $eventInvitedPeople.css("display", "block");
            $contactsListView.css("display", "none");
        });
        $( "#buttonContactsListView").on( "tap", function(){
            $eventInvitedPeople.css("display", "none");
            $contactsListView.css("display", "block");
        });

        function onSuccess(contacts) {
            $.each(contacts,function(){
                var contact = $( "<li><a>" + this.displayName + "</a></li>" );
                $( "#contactsListView" ).append(contact);
            });
        };

        function onError(contactError) {
            alert('Could not retrieve contacts. Error: ' + contactError);
        };
        // find all contacts with any name field
        var options = new ContactFindOptions();
        options.multiple = true;
        var fields = ["displayName", "name"];
        navigator.contacts.find(fields, onSuccess, onError, options);
    });



    function displayMap(lat, lng, $eventPlace) {
        var map;
        var directionsDisplay = new google.maps.DirectionsRenderer();
        var directionsService = new google.maps.DirectionsService();

        var origin = new google.maps.LatLng(lat,lng);
        var destination = $eventPlace;


        var mapOptions = {
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: origin
        };
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

        // Bind the renderer to the map and the panel to display directions
        directionsDisplay.setMap(map);
        //$("#directionsPanel").empty();

        directionsDisplay.setPanel(document.getElementById("directionsPanel"));

        var request = {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
            else{
                $("#map-canvas").html("an error occurred: " + status);
            }
        });
    }

    $( "#eventEdit" ).on( "pagebeforeshow", function() {
        //Clear invitedListView and Display invited people for the selectedEvent
        var $eventInvitedPeople = $( "#eventInvitedPeople").empty();
        var invited = agenda42.selections.selectedEvent.invited;
        $.each(invited,function(){
            var contact = $( "<li><a>" + this.firstName + " " + this.lastName + "</a></li>" );
            $eventInvitedPeople.append(contact);
        });
        $eventInvitedPeople.listview("refresh");

    });


    $( "#eventEdit" ).on( "pageinit", function() {
        //Init the click handler on event image
        $( "#eventImage" ).on( "tap" ,function(){
            $( "#eventImagePanel" ).panel( "open" );
        });

        //Init the click handler on selectPictureButton
        $( "#selectPictureButton" ).on( "tap", function(){
            //browse image directory
            //NOT SUPPORTED
        });
        //Init the click handler on TakeNewPictureButton
        $( "#TakeNewPictureButton" ).on( "tap", function(){
            //open photo Task
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
                destinationType: Camera.DestinationType.FILE_URI });
        });
        function onSuccess(imageURI) {
            $( "#eventImage" ).attr("src", imageURI);
        }
        function onFail(message) {
            alert( 'Failed because: ' + message);
        }

        //Setting up the navigationPage with directions
        $( "#directionsMap" ).on( "pagebeforeshow", function(){
            //Get geolocation info
            var lat;
            var lng;
            //success callback
            var onSuccess = function(position) {
                lat = position.coords.latitude;
                lng = position.coords.longitude;
                displayMap(lat, lng, $( "#eventPlace").val());
            };
            // onError Callback receives a PositionError object
            function onError(error) {
                alert('code: '    + error.code    + '\n' +
                    'message: ' + error.message + '\n');
            }
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        });
    });

})();