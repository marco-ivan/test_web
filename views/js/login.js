const form = document.getElementById("form");

// form.addEventListener('submit', e => {
//     // Checking the value
//     checkUsername();
//     e.preventDefault();
// });

function checkUsername() {
    var username_input = $('#username_input').val();
    var usernameTaken = document.getElementById("usernameError");
    var username = document.getElementById("username");
    console.log("in here");
    if (username_input != "") {
        $.post('/login_username', { username: username_input },
            function (data) {
                console.log(data);
            });
    } else {
        if (usernameTaken != null) {
            usernameTaken.parentNode.removeChild(usernameTaken);
        }
    }
}
