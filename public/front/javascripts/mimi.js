var processHash = function () {
    var hashStr = location.hash.replace("#", "");
    if (!hashStr) {
        if ($("#detail").length > 0) {
            var scrolltop = $("#detail").attr("scrolltop");
            $("#detail").remove();
            $("#container").show();
            $("#mask_share").hide();
            // if (typeof window.WeixinJSBridge !== 'undefined') {
            // WeixinJSBridge.call('hideOptionMenu');
            //}
            document.body.scrollTop = scrolltop;
        }
        if ($("#lock_card").length > 0) {
            var scrolltop = $("#lock_card").attr("scrolltop");
            $("#lock_card").remove();
            $("#container").show();
            document.body.scrollTop = scrolltop;
        }
    } else if (hashStr.split('#').length == 1) {
        if ($("#lock_card").length > 0 && $("#detail").length > 0) {
            var scrolltop = $("#lock_card").attr("scrolltop");
            $("#lock_card").remove();
            $("#detail").show();
            document.body.scrollTop = scrolltop;
        }
    }
}

window.onhashchange = processHash;

function initevent() {
    $(".emotion").SinaEmotion($('.txt-area'));
    //发表秘密
    $('#create_post').click(function () {
        var school_id = $("#school_id").val();
        $.ajax({
            'url': '/post/get_posting_page?school_id=' + school_id,
            'type': 'get',
            'dataType': 'html',
            success: function (result, st) {
                $("#main").append(result);
                $("#main").find("#form-0").find('#form-0-cancel').click(function () {
                    $("#form-0").remove();
                    $("#container").show();
                });
                $("#container").hide();
                $("#main").find("#form-0").show();
                //---------------------


                //---------------------

                $("#main").find("#form-0").find('#form-0-submit').click(function () {
                    $(this).unbind("click");
                    var content = $("#post_text").val();
                    var school_id = $("#school_id").val();
					content=AnalyticEmotion(content);
                    var school_name = $("#school_name").val();
                    if (content == "" || school_id == "" || school_name == "") {
                        alert("信息不完整");
                        return;
                    }
					//content=content.replace(/\n/g, '_@').replace(/\r/g, '_#');
				    var nicked = document.getElementById("secret_nicked").checked ? 1 : 0;
                    var post_type = $("#post_type").val();
                    $.ajax({
                        'url': '/post/create?t=' + post_type,
                        'type': 'POST',
                        'dataType': 'html',
                        'data': {'content': content, 'school_id': school_id, 'school_name': school_name, 'nicked': nicked, 'image': imagedata},
                        success: function (result, st) {
                            if (result == 'err') {
                                mask_post_hide();
                            } else {
                                $("#feed_list_cot_all").find(".mygonggao").after(result);
                            }
                            $("#container").show();
                            $("#main").find("#form-0").remove();
                        },
                        beforeSend: function (xhr, textStatus) {
                            loading_show();
                        },
                        error: function (xhr) {
                            if (xhr.status != 403) {
                                tip("出现异常，请刷新后重试");
                            }
                        },
                        complete: function (xhr, textStatus) {
                            loading_hide();
                            if (xhr.status == 403) {
                                mask_Setting_Show();
                            }
                        }
                    });
                });
            },
            beforeSend: function (xhr, textStatus) {
                loading_show();
            },
            error: function (xhr) {
                if (xhr.status != 403) {
                    tip("出现异常，请刷新后重试");
                }
            },
            complete: function (xhr, textStatus) {
                loading_hide();
                if (xhr.status == 403) {
                    mask_Setting_Show();
                }
            }
        });
    });

    get_post_submit_selector().click(function () {
        new_secret();
    });

    $('button.newconfess').click(function () {
        var school_id = $("#school_id").val();
        $.ajax({
            'url': '/post/get_posting_confess_page?school_id=' + school_id,
            'type': 'get',
            'dataType': 'html',
            success: function (result, st) {
                $("#main").append(result);
                $("#main").find("#form-0").find('#form-0-cancel').click(function () {
                    $("#form-0").remove();
                    $("#container").show();
                });
                $("#container").hide();
                $("#main").find("#form-0").show();
                $("#main").find("#form-0").find('#college-select').click(function () {
                    $.ajax({
                        'url': '/post/get_college_select_page?school_id=' + school_id,
                        'type': 'get',
                        'dataType': 'html',
                        success: function (result, st) {
                            $("#main").append(result);
                            $("#main").find("#form-1").find('#form-1-cancel').click(function () {
                                $("#form-1").remove();
                                $("#container").show();
                            });
                            $("#main").find("#form-1").find('.ui-list li').click(function () {
                                $("#college_set").text($(this).attr("college_name"));
                                $("#college_id").val($(this).attr("college_id"));
                                $("#college_name").val($(this).attr("college_name"));
                                $("#container").hide();
                                $("#main").find("#form-0").show();
                                $("#main").find("#form-1").hide();
                            });
                            $("#container").hide();
                            $("#main").find("#form-0").hide();
                            $("#main").find("#form-1").show();
                        },
                        beforeSend: function (xhr, textStatus) {
                            loading_show();
                        },
                        error: function (xhr) {
                            if (xhr.status != 403) {
                                tip("出现异常，请刷新后重试");
                            }
                        },
                        complete: function (xhr, textStatus) {
                            loading_hide();
                            if (xhr.status == 403) {
                                mask_Setting_Show();
                            }
                        }
                    });
                });
                $("#main").find("#form-0").find('#form-0-submit').click(function () {
                    $(this).unbind("click");
                    var content = $("#confess_text").val();
                    var school_id = $("#school_id").val();
                    var school_name = $("#school_name").val();
                    var college_name = $("#college_name").val();
                    var college_id = $("#college_id").val();
                    var confess_to = $("#confess_to").val();
                    if (content == "" || school_id == "" || school_name == "" || college_name == "" || college_id == "" || confess_to == "") {
                        alert("信息不完整");
                        return;
                    }
                    var nicked = document.getElementById("confess_nicked").checked ? 1 : 0;
                    $.ajax({
                        'url': '/post/create?t=confess',
                        'type': 'POST',
                        'dataType': 'html',
                        'data': {'nicked': nicked, 'content': content, 'school_id': school_id, 'college_id': college_id, 'school_name': school_name, 'college_name': college_name, 'confess_to': confess_to},
                        success: function (result, st) {
                            if (result == 'err') {
                                mask_post_hide();
                            } else {
                                $("#feed_list_cot_all").find(".mygonggao").after(result);
                            }
                            $("#container").show();
                            $("#main").find("#form-0").hide();
                        },
                        beforeSend: function (xhr, textStatus) {
                            loading_show();
                        },
                        error: function (xhr) {
                            if (xhr.status != 403) {
                                tip("出现异常，请刷新后重试");
                            }
                        },
                        complete: function (xhr, textStatus) {
                            loading_hide();
                            if (xhr.status == 403) {
                                mask_Setting_Show();
                            }
                        }
                    });
                });
            },
            beforeSend: function (xhr, textStatus) {
                loading_show();
            },
            error: function (xhr) {
                if (xhr.status != 403) {
                    tip("出现异常，请刷新后重试");
                }
            },
            complete: function (xhr, textStatus) {
                loading_hide();
                if (xhr.status == 403) {
                    mask_Setting_Show();
                }
            }
        });

    });
    //follow
    //jslink
    $('.js-link').each(function () {
        var o = $(this);
        var url = o.attr('link');
        o.click(function () {
            document.location.href = url;
        });
    });


    var obj = document.getElementById("gotop");

    function getScrollTop() {
        var diffY;
        if (document.documentElement && document.documentElement.scrollTop)
            diffY = document.documentElement.scrollTop;
        else if (document.body)
            diffY = document.body.scrollTop
        return diffY;
    }

    function setScrollTop(value) {
        if (document.documentElement && document.documentElement.scrollTop)
            document.documentElement.scrollTop = value;
        else if (document.body)
            document.body.scrollTop = value;
    }

    window.onscroll = function () {
        getScrollTop() > 0 ? obj.style.display = "block" : obj.style.display = "none";
    }
    obj.onclick = function () {
        var goTop = setInterval(scrollMove, 10);

        function scrollMove() {
            setScrollTop(getScrollTop() / 1.1);
            if (getScrollTop() < 1)clearInterval(goTop);
        }
    }
}
initevent();

