const form = document.getElementById("form");
const checkUname = $('#username_input').val();
const checkMN = $('#mobile_number_input').val();
const checkEmail = $('#email_input').val();

form.addEventListener('submit', e => {
    // Checking the value
    if (!validateUsername()) {
        console.log("In validate username");
        e.preventDefault();
    }

    if (document.getElementById("usernameTaken")) {
        e.preventDefault();
    }

    if (!validatePassword()) {
        e.preventDefault();
    }

    if (!validateConfirmPassword()) {
        e.preventDefault();
    }

    if (!validateEmail()) {
        e.preventDefault();
    }

    if (document.getElementById("emailTaken")) {
        e.preventDefault();
    }

    if (document.getElementById("addressError")
        || document.getElementById("autocomplete").value == "") {
        console.log("In address Error");

        if (document.getElementById("addressError") == null) {
            var addr = document.getElementById("address");
            var createAddressError = document.createElement("P");
            createAddressError.setAttribute("id", "addressError");
            createAddressError.setAttribute("class", "error");
            createAddressError.innerText = "Invalid address!";
            addr.appendChild(createAddressError);

        }

        e.preventDefault();
    }

    if (document.getElementById("mobile_number_taken")) {
        e.preventDefault();
    }

    if (!validatePhoneNumber()) {
        e.preventDefault();
    }

});

function validateUniqueMobileNumber() {
    var mobile_number_input = $('#mobile_number_input').val();
    if (mobile_number_input !== checkMN) {
        var mobile_number_taken = document.getElementById("mobile_number_taken");
        var mobile_number = document.getElementById("mobile_number");
        if (mobile_number_input != "") {
            $.post('/check_mobile_number', { mobile_number: mobile_number_input },
                function (data) {
                    console.log(data);
                    if (data != "") {
                        if (mobile_number_taken == null) {
                            var create_mobile_number_taken = document.createElement("P");
                            create_mobile_number_taken.setAttribute("id", "mobile_number_taken");
                            create_mobile_number_taken.setAttribute("class", "error");
                            create_mobile_number_taken.innerText = data;
                            mobile_number.appendChild(create_mobile_number_taken);
                        }
                    } else {
                        if (mobile_number_taken != null) {
                            mobile_number_taken.parentNode.removeChild(mobile_number_taken);
                        }
                    }
                });
        } else {
            if (mobile_number_taken != null) {
                mobile_number_taken.parentNode.removeChild(mobile_number_taken);
            }
        }
    }
}

function validateUniqueEmail() {
    var email_input = $('#email_input').val();
    if (email_input !== checkEmail) {
        var emailTaken = document.getElementById("emailTaken");
        var email = document.getElementById("email");
        if (email_input != "") {
            $.post('/check_email', { email: email_input },
                function (data) {
                    console.log(data);
                    if (data != "") {
                        if (emailTaken == null) {
                            var createEmailTaken = document.createElement("P");
                            createEmailTaken.setAttribute("id", "emailTaken");
                            createEmailTaken.setAttribute("class", "error");
                            createEmailTaken.innerText = data;
                            email.appendChild(createEmailTaken);
                        }
                    } else {
                        if (emailTaken != null) {
                            emailTaken.parentNode.removeChild(emailTaken);
                        }
                    }
                });
        } else {
            if (emailTaken != null) {
                emailTaken.parentNode.removeChild(emailTaken);
            }
        }
    }
}

function validateUniqueUsername() {
    var username_input = $('#username_input').val();
    if (username_input !== checkUname) {
        var usernameTaken = document.getElementById("usernameTaken");
        var username = document.getElementById("username");
        if (username_input != "") {
            $.post('/check_username', { username: username_input },
                function (data) {
                    console.log(data);
                    if (data != "") {
                        if (usernameTaken == null) {
                            var createUsernameTaken = document.createElement("P");
                            createUsernameTaken.setAttribute("id", "usernameTaken");
                            createUsernameTaken.setAttribute("class", "error");
                            createUsernameTaken.innerText = data;
                            username.appendChild(createUsernameTaken);
                        }
                    } else {
                        if (usernameTaken != null) {
                            usernameTaken.parentNode.removeChild(usernameTaken);
                        }
                    }
                });
        } else {
            if (usernameTaken != null) {
                usernameTaken.parentNode.removeChild(usernameTaken);
            }
        }
    }
}

