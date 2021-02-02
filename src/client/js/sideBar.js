$(document).ready(function () {
    //Open Sidebar
    $("#menu").on("click", function () {
        $("#menu").css("opacity", "0");
        $("#lgMenu").addClass("enter");
    });


    //Close Side bar
    $("#exit").on("click", function () {
        $("#lgMenu").removeClass("enter");
        $("#menu").css("opacity", "1");
    });

    $("OBSFeed").on("click", function(){
        $("#changeFeed").removeClass("Enter");
        $("#menu").css("opacity", "1");
    })

});