var load_Post_Detail_TO_Reply = function (post_id, reply_id, is_main) {
    load_Post_Detail(post_id, false, function (objDetail) {
        if (is_main) {
            document.body.scrollTop = $("#detail-main-reply-" + reply_id + "").offset().top;
            objDetail.find("#detail-main-reply-" + reply_id + "").find(".i-reply").click();
        } else {
            document.body.scrollTop = $("#reply-" + reply_id + "").offset().top;
            objDetail.find("#reply-" + reply_id + "").find(".detail-reply-content").click();
        }
    });
}


var load_User_Setting = function () {

    $("#mask_setting").show();
}

var setParam_To_Post_Comment_SubmitBtn = function (from, post_id, tou_name, tou_id, tou_sex, main_id, reply_id) {
    get_post_comment_selector().attr("tou_name", "");
    get_post_comment_selector().attr("tou_id", "");
    get_post_comment_selector().attr("tou_sex", "");
    get_post_comment_selector().attr("main_id", "");
    get_post_comment_selector().attr("post_id", "");
    get_post_comment_selector().attr("reply_id", "");
    get_post_comment_selector().attr("from", "");
    get_post_comment_selector().attr("tou_name", tou_name || '');
    get_post_comment_selector().attr("tou_id", tou_id || '');
    get_post_comment_selector().attr("tou_sex", tou_sex || '');
    get_post_comment_selector().attr("main_id", main_id || '');
    get_post_comment_selector().attr("post_id", post_id || '');
    get_post_comment_selector().attr("reply_id", reply_id || '');
    get_post_comment_selector().attr("from", from || '');
    mask_Input_Show("comment", tou_name);
	$("#create_post").hide();
}

