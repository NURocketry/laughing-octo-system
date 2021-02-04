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

    $("#obs_feed").on("click", function () {
        let flag = $("#obs_feed").html() === "Overlay mode";

        if (flag === true) {
            $("#obs_feed").html("Normal mode");
            $(".box.shadow.mt-4").css('cursor', 'default');
            $(".box.shadow.mt-4").draggable({ disabled : true});
        } else {
            $("#obs_feed").html("Overlay mode");
            $(".box.shadow.mt-4").css('cursor', 'move');
            $(".box.shadow.mt-4").draggable({ disabled : false});
        }

    });

});
