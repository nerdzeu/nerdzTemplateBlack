$(document).ready(function() {
    var tz = jstz.determine();
    var select = $("#reg-timezone"), opt = select.find("option[value='" + tz.name() + "']");
    if (opt.length) {
        select.val(tz.name());
    }
});