var submit_Post_Comment = function (objThis) {
    var data = {
        from: $(objThis).attr("from"),
        reply_id: $(objThis).attr("reply_id"),
        post_id: $(objThis).attr("post_id"),
        tou_name: $(objThis).attr("tou_name"),
        tou_id: $(objThis).attr("tou_id"),
        tou_sex: $(objThis).attr("tou_sex"),
        main_id: $(objThis).attr("main_id"),
        content: mask_Input_Data().content,
        nicked: mask_Input_Data().nicked,
		admin_sex:mask_Input_Data().admin_sex,
		admin_name:mask_Input_Data().admin_name
    }
    if (mask_Input_Data().content.trim() == '') {
        tip('你好像没说啥，说两句吧！');
        return;
    }
	$("#create_post").show();
    handler_Post_All_Comment_Event(data);
}

var handler_Post_All_Comment_Event = function (data) {
    $.ajax({
        'url': '/reply/create',
        'type': 'POST',
        'dataType': 'html',
        'data': data,
        success: function (result, st) {
            if (data.from == "list") {
                //第一种情况只有赞的情况下
                if ($("#" + data.post_id + "").find("#zan-" + data.post_id + "").css("display") != "none" && $("#" + data.post_id + "").find(".i-reply").length <= 0) {
                    $("#" + data.post_id + "").find(".hr").show();
                } else if ($("#" + data.post_id + "").find("#mimi-comments-" + data.post_id + "").css("display") == "none") {
                    $("#" + data.post_id + "").find("#mimi-comments-" + data.post_id + "").show();
                }
                if (data.main_id == "") {
                    $("#" + data.post_id + "").find(".hr").after(result);
                } else {
                    $("#container").find("#reply-" + data.reply_id + "").after(result);
                }
            } else if (data.from == "detail_comment") {
                $("#detail").find("#comments_" + data.post_id + "").prepend(result);
                if ($("#detail").find("#b-" + data.post_id + "").css("display") == "none" && $("#detail").find("#zan-" + data.post_id + "").css("display") != "none") {
                    $("#detail").find("#b-" + data.post_id + "").show();
                }
            } else if (data.from == "detail_reply") {
                $("#detail").find("#reply-" + data.reply_id + "").after(result);
            }
            tip("评论成功");
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                // location.href = "/signin"
                mask_Setting_Show();
            }
        }
    });
}

function new_secret() {
    var data = mask_Input_Data();
    if (data.content.trim() == '') {
        tip('你好像没说啥，说两句吧！');
        return;
    }
    ;
    $.ajax({
        'url': '/post/create?t=' + data.type,
        'type': 'POST',
        'dataType': 'html',
        'data': data,
        success: function (result, st, xhr) {
            if (result == 'err') {
                mask_post_hide();
            } else {
//                /alert(result);
                // $(result).hide();
                $("#feed_list_cot_all").find(".mygonggao").after(result);
                $(result).show();
                tip("发表成功");
            }
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                //location.href = "/signin"
                mask_Setting_Show();
            }
        }
    });
}

