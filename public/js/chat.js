$(function () {
    let pusher = new Pusher($("#pusher_app_key").val(), {
        cluster: $("#pusher_cluster").val(),
        encrypted: true
    });

    let channel = pusher.subscribe('chat');


    // on click on any chat btn render the chat box
    $(".chat-toggle").on("click", function (e) {
        e.preventDefault();

        let ele = $(this);

        let user_id = ele.attr("data-id");

        let username = ele.attr("data-user");

        cloneChatBox(user_id, username, function () {

            let chatBox = $("#chat_box_" + user_id);

            if(!chatBox.hasClass("chat-opened")) {

                chatBox.addClass("chat-opened").slideDown("fast");

                loadLatestMessages(chatBox, user_id);

                chatBox.find(".chat-area").animate({scrollTop: chatBox.find(".chat-area").offset().top + chatBox.find(".chat-area").outerHeight(true)}, 800, 'swing');
            }
        });
    });

    // on close chat close the chat box but don't remove it from the dom
    $(".close-chat").on("click", function (e) {

        $(this).parents("div.chat-opened").removeClass("chat-opened").slideUp("fast");
    });
});


/**
 * loaderHtml
 *
 * @returns {string}
 */
function loaderHtml() {
    return '<i class="glyphicon glyphicon-refresh loader"></i>';
}

/**
 * getMessageSenderHtml
 *
 * this is the message template for the sender
 *
 * @param message
 * @returns {string}
 */
function getMessageSenderHtml(message)
{
    return `
           <div class="row msg_container base_sent" data-message-id="${message.id}">
        <div class="col-md-10 col-xs-10">
            <div class="messages msg_sent text-right">
                <p>${message.content}</p>
                <time datetime="${message.dateTimeStr}"> ${message.fromUserName} • ${message.dateHumanReadable} </time>
            </div>
        </div>
        <div class="col-md-2 col-xs-2 avatar">
            <img src="` + base_url +  '/images/user-avatar.png' + `" width="50" height="50" class="img-responsive">
        </div>
    </div>
    `;
}

/**
 * getMessageReceiverHtml
 *
 * this is the message template for the receiver
 *
 * @param message
 * @returns {string}
 */
function getMessageReceiverHtml(message)
{
    return `
           <div class="row msg_container base_receive" data-message-id="${message.id}">
           <div class="col-md-2 col-xs-2 avatar">
             <img src="` + base_url +  '/images/user-avatar.png' + `" width="50" height="50" class="img-responsive">
           </div>
        <div class="col-md-10 col-xs-10">
            <div class="messages msg_receive text-left">
                <p>${message.content}</p>
                <time datetime="${message.dateTimeStr}"> ${message.fromUserName}  • ${message.dateHumanReadable} </time>
            </div>
        </div>
    </div>
    `;
}


/**
 * cloneChatBox
 *
 * this helper function make a copy of the html chat box depending on receiver user
 * then append it to 'chat-overlay' div
 *
 * @param user_id
 * @param username
 * @param callback
 */
function cloneChatBox(user_id, username, callback)
{
    if($("#chat_box_" + user_id).length == 0) {

        let cloned = $("#chat_box").clone(true);

        // change cloned box id
        cloned.attr("id", "chat_box_" + user_id);

        cloned.find(".chat-user").text(username);

        cloned.find(".btn-chat").attr("data-to-user", user_id);

        cloned.find("#to_user_id").val(user_id);

        $("#chat-overlay").append(cloned);
    }

    callback();
}

/**
 * loadLatestMessages
 *
 * this function called on load to fetch the latest messages
 *
 * @param container
 * @param user_id
 */
function loadLatestMessages(container, user_id)
{
    let chat_area = container.find(".chat-area");

    chat_area.html("");

    $.ajax({
        url: base_url + "/load-latest-messages",
        data: {user_id: user_id, _token: $("meta[name='csrf-token']").attr("content")},
        method: "GET",
        dataType: "json",
        beforeSend: function () {
            if(chat_area.find(".loader").length  == 0) {
                chat_area.html(loaderHtml());
            }
        },
        success: function (response) {
            if(response.state == 1) {
                response.messages.map(function (val, index) {
                    $(val).appendTo(chat_area);
                });
            }
        },
        complete: function () {
            chat_area.find(".loader").remove();
        }
    });
}
