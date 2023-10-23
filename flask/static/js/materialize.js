//Materialize
$(document).ready(function () {
  $('.modal').modal({     // triggers signin/signup modal appearance when modal trigger is pressed
    onCloseEnd: function () {   // when modal is closed, clears all the form values and removes active class
      $("input").val("");
      $("input").removeClass('active');
      $("input").trigger('blur');
    },
  }
  );
  $('.collapsible').collapsible();    // triggers collapsibles
  $('select').formSelect();     // triggers select

  removeActiveClass()   // remove active classes from navbar

  // sets active class based on page title
  if ($('#page-title') == 'Home') {
    $('#home-link').addClass('active')
  } else if ($('#page-title') == 'About') {
    $('#about-link').addClass('active')
  } else if ($('#page-title') == 'FAQs') {
    $('#faqs-link').addClass('active')
  } else if ($('#page-title') == 'Stats') {
    $('#stats-link').addClass('active')
  }
});

// remove active classes from navbar
function removeActiveClass() {
  $('#home-link').removeClass('active')
  $('#about-link').removeClass('active')
  $('#faqs-link').removeClass('active')
  $('#stats-link').removeClass('active')
}

// verifies that there is an email in the text input for sign up
function emailVerification() {
  if ($('#email-sign-up').val() == "") {
    $('#sign-up-error').text("Please enter an email.")
  } else {
    $('#sign-up-error').text("")
  }
  signUpButton()
}

// verifies that there is a password in the text input for sign up 
function passwordVerification() {
  if ($('#password-sign-up').val() == "") {
    $('#sign-up-error').text("Please enter a password")
  } else if ($('#password-sign-up').val() != $('#password-confirm-sign-up').val()) {
    $('#sign-up-error').text("Password does not match")
  } else {
    $('#sign-up-error').text("")
  }
  signUpButton()
}

// based on whether there is an error or not, disables/enables sign up button
function signUpButton() {
  if ($('#sign-up-error').text() == "") {
    $('#sign-up-btn').removeClass("disabled")
  } else {
    $('#sign-up-btn').addClass("disabled")
  }
}

// verifies that there is a password text input for sign in
function signinPasswordVerification() {
  if ($('#password-sign-in').val() == "") {
    $('#sign-in-error').text("Please enter a password")
  } else {
    $('#sign-in-error').text("")
  }
  signInButton()
}

// verfies that there is an email in the text input for sign in
function signinEmailVerification() {
  if ($('#email-sign-in').val() == "") {
    $('#sign-in-error').text("Please enter an email")
  } else {
    $('#sign-in-error').text("")
  }
  signInButton()
}

// based on whether there is an error or not, disables/enables sign in button
function signInButton() {
  if ($('#sign-in-error').text() == "") {
    $('#sign-in-btn').removeClass("disabled")
  } else {
    $('#sign-in-btn').addClass("disabled")
  }
}

// clears all input text fields
function clearForms() {
  $("input[type=text], textarea").val("");
  //$("input[type=text], textarea").removeClass('active');
}