var setParam_To_Post_Plus_SubmitBtn = function (post_id, post_type) {
    get_post_plus_selector().attr("post_id", post_id);
    get_post_plus_selector().attr("post_type", post_type);
    mask_Input_Show("post_plus");
}

var submit_Post_Plus = function (objThis) {
    if (mask_Input_Data().content.trim() == '') {
        tip('你好像没说啥，说两句吧！');
        return;
    }
    var data = {
        post_id: $(objThis).attr("post_id"),
        post_type: $(objThis).attr("post_type"),
        content: mask_Input_Data().content
    }
    handler_Post_Plus_Event(data);
}

function handler_Post_Plus_Event(data) {
    $.ajax({
        'url': '/post/plus',
        'type': 'POST',
        'dataType': 'json',
        'data': data,
        success: function (json, st) {
            if (!json.success) {
                alert(json.msg);
                return;
            }
            var post_type = data.post_type == "secret" ? "秘密" : "表白";
            $("#" + data.post_id + "").find("#content-" + data.post_id + "").after("<br><p style='font-size: 16px;'><strong>追加:</strong>" + data.content + "</p>");
            if (("#detail").length > 0) {
                $("#detail").find("#content-" + data.post_id + "").prepend("<br><p  style='font-size: 16px;'><strong>" + post_type + "追加:</strong>" + data.content + "</p>");
            }
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                mask_Setting_Show();
            }
        }
    });
}

var post_Detail_Share = function () {
    $("#mask_share").show();
}

var detail_GoBack = function () {
    if ($("#container").length > 0) {
        history.go(-1)
    } else {
        location.href = "/"
    }
}

var load_Post_Detail = function (post_id, share, callback) {
    var url = '/detail/' + post_id + '?ajax=true';
    if (share) {
        url = url + "&share=true";
    }
    var scrollTop = document.body.scrollTop;
    $.ajax({
        'url': url,
        'type': 'GET',
        'dataType': 'html',
        success: function (response, st) {
            location.hash = "#" + post_id;
            $("#main").prepend(response);
            $("#detail").attr("scrolltop", scrollTop);
            $("#container").hide();
            $("#detail").show();
            if (share) {
                post_Detail_Share();
            }
            if (typeof window.WeixinJSBridge !== 'undefined') {
                WeixinJSBridge.call('showOptionMenu');
            }
            ;
            document.body.scrollTop = 0;
            if (typeof callback != 'undefined' && callback instanceof Function) {
                callback($("#detail"));
            }
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                mask_Setting_Show();
            }
        }
    })
}

var user_Lock = function (user_id, name) {
    $.ajax({
        'url': '/user/lock?user_id=' + user_id + '&name=' + name + '',
        'type': 'GET',
        'dataType': 'html',
        success: function (response, st) {
            if (response == "err") {
                tip("出错了");
            } else if (response == "self") {
                location.href = "/user/index";
            } else {
                location.hash = location.hash + "#user_card";
                $("#main").prepend(response);
                $("#lock_card").attr("scrolltop", document.body.scrollTop);
                $("#container").hide();
                $("#lock_card").show();
                if ($("#detail").length > 0) {
                    $("#detail").hide();
                }
            }
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                mask_Setting_Show();
            }
        }
    })
}

var setParam_To_Private_Msg_SubmitBtn = function (user_id, ref_type, ref_id) {
    get_post_private_message_selector().attr("tou_id", user_id);
    get_post_private_message_selector().attr("ref_type", ref_type);
    get_post_private_message_selector().attr("ref_id", ref_id);
    mask_Input_Show("private_msg");
}

var submit_Private_Msg = function (objThis) {
    var data = {
        tou_id: $(objThis).attr("tou_id"),
        ref_type: $(objThis).attr("ref_type"),
        ref_id: $(objThis).attr("ref_id"),
        content: mask_Input_Data().content,
        nicked: mask_Input_Data().nicked
    };
    if (mask_Input_Data().content.trim() == '') {
        tip('你好像没说啥，说两句吧！');
        return;
    }
    handler_Submit_Private_Msg(data);
}

