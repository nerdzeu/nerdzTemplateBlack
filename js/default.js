$(document).ready(function() {
    var loading = N.getLangData().LOADING;

    $("iframe").attr('scrolling','no');
    $("body").append($('<br />'));

    // append version information
    if ($("#left_col").length && window.location.pathname == "/home.php" && typeof Nversion !== 'undefined' && Nversion != 'null')
        // according to stackoverflow, using 'target' in HTML5 is alright so let's do it
        $("#left_col .title").eq (0).append (
                " <span class='small' style='font-weight: normal; vertical-align: middle'><a href='https://github.com/nerdzeu/nerdz.eu/commit/" +
                Nversion + 
                "' target='wowsoversion' style='color: #000 !important'>[" +
                Nversion + 
                "]</a></span>").find ('a').css ('vertical-align', 'middle');

    // load the prettyprinter
    var append_theme = "", _h = $("head");
    if (localStorage.getItem ("has-dark-theme") == 'yep')
        append_theme = "?skin=sons-of-obsidian";

    var prettify = document.createElement ("script");
    prettify.type = "text/javascript";
    prettify.src  = 'https://cdnjs.cloudflare.com/ajax/libs/prettify/r298/run_prettify.js' + append_theme;
    _h.append (prettify);
    if (append_theme !== '')
        _h.append ('<style type="text/css">.nerdz-code-wrapper { background-color: #000; color: #FFF; }</style>');
    else
        _h.append ('<style type="text/css">.nerdz-code-wrapper { background-color: #FFF; color: #000; }</style>');

    $("#notifycounter").on('click',function(e) {
        e.preventDefault();
        var list = $("#notify_list"), old = $(this).html();
        var nold = parseInt(old);
        if(list.length) {
            if(isNaN(nold) || nold === 0)
            {
                list.remove();
            }
            else if(nold > 0) {
                list.prepend('<div id="pr_lo">'+loading+'</div>');
                N.html.getNotifications(function(d) {
                    $("#pr_lo").remove();
                    list.prepend(d);
                });
            }
        }
        else {
            var l = $(document.createElement("div"));
            l.attr('id',"notify_list");
            l.html(loading);
            $("body").append(l);
            N.html.getNotifications(function(d) {
                l.html(d);
            });

            $("#notify_list").on('click','.notref',function(e) {
                if (e.ctrlKey) return;
                e.preventDefault();
                var href = $(this).attr('href');
                if(href == window.location.pathname + window.location.hash) {
                    location.reload();
                }
                else {
                    location.href = href;
                }
            });

        }
        $(this).html(isNaN(nold) ? old : '0');
    });

    /* il footersearch si mostra solo in alcune pagine */
    var wrongPages = [ '/bbcode.php','/terms.php','/faq.php','/stats.php','/rank.php','/preferences.php', '/informations.php', '/preview.php' ];
    if($.inArray(location.pathname,wrongPages) != -1) {
        $("#footersearch").hide();
    }

    $("#footersearch").on('submit',function(e) {
        e.preventDefault();
        var plist = $("#postlist");
        var qs =  $.trim($("#footersearch input[name=q]").val());
        var num = 10; //TODO: numero di posts, parametro?

        if(qs === '') {
            return false;
        }

        var manageResponse = function(d)
        {
            plist.html(d);
            //variabile booleana messa come stringa data che nel dom posso salvare solo stringhe
            sessionStorage.setItem('searchLoad', "1"); //e' la variabile load di search, dato che queste azioni sono in questo file js ma sono condivise da tutte le pagine, la variabile di caricamento dev'essere nota a tutte
            window.fixHeights(); 
        };

        if(plist.data('type') == 'project')
        {
            if(plist.data('location') == 'home')
            {
                N.html.search.globalProjectPosts(num, qs, manageResponse);
            }
            else
            {
                if(plist.data('location') == 'project')
                {
                    N.html.search.specificProjectPosts(num, qs, plist.data('projectid'),manageResponse);
                }
            }
        }
        else if(plist.data('type') == 'profile')
        {
            if(plist.data('location') == 'home')
            {
                N.html.search.globalProfilePosts(num, qs, manageResponse);
            }
            else
            {
                if(plist.data('location') == 'profile')
                {
                    N.html.search.specificProfilePosts(num, qs, plist.data('profileid'),manageResponse);
                }
            }
        } else if(plist.data('type') == 'search') {
            window.location.href='search.php?q=' + encodeURIComponent(qs);
        }

        plist.data('mode','search');
    });

    $("#logout").on('click',function(event) {
        event.preventDefault();
        var t = $("#title_right");
        N.json.logout( { tok: $(this).data('tok') }, function(r) {
            var tmp = t.html();
            if(r.status == 'ok')
            {
                t.html(r.message);
                setTimeout(function() {
                    document.location.href = "/";
                },1500);
            }
            else
            {
                t.html('<h2>'+ r.message + '</h2>');
                setTimeout(function() {
                    t.html(tmp);
                },1500);
            }
        });
    });

    $("#gotopm").on('click',function(e) {
        e.preventDefault();

        var href = $(this).attr('href');

        if($('#pmcounter').html() != '0') {

            if(href == window.location.pathname ) {
                location.hash = "new";
                location.reload();
            }
            else {
                location.href='/pm.php#new';
            }
        }
        else
        {
            location.href = href;
        }
    });

    //Questo evento deve essere qui e non in index.js (che ora viene eliminato), dato che un utente può registrarsi anche dal
    //form di registrazione, che appare quando un profilo/progetto è chiuso 
    $("#regfrm").on('submit',function(event) {
        event.preventDefault();
        N.json.register($("#regfrm").serialize(),function(obj) {

            if(obj.status == 'error')
            {
                $("#error").html(obj.message.replace(/\n/g,"<br />"));
                $("#cptxt").html('');
                N.reloadCaptcha();
            }
            else if(obj.status == 'ok')
            {
                $("#error").hide();
                $("#done").html(obj.message);
                setTimeout(function() {
                    window.location.reload();
                }, 1500);
            }
        });
    });

    $(".preview").on('click',function(){
        var txt = $($(this).data('refto')).val();
        if(undefined !== txt && txt !== '') {
            window.open('/preview.php?message='+encodeURIComponent(txt+' ')); //The whitespace is a workaround used to make the preview works also when there is a dot at the end of the message
        }
    });

    $("textarea").on('keydown', function(e) {
        if( e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13) ) {
            $(this).parent().trigger('submit');
        }
    });

    var handleFolUn = function(me, d, oldValue) {
        me.html(d.message);
        if(d.status == 'ok') {
            me.off('click');
        } else {
            setTimeout(function() {
                me.html(oldValue);
            },1500);
        }
    };

    $("#follow, .follow").click(function() {
        var me = $(this), oldValue = me.html();
        me.html('...');
        var type = me.hasClass('project') ? 'project' : 'profile';
        N.json[type].follow({id: $(this).data('id')},function(d) {
            handleFolUn(me, d, oldValue);
        });
    });

    $("#unfollow, .unfollow").click(function() {
        var me = $(this), oldValue = me.html();
        me.html('...');
        var type = me.hasClass('project') ? 'project' : 'profile';
        N.json[type].unfollow({id: $(this).data('id')},function(d) {
            handleFolUn(me, d, oldValue);
        });
    });

    $("ul.topnav li a.rightarrow").on('click', function(e) {
        e.preventDefault();
        $(this).parent().find("ul.subnav").toggle('fast');
    });

    //begin plist into events (common to: homepage, projects, profiles)
    var plist = $("#postlist");

    window.fixHeights = function() {
        plist.find(".nerdz_message, .news").each (function() {
            var el = $(this).find('div:first');
            if ((el.height() >= 200 || el.find ('.gistLoad').length > 0) && !el.data('parsed'))
            {
                el.data ('real-height', el.height()).addClass ("compressed");
                var n = el.next();
                n.prepend ('<a class="more">&gt;&gt; ' + N.getLangData().EXPAND + ' &lt;&lt;</a>'); // Spaces master race.
            }
            el.attr('data-parsed','1');
        });
    };

    plist.on('click','.more',function() {
        var me = $(this), par = me.parent(), jenk = par.prev();
        if (me.data ('busy') == 'godyes') return;
        me.data ('busy', 'godyes');
        // obtain the real height of the post and do some hardcore animations
        //jenk.removeClass ("compressed"); var realHeight = jenk.height();
        jenk.animate ({ maxHeight: jenk.data ('real-height') }, 500, function() {
            jenk.removeClass ("compressed").css ("max-height", "none");
            me.slideUp ('slow', function() {
                me.remove();
            });
        });
    });


    plist.on('click', "ul.topnav li a.downarrow", function(e) {
        e.preventDefault();
        $(this).parent().find("ul.subnav").toggle('fast');
    });

    plist.on('click', ".yt_frame", function(e) {
        e.preventDefault();
        N.yt($(this), $(this).data("vid"));
    });

    plist.on('click','.preview',function(){
        var txtarea = $($(this).data('refto'));
        txtarea.val(txtarea.val()+' '); //workaround
        var txt = txtarea.val();
        txtarea.val($.trim(txtarea.val()));
        if(undefined !== txt && $.trim(txt) !== '') {
            window.open('/preview.php?message='+encodeURIComponent(txt));
        }
    });

    plist.on('keydown',"textarea", function(e) {
        if( e.ctrlKey && (e.keyCode == 10 || e.keyCode == 13) ) {
            $(this).parent().trigger('submit');
        }
    });

    plist.on('click',".delcomment",function() {
        var refto = $('#' + $(this).data('refto'));
        refto.html(loading+'...');

        N.json[plist.data('type')].delComment({ hcid: $(this).data('hcid') },function(d) {
            if(d.status == 'ok')
            {
                refto.remove();
            }
            else
            {
                refto.html(d.message);
            }
        });
    });

    plist.on('submit','.frmcomment',function(e) {
        e.preventDefault();
        var last, hcid,
        hpid     = $(this).data ('hpid'),
            refto    = $('#commentlist' + hpid),
            error    = $(this).find ('.error').eq (0),
                pattern  = 'div[id^="c"]',
                comments = refto.find (pattern);
        if(comments.length)
        {
            // Uses the second-last element instead of the last one (if available)
            // to fix the append bug reported by nessuno.
            last = comments.length > 1 ? comments.eq (comments.length - 2) : null;
            hcid = last ? last.data('hcid') : 0;
        }
        error.html (loading);
        N.json[plist.data('type')].addComment ({ hpid: hpid, message: $(this).find('textarea').eq(0).val() }, function(d) {
            if(d.status == 'ok')
            {
                if(hcid && last)
                {
                    N.html[plist.data('type')].getCommentsAfterHcid ({ hpid: hpid, hcid: hcid }, function(d) {
                        var form = refto.find ('form.frmcomment').eq (0),
                        pushBefore = form.parent(),
                        newComments = $('<div>' + d + '</div>').find (pattern),
                            internalLengthPointer = comments.length,
                            lastComment = comments.last();
                        // if available, delete the secondlast comment
                        if (comments.length > 1) {
                            comments.eq (comments.length - 1).remove();
                            internalLengthPointer--;
                        }
                        // then, check the hcid of the last comment
                        // delete it if it matches
                        if (lastComment.data ('hcid') == newComments.last().data ('hcid')) {
                            lastComment.remove();
                            internalLengthPointer--;
                        }
                        // wait until we reach 10 comments (except if the user pressed more)
                        // TODO: replace this with comments.slice (0, n).remove()
                        // TODO: add logic to show again the 'more' button if we deleted
                        // enough comments
                        // Fix for issue #9: add a >point<
                        while ((internalLengthPointer + newComments.length) > (((comments.parent().find ('.more_btn').data ('morecount') || 0) + 1) * 10)) {
                            comments.first().remove();
                            // reassign the variable, otherwise .first() won't work
                            // anymore with .remove().
                            comments = refto.find (pattern);
                            internalLengthPointer--;
                        }
                        // append newComments
                        pushBefore.before (d);
                        form.find ('textarea').val ('');
                        error.html('');
                    });
                }
                else
                {
                    N.html[plist.data('type')].getComments( { hpid: hpid, start: 0, num: 10 },function(d) {
                        refto.html(d);
                        error.html('');
                    });
                }
            }
            else
            {
                error.html(d.message);
            }
        });
    });

    plist.on('click',".showcomments",function() {
        var refto = $('#' + $(this).data('refto'));
        if(refto.html() === '')
        {
            refto.html(loading+'...');
            N.html[plist.data ('type')].getComments ({
                hpid: $(this).data ('hpid'),
                start: 0,
                num: 10
            }, function (res) {
                refto.html (res);
                if (document.location.hash == '#last')
                    refto.find ('.frmcomment textarea[name=message]').focus();
                else if (document.location.hash)
                    if( $(document.location.hash).length ) 
                        $(document).scrollTop ($(document.location.hash).offset().top);
                    else
                        showAllComments($(".all_comments_btn")[0], function() {$(document).scrollTop ($(document.location.hash).offset().top);});
            });
        }
        else
        {
            refto.html('');
        }
    });

    plist.on('click', ".oldrev", function() {
        var me = $(this), refto = $(this).data('refto');
        var revno = parseInt( $(this).data('revisions') );
        var func = "getRevision";
        var obj = {hpid: $(this).data('hpid'), revNo: revno};
        var id = 'hpid';

        if(me.hasClass("comment")) {
            func = "getCommentRevision";
            obj = {hcid: $(this).data('hcid'), revNo: revno};
            id = 'hcid';
        }

        if(!$(this).data('original-rev')) {
            $(this).data('original-rev', revno);
        }

        if(revno > 0) {
            N.json[plist.data('type')][func](obj, function(r) {
                var tagTime = me.parent().parent(), timeVal = null;
                if(id === 'hcid') {
                    tagTime = tagTime.find('a[id^="ndc"]');
                    console.log(tagTime);
                } else {
                    console.log(me.parent().parent());
                    tagTime = tagTime.find('time');
                    console.log(tagTime);
                }
                timeVal = tagTime.html();

                tagTime.html(r.datetime);
                if(!me.parent().find(".newrev").length) {
                    var s = $(document.createElement("span"));
                    s.attr("class", "newrev" + (id === 'hcid' ? ' comment' : ''));
                    s.attr('data-refto', refto);
                    s.attr('data-'+id, me.data(id));
                    s.html("&#9654;&nbsp;");
                    me.parent().append(s);
                }

                var div = null, pidTag = null;
                if(id === 'hcid') {
                    div = $("#" + refto).find(".nerdz_comments");
                    pidTag = $(document.createElement("span"));
                    pidTag.append( div.find(".delcomment") );
                    pidTag.html(pidTag.html() + "#1");
                    pidTag.css('font-size','0');
                } else {
                    div = $("#" + refto).find(".nerdz_message div:first");
                    pidTag = $("#" + refto).find(".nerdz_message span:first");
                    if(!div.length) {
                        div = $("#" + refto).find(".news div:first");
                        pidTag = $("#" + refto).find(".news span:first");
                    }

                    pidTag.remove();
                }

                var storeName = plist.data('type') + "store" + func;

                var elms = {};                    
                if(!sessionStorage[storeName]) { //init store
                    elms[me.data(id)] = [];
                    elms[me.data(id)][revno] = {};
                    elms[me.data(id)][revno].message = div.html();
                    elms[me.data(id)][revno].time = timeVal;
                    sessionStorage[storeName] = JSON.stringify(elms);
                } else { // store exists
                    elms = JSON.parse(sessionStorage[storeName]);
                    if(!elms[me.data(id)]) {
                        elms[me.data(id)] = [];
                    }
                    if(!elms[me.data(id)][revno]) {
                        elms[me.data(id)][revno] = {};
                        elms[me.data(id)][revno].message = div.html();
                        elms[me.data(id)][revno].time = timeVal;
                        sessionStorage[storeName] = JSON.stringify(elms);
                    }
                }

                div.html(r.message);
                if(pidTag.html().search(/^#\d+$/) != -1) {
                    pidTag.html(pidTag.html() + " - rev: " + revno);
                } else {
                    pidTag.html(pidTag.html().replace(/(#.+?):\s*(\d+)/, function($0, $1, $2) {
                        return $1 +": " + revno;
                    }));
                }
                div.prepend(pidTag);

                var rev = revno - 1;
                me.data('revisions', rev);
                if(rev === 0) {
                    me.hide();
                }
            });
        }
    });

    plist.on('click', '.newrev', function() {
        var me = $(this), refto = $(this).data('refto');

        var func = "getRevision";
        var id = 'hpid';
        var tagTime =  me.parent().parent().find('time');

        if(me.hasClass("comment")) {
            func = "getCommentRevision";
            id = 'hcid';
            tagTime = me.parent().parent().children('a[id^="ndc"]');
        }
        var storeName = plist.data('type') + "store" + func;

        if(sessionStorage[storeName]) {
            var elms = JSON.parse(sessionStorage[storeName]);
            if(elms[me.data(id)]) {

                if(id === 'hcid') {
                    div = $("#" + refto).find(".nerdz_comments");
                    pidTag = $(document.createElement("span"));
                    pidTag.append( div.find(".delcomment") );
                    pidTag.html(pidTag.html() + "#1");
                } else {
                    div = $("#" + refto).find(".nerdz_message div:first");
                    if(!div.length) {
                        div = $("#" + refto).find(".news div:first");
                    }
                    pidTag = div.find("span:first");
                    pidTag.remove();
                }

                elms[me.data(id)] = elms[me.data(id)].filter(function(v) { return v !== null; });
                div.html(elms[me.data(id)][0].message);
                tagTime.html(elms[me.data(id)][0].time);
                elms[me.data(id)][0] = null;
                elms[me.data(id)] = elms[me.data(id)].filter(function(v) { return v !== null; });
                sessionStorage[storeName] = JSON.stringify(elms);
                //update counter
                var d = me.parent().find(".oldrev");
                var rev  = parseInt(d.data('revisions')) + 1;
                d.data('revisions', rev);

                pidTag.html(pidTag.html().replace(/(#.+?):\s*(\d+)/, function($0, $1, $2) {
                    return $1 +": " + (rev == 1 ? rev+1 : rev);
                }));

                if(id === 'hcid') {
                    pidTag.css('font-size', '0');
                }

                div.prepend(pidTag);
                if(rev >= parseInt(d.data('original-rev'))){
                    me.remove();
                    pidTag.html(pidTag.html().replace(/(#\d+).*:\s*(\d+)/, function($0, $1, $2) {
                        return $1;
                    }));
                }
                d.show();
            }
        }
    });

    plist.on('click', ".vote", function() {
        var curr = $(this),
        cont = curr.parent(),
        tnum = cont.parent().children(".thumbs-counter"),
            func = "thumbs",
            obj = { hpid: cont.data("refto") };

        if(cont.hasClass("comment"))  {
            obj = { hcid: cont.data("refto") };
            func = "cthumbs";
        }

        if(curr.hasClass("voted")) { 
            N.json[plist.data ('type')][func]($.extend(obj,{thumb: 0}), function(r) {
                if(r.status === 'error') {
                    alert(r.message);
                } else {
                    curr.removeClass("voted");
                    var votes = parseInt(r.message);
                    tnum.attr("class","thumbs-counter").text(votes);
                    if(votes !== 0) {
                        tnum.addClass(votes>0?"nerdz_thumbsNumPos":"nerdz_thumbsNumNeg");
                    }
                    if(votes>0) {
                        tnum.text("+"+tnum.text());
                    }
                }
            });
        }
        else {
            N.json[plist.data ('type')][func]($.extend(obj,{ thumb: curr.hasClass("up") ? 1: -1 }), function(r) {
                if(r.status === 'error') {
                    alert(r.message);
                } else {
                    cont.children(".voted").removeClass("voted");
                    curr.addClass("voted");
                    var votes = parseInt(r.message);
                    tnum.attr("class","thumbs-counter").text(votes);
                    if(votes !== 0) {
                        tnum.addClass(votes>0?"nerdz_thumbsNumPos":"nerdz_thumbsNumNeg");
                    }
                    if(votes>0) {
                        tnum.text("+"+tnum.text());
                    }
                }
            });
        }
    });


    plist.on ('click', '.more_btn', function() {
        var moreBtn     = $(this),
        commentList = moreBtn.parents ("div[id^=\"commentlist\"]"),
        hpid        = /^post(\d+)$/.exec (commentList.parents ("div[id^=\"post\"]").attr ("id"))[1],
            intCounter  = moreBtn.data ("morecount") || 0;
        if (moreBtn.data ("inprogress") === "1") return;
        moreBtn.data ("inprogress", "1").text (loading + "...");
        N.html[plist.data ('type')].getComments ({ hpid: hpid, start: intCounter + 1, num: 10 }, function (r) {
            moreBtn.data ("inprogress", "0").data ("morecount", ++intCounter).text (moreBtn.data ("localization"));
            var _ref = $("<div>" + r + "</div>");
            // Lesson learned: don't use .parent() after a .hide()
            moreBtn.parent().after (r);
            if (intCounter == 1)
                moreBtn.parent().find (".scroll_bottom_hidden").show();
            if ($.trim (r) === '' || _ref.find (".nerdz_from").length < 10 || (10 * (intCounter + 1)) == _ref.find (".commentcount:eq(0)").html())
            {
                var btnDb = moreBtn.hide().parent();
                btnDb.find (".scroll_bottom_separator").hide();
                btnDb.find (".all_comments_hidden").hide();
            }
        });
    });

    plist.on ('click', '.scroll_bottom_btn', function() {
        // thanks to stackoverflow for .eq(x) and for the scroll hack
        var cList = $(this).parents().eq (2);
        // Select the second last comment, do a fancy scrolling and then focus the textbox.
        $("html, body").animate ({ scrollTop: cList.find (".singlecomment:nth-last-child(2)").offset().top }, function() {
            cList.find (".frmcomment textarea").focus();
        });
    });

    var showAllComments = function(el, callback) {
        // TODO do not waste precious performance by requesting EVERY
        // comment, but instead adapt the limited function to allow
        // specifying a start parameter without 'num'.
        var btn         = $(el),
        btnDb       = btn.parent().parent(),
            moreBtn     = btnDb.find (".more_btn"),
            commentList = btn.parents ("div[id^=\"commentlist\"]"),
                hpid        = /^post(\d+)$/.exec (commentList.parents ("div[id^=\"post\"]").attr ("id"))[1];
        if (btn.data ("working") === "1" || moreBtn.data ("inprogress") === "1") return;
        btn.data ("working", "1").text (loading + "...");
        moreBtn.data ("inprogress", "1");
        N.html[plist.data ('type')].getComments ({ hpid: hpid, forceNoForm: true }, function (res) {
            btn.data ("working", "0").text (btn.data ("localization")).parent().hide();
            btnDb.find (".scroll_bottom_hidden").show().find (".scroll_bottom_separator").hide();
            var parsed = $("<div>" + res + "</div>"), push = $("#commentlist" + hpid);
            moreBtn.hide().data ("morecount", Math.ceil (parseInt (parsed.find (".commentcount").html()) / 10));
            push.find ("div[id^=\"c\"]").remove();
            push.find ('form.frmcomment').eq (0).parent().before (res);
            if($.isFunction(callback)) callback();
        });
    };
    plist.on ('click', '.all_comments_btn', function() {
        showAllComments(this);
    });

    plist.on('click',".qu_ico",function() {
        var area = $("#"+$(this).data('refto')),
        msg  = "[quote=" + $(this).data ('hcid') + "|" + $(this).data ('type') + "]",
        cpos = area[0].selectionStart,
            val  = area.val(),
            intx = val.substring (0, cpos) + msg;
        area.focus();

        area.val(intx + val.substring (cpos));
        area[0].setSelectionRange (intx.length, intx.length);
    });

    plist.on('click',".delpost",function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto'));
        var post = refto.html();
        var hpid = $(this).data('hpid');

        N.json[plist.data('type')].delPostConfirm({ hpid: hpid },function(m) {
            if(m.status == 'ok') {
                refto.html('<div style="text-align:center">' + m.message + '<br /><span id="delPostOk' + hpid +'" style="cursor:pointer">YES</span>|<span id="delPostNo'+hpid+'" style="cursor:pointer">NO</span></div>');
                refto.on('click','#delPostOk'+hpid,function() {
                    N.json[plist.data('type')].delPost({ hpid: hpid    },function(j) {
                        if(j.status == 'ok') {
                            refto.hide();
                        }
                        else {
                            refto.html(j.message);
                        }
                    });
                });

                refto.on('click','#delPostNo'+hpid,function() {
                    refto.html(post);
                });
            } else {
                alert(d.message);
            }
        });
    });

    plist.on('click',".close", function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto'));
        var hpid = $(this).data('hpid');
        var me = $(this), arrow = me.children();

        me.html('...');
        N.json[plist.data('type')].closePost({hpid: hpid},function(m) {
            if(m.status != 'ok') {
                alert(m.message);
            } else {
                refto.css('color','red');
                me.html(N.getLangData().OPEN);
                me.append(arrow);
                me.attr('class',"open");
            }
        });
    });

    plist.on('click',".open", function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto'));
        var hpid = $(this).data('hpid');
        var me = $(this), arrow = me.children();

        me.html('...');
        N.json[plist.data('type')].openPost({hpid: hpid},function(m) {
            if(m.status != 'ok') {
                alert(m.message);
            } else {
                refto.css('color','');
                me.html(N.getLangData().CLOSE);
                me.append(arrow);
                me.attr('class',"close");
            }
        });
    });

    plist.on('click',".edit",function(e) {
        e.preventDefault();
        var refto = $('#' + $(this).data('refto')), hpid = $(this).data('hpid');

        var getF = "getPost", editF = "editPost";
        var getObj = {hpid: hpid};
        var editObj = {hpid: hpid};
        var id = hpid;
        var type = 'hpid';

        if($(this).hasClass("comment")) {
            type = 'hcid';
            getF = "getComment";
            editF = "editComment";
            var hcid =  $(this).data('hcid');
            getObj = {hcid: hcid };
            editObj = {hcid: hcid };
            id = hcid;
        }

        var form = function(fid,id,message,prev, type) {
            return     '<form style="margin-bottom:40px" id="' +fid+ '" data-'+type+'="'+id+'">' +
                '<textarea id="'+fid+'abc" autofocus style="width:99%; height:125px">' +message+ '</textarea><br />' +
                '<input type="submit" value="' + N.getLangData().EDIT +'" style="float: right; margin-top:5px" />' +
                '<button type="button" style="float:right; margin-top: 5px" class="preview" data-refto="#'+fid+'abc">'+prev+'</button>'+
                '<button type="button" style="float:left; margin-top:5px" onclick="window.open(\'/bbcode.php\')">BBCode</button>' +
                '</form>';
        };

        N.json[plist.data('type')][getF](getObj,function(d) {
            var fid = refto.attr('id') + 'editform';
            refto.html(form(fid,id,d.message,$(".preview").html(), type));

            $('#'+fid).on('submit',function(e) {
                e.preventDefault();
                N.json[plist.data('type')][editF]($.extend(editObj, {message: $(this).children('textarea').val()}),
                        function(d) {
                            if(d.status == 'ok')
                            {
                                refto.slideToggle("slow");
                                N.html[plist.data('type')][getF](getObj, function(o) {
                                    refto.html(o);
                                    refto.slideToggle("slow");
                                    if(typeof N.getLangData().HIDE != "undefined") {
                                        $(refto.find("ul.subnav")[0]).append('<li><a class="hide" data-postid="post'+ id + '"><span class="rightarrow"></span>' + N.getLangData().HIDE+'</a></li>');
                                    }

                                });
                            }
                            else {
                                alert(d.message);
                            }
                        });
            });
        });
    });

    plist.on('click',".imglocked",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                var newsrc = me.attr('src');
                me.attr('class','imgunlocked');
                me.attr('src',newsrc.replace('/lock.png','/unlock.png'));
                me.attr('title',d.message);
            } else {
                alert(d.message);
            }
        };

        if($(this).data('silent')) { //nei commenti
            N.json[plist.data('type')].reNotifyFromUserInPost({ hpid: $(this).data('hpid'), from: $(this).data('silent') },function(d) {tog(d);});
        }
        else {
            N.json[plist.data('type')].reNotifyForThisPost({hpid: $(this).data('hpid') },function(d) {tog(d);});
        }
    });

    plist.on('click',".imgunlocked",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                var newsrc = me.attr('src');
                me.attr('class','imglocked');
                me.attr('src',newsrc.replace('/unlock.png','/lock.png'));
                me.attr('title',d.message);
            } else {
                alert(d.message);
            }
        };

        if($(this).data('silent')) {
            N.json[plist.data('type')].noNotifyFromUserInPost({ hpid: $(this).data('hpid'), from: $(this).data('silent') },function(d) {tog(d);});
        }
        else {
            N.json[plist.data('type')].noNotifyForThisPost({hpid: $(this).data('hpid') },function(d) {tog(d);});
        }
    });

    plist.on('click',".lurk",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                var newsrc = me.attr('src');
                me.attr('class','unlurk');
                me.attr('src',newsrc.replace('/lurk.png','/unlurk.png'));
                me.attr('title',d.message);
            } else {
                alert(d.message);
            }
        };

        N.json[plist.data('type')].lurkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});

    });

    plist.on('click',".unlurk",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                var newsrc = me.attr('src');
                me.attr('class','lurk');
                me.attr('src',newsrc.replace('/unlurk.png','/lurk.png'));
                me.attr('title',d.message);
            } else {
                alert(d.message);
            }
        };

        N.json[plist.data('type')].unlurkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});
    });

    plist.on('click',".bookmark",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                var newsrc = me.attr('src');
                me.attr('class','unbookmark');
                me.attr('src',newsrc.replace('/bookmark.png','/unbookmark.png'));
                me.attr('title',d.message);
            } else {
                alert(d.message);
            }
        };

        N.json[plist.data('type')].bookmarkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});

    });

    plist.on('click',".unbookmark",function() {
        var me = $(this);
        var tog = function(d) {
            if(d.status == 'ok') {
                var newsrc = me.attr('src');
                me.attr('class','bookmark');
                me.attr('src',newsrc.replace('/unbookmark.png','/bookmark.png'));
                me.attr('title',d.message);
            } else {
                alert(d.message);
            }
        };

        N.json[plist.data('type')].unbookmarkPost({hpid: $(this).data('hpid') },function(d) {tog(d);});

    });

    plist.on ('click', '.nerdz-code-title', function() {
        localStorage.setItem ('has-dark-theme', ( localStorage.getItem ('has-dark-theme') == 'yep' ? 'nope' : 'yep' ));
        document.location.reload();
    });

    plist.on ('click', '.nerdz-code-title a', function(e) {
        e.stopPropagation();
    });

    // EASTER EGG! :O
    // NOTE: If you alreay tried/discovered this easter egg, then feel free
    // to read the code. Otherwise don't be a bad guy and try to find it by yourself.
    if($("nav div").length) {
        var code = [ 38, 38, 40, 40, 37, 39, 37, 39, 66, 65 ], pressed = [];
        window._NERDZ_NICK = $.trim (/,(.+)/.exec ($("nav div").text())[1]);
        $(window).keydown (function dEv (e) {
            pressed.push (e.keyCode);
            while (pressed.length > code.length) pressed.shift();
            if (JSON.stringify (code) == JSON.stringify (pressed))
            {
                $(window).unbind ('keydown', dEv);
                $('body, a, textarea, input, button').css ('cursor', 'url("http://www.nerdz.eu/static/images/owned.cur"), auto');
                // okay, now the user sees a nice dick instead of its cursor. Why not
                // improve this situation a bit, like changing every nickname with random l4m0rz nicks?
                var fuckNicknames = function() {
                    $(".nerdz_from a").each (function (i, elm) {
                        if ($.inArray ($(elm).html(), ["Vincenzo", "Xenom0rph", "jorgelorenzo97", "PTKDev"]) === -1)
                            $(elm).html (["Vincenzo", "Xenom0rph", "jorgelorenzo97", "PTKDev"][Math.floor(Math.random() * 5)]);
                    });
                };
                // hook a global ajax event handler to destroy nicknames if needed
                $(document).ajaxComplete (function (evt, xhr, settings) {
                    if (/\?action=(show|profile)$|read\.html/.test (settings.url))
                        fuckNicknames();
                });
                fuckNicknames();
                // we're good to go. now do some other things
                $("#title_left a").text ("L4M3RZ");
                setTimeout (function() {
                    $("aside").hide();
                    setTimeout (function() {
                        $("article").hide();
                        $("#loadtxt").css ("text-align", "center").html ("Javascript error: Query #" + parseInt (1 + (Math.floor (Math.random() * 1000))) + " failed.<br><span style='color:#F80012;font-size:20px'>!! JS SQL Injection Detected. Shutting down !!</span>");
                        setTimeout (function() {
                            // enough fun, time for serious stuff
                            $("body").load ("/bsod.html", function() {
                                document.title = "!! SOMETHING F**KED UP !!";
                                $("*").css ("cursor", "none");
                            });
                        }, 5000);
                    }, 9500);
                }, 10500);
            }
        });
    }
    //end plist into events
    setInterval(function() {
        var nc = $("#notifycounter"), val = parseInt(nc.html());
        nc.css('background-color',val === 0 || isNaN(val) ? '#FFF' : '#FF0000');
        var pc = $("#pmcounter");
        val = parseInt(pc.html());
        pc.css('background-color',val === 0 || isNaN(val) ? '#AFAFAF' : '#FF0000');
    },200);

});