function validatePhoneNumber() {
    var mobileNumberRegex;
    var mobile_number = document.getElementById("mobile_number");
    var mobile_number_value = document.getElementById("mobile_number_input").value;
    var mobile_number_error = document.getElementById("mobile_number_error");

    if (mobile_number_value.startsWith("+")) {
        mobileNumberRegex = /\+65[6|8|9]\d{7}|\+65\s[6|8|9]\d{7}/g;
    } else {
        mobileNumberRegex = /[6|8|9]\d{7}/g;
    }
    var mobile_number_regex = document.getElementById("mobile_number_input").value.match(mobileNumberRegex);
    console.log(mobile_number_regex);

    if (mobile_number_regex == null) {
        if (mobile_number_error == null) {
            var create_mobile_number_error = document.createElement("P");
            create_mobile_number_error.setAttribute("id", "mobile_number_error");
            create_mobile_number_error.setAttribute("class", "error");
            create_mobile_number_error.innerText = "Invalid Singapore's phone number!";
            mobile_number.appendChild(create_mobile_number_error);
        }

        return false;
    }

    if (mobile_number_error != null) {
        mobile_number_error.parentNode.removeChild(mobile_number_error);
    }

    return true;
}

function validateEmail() {
    var emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var email = document.getElementById("email");
    var email_value = document.getElementById("email_input").value;
    var email_value_match = email_value.match(emailRegex);
    var emailError = document.getElementById("emailError");

    if (email_value_match == null) {
        if (emailError == null) {
            var createEmailError = document.createElement("P");
            createEmailError.setAttribute("id", "emailError");
            createEmailError.setAttribute("class", "error");
            createEmailError.innerText = "Invalid email address!";
            email.appendChild(createEmailError);
        }

        return false;
    }

    if (emailError != null) {
        emailError.parentNode.removeChild(emailError);
    }

    return true;
}

function validateConfirmPassword() {
    var confirm_password = document.getElementById("confirm_password");
    var confirm_password_value = document.getElementById("confirm_password_input").value;
    var password_value = document.getElementById("password_input").value;
    var confirm_password_error = document.getElementById("confirm_password_error");

    if (confirm_password_value != password_value) {
        if (confirm_password_error == null) {
            var createConfirmPasswordError = document.createElement("P");
            createConfirmPasswordError.setAttribute("id", "confirm_password_error");
            createConfirmPasswordError.setAttribute("class", "error");
            createConfirmPasswordError.innerText = "Password is not the same!";
            confirm_password.appendChild(createConfirmPasswordError);
        }

        return false;
    }

    if (confirm_password_error != null) {
        confirm_password_error.parentNode.removeChild(confirm_password_error);
    }

    return true;
}

function validateUsername() {
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var username = document.getElementById("username");
    var username_value = document.getElementById("username_input").value.match(usernameRegex);
    var usernameError = document.getElementById("usernameError");

    if (username_value == null) {
        if (usernameError == null) {
            var createUsernameError = document.createElement("P");
            createUsernameError.setAttribute("id", "usernameError");
            createUsernameError.setAttribute("class", "error");
            createUsernameError.innerText = "Invalid username! Please don't use any special characters!";
            username.appendChild(createUsernameError);
        }

        return false;
    }

    if (usernameError != null) {
        usernameError.parentNode.removeChild(usernameError);
    }

    return true;
}

function validatePassword() {
    var regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");

    var password = document.getElementById("password");
    var password_value = document.getElementById("password_input").value;
    var passwordError = document.getElementById("passwordError");

    if (regex.test(password_value)) {
        if ((passwordError != null)) {
            passwordError.parentNode.removeChild(passwordError);
        }

        return true;
    }

    if (passwordError == null) {
        var createPasswordError = document.createElement("P");
        createPasswordError.setAttribute("id", "passwordError");
        createPasswordError.setAttribute("class", "error");
        createPasswordError.innerText = "Invalid password! Password must be at least 8 characters, contains at least 1 uppercase letter, 1 undercase letter, and 1 number.";
        password.appendChild(createPasswordError);
    }

    return false;
}

// Checking the address
setInterval(function () {
    validateAddress();
}, 1000);


// Used for validating address
var valBefore = "";


function validateAddress() {
    var addr = document.getElementById("address");
    var addr_value = document.getElementById("autocomplete").value;
    if (addr_value != "" && addr_value != valBefore) {
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({
            'address': addr_value
        }, function (results, status) {
            var addressError = document.getElementById("addressError");
            if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                if (addressError != null) {
                    addressError.parentNode.removeChild(addressError);
                }

                //addr.value = results[0].formatted_address
            } else {
                if (addressError == null) {
                    var createAddressError = document.createElement("P");
                    createAddressError.setAttribute("id", "addressError");
                    createAddressError.setAttribute("class", "error");
                    createAddressError.innerText = "Invalid address!";
                    addr.appendChild(createAddressError);
                }
            }

        });

        valBefore = addr_value;
    }

};