var handler_Submit_Private_Msg = function (data) {
    $.ajax({
        'url': '/message/create',
        'type': 'POST',
        'dataType': 'json',
        'data': data,
        success: function (json, st) {
            if (!json.success) {
                tip("发送失败");
            }
            tip("发送成功");
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                mask_Setting_Show();
            }
        }
    });
}

var postLike = function (post_id, objThis) {
    var type = $(objThis).attr("type") == "secret" ? '赞' : '祝福'
    $.ajax({
        'url': "/postlike?post_id=" + post_id,
        'type': 'GET',
        'dataType': 'json',
        success: function (json, st) {
            if (json.success) {
                if (json.exsit) {
                    tip("已经" + type + "过了");
                    $(objThis).html("已" + type + "");
                    $(objThis).addClass('clicked');
                } else {
                    //有评论没赞的情况下
                    if ($("#" + post_id + "").find(".i-reply").length > 0 && $("#zan-" + post_id + "").css("display") == "none") {
                        $("#zan-" + post_id + "").show();
                        $("#" + post_id + "").find("#separator").show();
                    }
                    //什么都没有的情况下
                    else if ($("#mimi-comments-" + post_id + "").css("display") == "none") {
                        $("#mimi-comments-" + post_id + "").show();
                        $("#zan-" + post_id + "").show();
                    }
                    else {
                        var number = $("#zan-" + post_id + " span").html();
                        $("#zan-" + post_id + " span").html(parseInt(number) + 1);
                    }
                    $(objThis).addClass('clicked');
                    $(objThis).html("已" + type + "");
                }
            }
            else {
                alert("操作失败，请稍后再试试");
            }
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                mask_Setting_Show();
            }
        }
    });
}

var post_fav = function (post_id, objThis) {
    $.ajax({
        'url': "/postfav?post_id=" + post_id,
        'type': 'GET',
        'dataType': 'json',
        success: function (json, st) {
            if (json.success) {
                if (json.exsit) {
                    alert("已经收藏过了");
                    $(objThis).html('已收藏');
                } else {
                    alert("收藏成功");
                    //有评论没赞的情况下
                    $(objThis).addClass('clicked');
                    $(objThis).html('已收藏');
                }
            }
            else {
                alert("收藏失败，请稍后再试试");
            }
        },
        beforeSend: function (xhr, textStatus) {
            mask_post_hide();
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                mask_Setting_Show();
            }
        }
    });
}

var postDel = function (post_id) {
    if (confirm("你确定要删除吗？")) {
        $.ajax({
            'url': '/post/del?post_id=' + post_id,
            'type': 'GET',
            'dataType': 'json',
            success: function (json, st) {
                if (json.success) {
                    $("#" + post_id + "").remove();
                    tip("删除成功");
                } else {
                    alert(json.message);
                }
            },
            beforeSend: function (xhr, textStatus) {
                loading_show();
            },
            error: function (xhr) {
                if (xhr.status != 403) {
                    tip("出现异常，请刷新后重试");
                }
            },
            complete: function (xhr, textStatus) {
                loading_hide();
                if (xhr.status == 403) {
                    mask_Setting_Show();
                }
            }
        });
    }
}

var replyDel = function (reply_id, from) {
    if (confirm("你确定要删除吗？")) {
        $.ajax({
            'url': '/reply/del?reply_id=' + reply_id,
            'type': 'GET',
            'dataType': 'json',
            success: function (json, st) {
                if (!json.success) {
                    tip(json.message);
                    return;
                }
                if (typeof(from) == "undefined") {
                    $("#reply-" + reply_id + "").remove();
                } else {
                    $("#detail-main-reply-" + reply_id + "").remove();
                }
            },
            beforeSend: function (xhr, textStatus) {
                loading_show();
            },
            error: function (xhr) {
                if (xhr.status != 403) {
                    tip("出现异常");
                }
            },
            complete: function (xhr, textStatus) {
                loading_hide();
                if (xhr.status == 403) {
                    tip("你没有权限");
                }
            }
        });
    }
}

