$(document).ready(function () {
	$("#menu").on("click", function () {
		$("#menu").css("opacity", "0");
		$("#lgMenu").addClass("enter");
	});
	$("#exit").on("click", function () {
		$("#lgMenu").removeClass("enter");
		$("#menu").css("opacity", "1");
	});
});
