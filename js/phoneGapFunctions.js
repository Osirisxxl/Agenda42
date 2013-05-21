/**
 * Created with JetBrains WebStorm.
 * User: jepicard
 * Date: 21/05/13
 * Time: 10:45
 * This script enables specific device actions through phoneGap
 */


(function () {
    "use strict";
    $( "#eventEdit" ).on( "pageinit", function() {

        //Init the click handler on event image
        $( "#eventImage").on( "tap" ,function(){
            $( "#eventImagePanel" ).panel( "open" );
        });

        //Init the click handler on selectPictureButton
        $( "#selectPictureButton").on( "tap", function(){
            navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
                destinationType: Camera.DestinationType.FILE_URI });

            function onSuccess(imageURI) {
                alert(imageURI);
                $("#eventImage").attr("src", imageURI);
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }
        });
        //Init the click handler on TakeNewPictureButton
        $( "#TakeNewPictureButton").on( "tap", function(){
            //open photo Task
        });
    });
})();