var friend_Board_Del = function (friend_board_id) {
    if (confirm("你确定要删除吗？")) {
        $.ajax({
            'url': '/friend_board/del?friend_board_id=' + friend_board_id,
            'type': 'GET',
            'dataType': 'json',
            success: function (json, st) {
                if (!json.success) {
                    tip(json.message);
                    return;
                }
                $("#feed-" + friend_board_id + "").remove();

            },
            beforeSend: function (xhr, textStatus) {
                loading_show();
            },
            error: function (xhr) {
                if (xhr.status != 403) {
                    tip("出现异常");
                }
            },
            complete: function (xhr, textStatus) {
                loading_hide();
                if (xhr.status == 403) {
                    tip("你没有权限");
                }
            }
        });
    }
}

var trade_Board_Del = function (trade_board_id) {
    if (confirm("你确定要删除吗？")) {
        $.ajax({
            'url': '/trade_board/del?trade_board_id=' + trade_board_id,
            'type': 'GET',
            'dataType': 'json',
            success: function (json, st) {
                if (!json.success) {
                    tip(json.message);
                    return;
                }
                $("#feed-" + trade_board_id + "").remove();

            },
            beforeSend: function (xhr, textStatus) {
                loading_show();
            },
            error: function (xhr) {
                if (xhr.status != 403) {
                    tip("出现异常");
                }
            },
            complete: function (xhr, textStatus) {
                loading_hide();
                if (xhr.status == 403) {
                    tip("你没有权限");
                }
            }
        });
    }
}

var post_Update_Status = function (action_name, post_id, objThis) {
    var action_val = $(objThis).attr("action_val");
    var type = "赞";
    if (action_name == "like") {
        type = $(objThis).attr("type") == "confess" ? '祝福' : '赞'
    }
    $.ajax({
        'url': '/post/update_status',
        'data': {post_id: post_id, action_name: action_name, action_val: action_val },
        'type': 'GET',
        'dataType': 'json',
        success: function (json, st) {
            if (!json.success) {
                alert("出异常了");
            }
            else if (action_name == "top" && action_val == "true") {
                $(objThis).html("去顶");
                $("#top_" + post_id + "").show();
                $(objThis).attr("action_val", "false");
            }
            else if (action_name == "top" && action_val == "false") {
                $(objThis).html("置顶");
                $("#top_" + post_id + "").hide();
                $(objThis).attr("action_val", "true");
            }
            else if (action_name == "chosen" && action_val == "true") {
                $(objThis).html("去荐");
                $("#chosen_" + post_id + "").show();
                $(objThis).attr("action_val", "false");
            }
            else if (action_name == "chosen" && action_val == "false") {
                $(objThis).html("推荐");
                $("#chosen_" + post_id + "").hide();
                $(objThis).attr("action_val", "true");
            }
            else if (action_name == "display" && action_val == "true") {
                $(objThis).html("隐藏");
                $(objThis).attr("action_val", "false");
            }
            else if (action_name == "display" && action_val == "false") {
                $(objThis).html("显示");
                $(objThis).attr("action_val", "true");
            }
            else if (action_name == "like" && action_val == "false") {
                $(objThis).html("" + type + "");
                $(objThis).attr("action_val", "true");
                $(objThis).removeClass('clicked');
                var number = $("#zan-" + post_id + " span").html();
                $("#zan-" + post_id + " span").html(parseInt(number) - 1);
            }
            else if (action_name == "like" && action_val == "true") {
                $(objThis).html("取消" + type + "");
                $(objThis).attr("action_val", "false");
                $(objThis).addClass('clicked');
                var number = $("#zan-" + post_id + " span").html();
                $("#zan-" + post_id + " span").html(parseInt(number) + 1);
                $("#zan-" + post_id + "").show();
            }
            else if (action_name == "fav" && action_val == "false") {
                $(objThis).html("收藏");
                $(objThis).attr("action_val", "true");
                $(objThis).removeClass('clicked');
            }
            else if (action_name == "fav" && action_val == "true") {
                $(objThis).html("取消收藏");
                $(objThis).attr("action_val", "false");
                $(objThis).addClass('clicked');
            }
        },
        beforeSend: function (xhr, textStatus) {
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
            if (xhr.status == 403) {
                mask_Setting_Show();
            }
        }
    });
}

function showcomm(id) {
    $('#comadd' + id).toggle();
    if (supports_html5_storage()) {
        var uname = localStorage["uname"];
        if (uname != null && uname != '') $('#username' + id).val(uname);
    }
}

function posting_confess_show() {
    $("#container").hide();
    $("#main").find("#form-0").show();
}

