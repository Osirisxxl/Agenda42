/**
 * Created with JetBrains WebStorm.
 * User: jepicard
 * Date: 21/05/13
 * Time: 10:45
 * This script enables specific device actions through phoneGap
 */


(function () {
    "use strict";

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
        directionsDisplay.setPanel(document.getElementById("directionsPanel"));

        var request = {
            origin: new google.maps.LatLng(lat,lng),
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

    $( "#eventEdit" ).on( "pageinit", function() {

        //Init the click handler on event image
        $( "#eventImage" ).on( "tap" ,function(){
            $( "#eventImagePanel" ).panel( "open" );
        });

        //Init the click handler on selectPictureButton
        $( "#selectPictureButton" ).on( "tap", function(){
            //browse image directory
        });
        //Init the click handler on TakeNewPictureButton
        $( "#TakeNewPictureButton").on( "tap", function(){
            //open photo Task
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
                destinationType: Camera.DestinationType.FILE_URI });

            function onSuccess(imageURI) {
                $("#eventImage").attr("src", imageURI);
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }
        });

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