function posting_confess_hide() {
    $("#container").show();
    $("#main").find("#form-0").hide();
}

function college_select_show() {
    $("#container").hide();
    $("#main").find("#form-0").hide();
    $("#main").find("#form-1").show();
}

function college_select_hide() {
    $("#container").hide();
    $("#main").find("#form-0").show();
    $("#main").find("#form-1").hide();
}
var mask_Input_Hide = function () {
    $("#mask_post").hide();
	$("#create_post").show();
}

var go_User_Index = function () {
    if ($("#user_login") && $("#user_login").val() == "false") {
        mask_Setting_Show();
        return;
    }
    location.href = "/user/index"
}

var mask_Input_Show = function (type, tou_name) {
    if ($("#user_login") && $("#user_login").val() == "false") {
        mask_Setting_Show();
        return;
    }
    //alert(tou_name);
    $('#mask_post .action').show();
    document.getElementById("niming").checked = false;
    $('#mask_post .action').hide();
    if (type == "secret") {
        $('#mask_post .J_title').html('发布新秘密');
        $('#mask_post textarea.txt-area').attr('placeholder', '向树洞姐姐倾诉自己的秘密吧');
        $('#mask_post textarea.txt-area').val('');
        $("#submit_post").show();
        $("#submit_reply").hide();
        $("#submit_post_comment").hide();
        $("#submit_post_detail_comment").hide();
        $("#submit_post_detail_reply").hide();
        $("#submit_post_plus").hide();
        $("#submit_private_msg").hide();
    }
    else if (type == "comment") {
        $('#mask_post .J_title').html('评论');
        $('#mask_post textarea.txt-area').attr('placeholder', '我也来一句：');
        if (tou_name) {
            $('#mask_post textarea.txt-area').attr('placeholder', '回复' + tou_name + '：');
        }
        $('#mask_post textarea.txt-area').val('');
        $("#submit_post").hide();
        $("#submit_post_list_reply").hide();
        $("#submit_post_comment").show();
        $("#submit_post_detail_comment").hide();
        $("#submit_post_detail_reply").hide();
        $("#submit_post_plus").hide();
        $("#submit_private_msg").hide();
    }
    else if (type == "post_plus") {
        $('#mask_post .J_title').html('追加');
        $('#mask_post textarea.txt-area').val('');
        $("#submit_post").hide();
        $("#submit_post_comment").hide();
        $("#submit_post_list_reply").hide();
        $("#submit_post_list_comment").hide();
        $("#submit_post_detail_comment").hide();
        $("#submit_post_detail_reply").hide();
        $("#submit_post_plus").show();
        $("#submit_private_msg").hide();
        $('#mask_post .action').hide();
    }
    else if (type == "private_msg") {
        $('#mask_post .J_title').html('私信');
        $('#mask_post textarea.txt-area').attr('placeholder', '给TA说悄悄话');
        $('#mask_post textarea.txt-area').val('');
        $("#submit_post").hide();
        $("#submit_post_comment").hide();
        $("#submit_post_list_reply").hide();
        $("#submit_post_list_comment").hide();
        $("#submit_post_detail_comment").hide();
        $("#submit_post_detail_reply").hide();
        $("#submit_post_plus").hide();
        $("#submit_private_msg").show();
    }

    paddingtop = document.body.scrollTop + 40;
    var height = document.body.scrollTop + $(window).height();
    $('#mask_post').css({'top': '0px', 'padding-top': paddingtop + 'px', 'height': height + 'px'});
    $('#mask_post').show();
    setTimeout(function () {
        $('#mask_post	textarea.txt-area').focus();
    }, 200);
}


var mask_Setting_Show = function () {
    $.ajax({
        'url': '/user/user_setting',
        'type': 'GET',
        'dataType': 'html',
        success: function (result, st, xhr) {
            $('#mask_setting .form-bd').html(result);
            paddingtop = document.body.scrollTop + 40;
            var height = document.body.scrollTop + $(window).height();
            $('#mask_setting').css({'top': '0px', 'padding-top': paddingtop + 'px', 'height': height + 'px'});
            $('#mask_setting').show();
            setTimeout(function () {
                $('#mask_setting	textarea.txt-area').focus();
            }, 200);
        },
        beforeSend: function (xhr, textStatus) {
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            loading_hide();
        }
    });
}

//管理员操作start--------------------------------

var mask_Setting_Hide = function () {
    $("#mask_setting").hide();
}


var mask_Classify_Hide = function () {
    $("#mask_classify").hide();
}

var mask_Classify_Show = function (post_id) {
    paddingtop = document.body.scrollTop + 40;
    var height = document.body.scrollTop + $(window).height();
    $('#mask_classify').css({'top': '0px', 'padding-top': paddingtop + 'px', 'height': height + 'px'});
    $('#mask_classify').show();
    $('#mask_classify').find("#classify_id").val(post_id);

}

var handler_Classify_Setting = function () {
    var action_val = $("#post_classify").val();
    var action_name = "other";
    var post_id = $('#mask_classify').find("#classify_id").val();
    $.ajax({
        'url': '/post/update_status',
        'data': {post_id: post_id, action_name: action_name, action_val: action_val },
        'type': 'GET',
        'dataType': 'json',
        success: function (json, st) {
            if (!json.success) {
                tip("设置失败，请刷新重试");
                return;
            }
            tip("设置成功了");
            mask_Classify_Hide();
            $('#' + action_val + '_' + post_id + '').show();
        },
        beforeSend: function (xhr, textStatus) {
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            mask_Setting_Hide();
            loading_hide();
        }
    });
}
//管理员操作end--------------------------------

var handler_Submit_User_Setting = function (callback) {
    var user_name = $("#user_name").val();
    var user_sex = $("#user_sex").val();
    var school_en_name = $("#school_en_name").val();
    var wgateid = $("#wgateid").val();
    if (user_name == "" || user_sex == ""  || wgateid == "") {
        alert("信息不完整");
        return;
    }
    var data = {user_name: user_name, user_sex: user_sex, school_en_name: school_en_name, wgateid: wgateid};

    $.ajax({
        'url': '/user/user_setting',
        'type': 'POST',
        'dataType': 'json',
        'data': data,
        success: function (json, st) {
            if (!json.success) {
                tip("设置失败，请刷新重试");
                return;
            }
            $("#user_login").val(true);
            if ($("#is_redirect")&&($("#is_redirect").val()=="true")) {
                $("#main").find("#form-0").find('#form-0-submit').click();
            } else {
                tip("设置成功了啦", 5000);
            }

        },
        beforeSend: function (xhr, textStatus) {
            loading_show();
        },
        error: function (xhr) {
            if (xhr.status != 403) {
                tip("出现异常，请刷新后重试");
            }
        },
        complete: function (xhr, textStatus) {
            mask_Setting_Hide();
            loading_hide();
        }
    });
}

function get_post_submit_selector() {
    return $('#submit_post');
}

function get_post_comment_selector() {
    return $('#submit_post_comment');
}

function get_post_detail_comment_selector() {
    return $('#submit_post_detail_comment');
}

function get_post_plus_selector() {
    return $('#submit_post_plus');
}

function get_post_detail_reply_selector() {
    return $('#submit_post_detail_reply');
}

function get_post_comment_selector() {
    return $('#submit_post_comment');
}

function get_post_private_message_selector() {
    return $('#submit_private_msg');
}

function mask_Input_Data() {
    var content = $('#mask_post textarea.txt-area').val();
	content=AnalyticEmotion(content);
    var type = $('#mask_post b.J_submit').attr("type");
    var school_id = $("#school_id").val();
    var school_name = $("#school_name").val();
    var nicked = $("#mask_post div.action input").attr("checked");
	var admin_sex=$("#admin_sex").val();
	var admin_name=$("#admin_name").val();
    nicked = nicked ? 1 : 0;
    return {'content': content, 'type': type, 'school_id': school_id, 'school_name': school_name, 'nicked': nicked,'admin_sex':admin_sex,'admin_name':admin_name};
}

function mask_post_hide() {
    $('#mask_post').hide();
}

function loading_show() {
    $('#loading').show();
}

function loading_hide() {
    $('#loading').hide();
}

function tip(msg) {
    $("#tip").find("p").html(msg);
    $("#tip").show();
    setTimeout(function () {
        $("#tip").hide();
    }, 3000);
}
function tip(msg, time) {
    $("#tip").find("p").html(msg);
    $("#tip").show();
    setTimeout(function () {
        $("#tip").hide();
    }, 2000);
}


//-----------------------------
