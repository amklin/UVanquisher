// import statements
import { initializeApp }
    from "https://www.gstatic.com/firebasejs/9.5.0/firebase-app.js";

import { getDatabase, ref, set, get, child, update, remove, onValue }
    from "https://www.gstatic.com/firebasejs/9.5.0/firebase-database.js";

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged }
    from "https://www.gstatic.com/firebasejs/9.5.0/firebase-auth.js";

import "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js" // chartJS, for making charts

// firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA1cpex5ClSuRCFVd_aNrPHtP0SzGXx2TU",
    authDomain: "uvanquisher.firebaseapp.com",
    databaseURL: "https://uvanquisher-default-rtdb.firebaseio.com",
    projectId: "uvanquisher",
    storageBucket: "uvanquisher.appspot.com",
    messagingSenderId: "462359954778",
    appId: "1:462359954778:web:08675ae8be8a0be4989f63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth();
const dbref = ref(db);

// dictionary of possible error messages
// they decide what will be displayed to the user
const possibleErrorMessages = {
    "auth/email-already-in-use": "Email already in use. Please use another email, or sign in instead.",
    "auth/user-not-found": "User not found. Try signing up instead.",
    "auth/invalid-email": "Invalid email. Please use another email.",
    "auth/missing-email": "Please enter an email.",
    "auth/internal-error": "There was an error. Please check your email and password and try again.",
    "auth/weak-password": "Password should be at least 6 characters long. Please use a stronger password.",
    "auth/wrong-password": "Wrong password. Please try again.",
}

// store uid
let uid = null

// ip addresses, for easy updating when testing
let ip_address = "127.0.0.1"        // local host
//let ip_address = "10.0.0.27"
//let ip_address = "192.168.73.84"

//  *** AUTHENTICATION ***

// sign up
$('#sign-up-btn').click(function () {
    // fetch values for email and password
    var email = $('#email-sign-up').val();
    var password = $('#password-sign-up').val();
    //console.log(email);
    //console.log(password);

    // create user
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            //console.log("signed up:", user)

            // close sign up modal
            document.getElementById("sign-up-cancel").click()
        })
        .catch((error) => {
            // error with signing in

            const errorCode = error.code;

            //  displayes error message to the user
            const errorMessage = possibleErrorMessages[errorCode];
            document.getElementById("sign-up-error").innerText = errorMessage
            //console.log(error)
            //console.log(error.code)
        });
});

// sign in
$('#sign-in-btn').click(function () {
    // fetch values for email and password
    var email = $('#email-sign-in').val();
    var password = $('#password-sign-in').val();

    //console.log(email);
    //console.log(password);

    // sign in
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            //console.log("signed in:",user)

            // close sign in modal
            document.getElementById("sign-in-cancel").click()

        })
        .catch((error) => {
            // error while signing in 
            const errorCode = error.code;

            //  displayes error message to the user
            const errorMessage = possibleErrorMessages[errorCode];
            document.getElementById("sign-in-error").innerText = errorMessage
            //console.log (error)
        });
});

// sign out
$('#sign-out-btn').click(function () {
    signOut(auth)
        .then(() => {
            //console.log("signed out")
        })
        .catch((error) => {
            //console.log(error.message)
        })
})

// function that fires whenever user signs in, signs up, or signs out (basically on state change)
onAuthStateChanged(auth, (user) => {
    //console.log('status changed:', user)

    // when the user is signed in
    if (user != null) {
        const user_email = user.email

        // sets uid
        uid = user.uid

        try {
            //displays welcome message
            document.getElementById("welcome-message").innerText = "Welcome, " + user_email + "!"
        } finally {
            //console.log(document.getElementById("dropdown-menu"))
            // hides sign in/up buttons, shows sign out button and data selection button
            document.getElementById("sign-in").style.display = "none";
            document.getElementById("sign-up").style.display = "none";
            document.getElementById("data-btn-div").style.display = "block";
            document.getElementById("uv-index-msg-div").style.display = "block";
            document.getElementById("sign-out-btn").style.display = "block";

            // refreshes dropdown options
            dropdown()
            //alert_user()
            //console.log(uid)
        }
        
        // sends message to flask server with uid
        $.post("http://" + ip_address + ":5000/user_info", { "uid": uid })
            .then(() => {
                //console.log("success: " + uid)
            })
    } else {    // when the user is signed out
        // resets uid
        uid = null

        try {
            // resets welcome message
            document.getElementById("welcome-message").innerText = "Sorry, this page can only be accessed by signed-in users. Please sign in or create an account."
            
            // hides elements that are only shown to signed in users
            document.getElementById("dropdown-menu").style.display = "none";
            document.getElementById("graph-card").style.display = "none";
            document.getElementById("sum-graph-card").style.display = "none";
            document.getElementById("data-btn-div").style.display = "none";
            document.getElementById("uv-index-msg-div").style.display = "none";
        } finally {
            // shows sign in/up button, hides sign out buttons
            document.getElementById("sign-in").style.display = "block";
            document.getElementById("sign-up").style.display = "block";
            document.getElementById("sign-out-btn").style.display = "none";
        }
        
    
        // sends message to flask server that the user has signed out
        $.post("http://" + ip_address + ":5000/user_info", { "uid": null })
            .then(() => {
                //console.log("success: " + uid)
            })
    }
})
/*
$('#arrow').click(function(){
    $('.login-btns').css("display","block");
})
*/

// *** USER INTERACTION/GRAPHS (STATS PAGE) ***

// displays an alert in the form of a materialize toast
// the default message + the announcement sound (female robot voice reading message) go together
function alert_user(message = "Hi, you have reached your maximum daily UV light intake. We advise that you head indoors at this time in order to protect your skin from potential burning and further harm.") {
    M.toast({
        html: message,
        displayLength: 360000,
        classes: 'toast'
    })
    // note: sound is only allowed to autoplay once user has interacted with webpage
    // plays sound if message is the default message
    if (message == "Hi, you have reached your maximum daily UV light intake. We advise that you head indoors at this time in order to protect your skin from potential burning and further harm.") {
        let snd = document.getElementById('alert_audio');
        snd.play();
    }
}

// refresh dropdown options when the refresh dataset button is clicked
$('#refresh-dataset-btn').click(function () {
    dropdown()
})

// refreshes dropdown menu
function dropdown() {
    // shows menu
    document.getElementById("dropdown-menu").style.display = "block";

    // list of dataset options
    const data_options = []

    // snapshot of the database for the user's uid
    get(child(dbref, uid)).then((snapshot) => {
        if (snapshot.exists()) {
            //console.log(snapshot.val())

            // loops through key, value pairs for each object in snapshot
            Object.entries(snapshot.val()).forEach(([key, value]) => {
                //console.log(key, value);

                // adds the key to the list of data options
                data_options.push(key)
            });
            //console.log(data_options)

            /* HTML code for a dropdown
              <option value="" disabled selected>Choose your dataset:</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
              <option value="3">Option 3</option>
            */

            // gets select field from html
            let select_field = document.getElementById("dataset-options")

            // removes all select field options except the first
            while (select_field.options.length > 1) {
                select_field.remove(1)
            }

            //console.log(select_field)

            // adds dataset options to select field
            for (let i = 0; i < data_options.length; i++) {
                select_field.add(new Option(data_options[i], data_options[i]));
                //console.log(data_options[i])
            }
            // reruns materialize code
            $('select').formSelect();
        } else {
            console.log("sorry, no data found")
        }
    })
        .catch((error) => {
            // if there was an error
            console.log('unsuccessful, error' + error);
        })
}

// when user clicks on a dataset option
$('#dataset-options').change(function () {

    // shows the two graphs
    document.getElementById("graph-card").style.display = "block";
    document.getElementById("sum-graph-card").style.display = "block";

    // retrieves user selected value from dropdown
    let data_selected = document.getElementById("dataset-options").value;
    //let data_selected = "02-05-2022 18:17:20"
    //console.log(data_selected);

    // creates a path from uid and user selected value
    let path = uid + "/" + data_selected;
    //let path = "02-05-2022 18:17:20"
    //console.log(path)

    // gets a snapshot
    get(child(dbref, path)).then((snapshot) => {
        if (snapshot.exists()) {
            // creates a graph from the snapshotted data
            let dataset = snapshot.val()
            let graph_data = graphData(data_selected, dataset)
            createGraph(graph_data[0], graph_data[1], graph_data[2])
        }
        else {
            // if snapshot does not exist
            console.log('No data found');
        }

    })
        .catch((error) => {
            // if there is an error
            console.log('unsuccessful, error' + error);
        });
});


// keeps track of whether or not the user has been alerted about too much sun
var alerted_user = false;

// data_selected is the user selected dataset (what they chose from the dropdown)
// snapshot is the snapshot.val() of the data that the user selected that will be displayed on the graph
// current_data is a boolean that shows whether or not the data that is being displayed is the data that is currently
// being added to the firebase database (i.e. if it's "live" data)
function graphData(data_selected, snapshot, current_data = false) {
    // lists that store the list of labels and data values
    let labels = []
    let data = []
    let data_sum = []
    let sum = 0
    //console.log(current_data)
    $('#uv-index-message').html("No live data available")

    // iterates through data in snapshot
    for (let i = 0; i < snapshot.length; i++) {

        // the current value
        let current = snapshot[i]

        // if the current value is a number
        if (parseFloat(current) != NaN && current != undefined) {
            //console.log(current, parseInt(current))

            // add the current total to the running sum
            sum += parseFloat(current)

            // add the current number to the data values
            data.push(parseFloat(current))
        } else {
            // add 0 to the data values
            data.push(0)
        }

        // add the time labels to the labels
        labels.push(time_labels(data_selected, i))
        //console.log(snapshot.val()[i], parseInt(snapshot.val()[i]))

        // add the sum to the data values of cumulative UV exposure
        data_sum.push(sum)
    }

    // if the data being displayed is "live" data
    if (current_data == true) {
        let current_uv = parseFloat(snapshot[snapshot.length - 1]);
        let text = ""
        if (current_uv != NaN) {
            text = "The sunlight you are currently being exposed to is at a UV index of " + current_uv;
            if (current_uv < 3) {
                text += ". It is very safe to remain outside in these conditions, and precautions are not required.";
            } else if (current_uv < 6) {
                text += ". It is relatively safe to remain outside in these conditions, but minimal precautions should be taken. We recommend that you apply sunscreen of at least <span class='orange-highlight'>SPF 15</span> and consider wearing a <span class='blue-highlight'>hat and/or sunglasses</span>."
            } else if (current_uv < 8) {
                text += ". It is not safe to remain outside in these conditions without adequate protection. We recommend that you apply sunscreen of at least <span class='orange-highlight'>SPF 30</span> and <span class='blue-highlight'>wear a hat and sunglasses</span>."
            } else if (current_uv < 11) {
                text += ". It is incredibly dangerous to stay outside even with protection. Time under the sun should be avoided if possible. If it is necessary to remain outside, we recommend <span class='blue-highlight'>covering up as much skin as possible with clothing, wearing a hat and sunglasses</span>, and applying sunscreen of at least <span class='orange-highlight'>SPF 50</span>."
            } else {
                text += ". It is <span class='orange-highlight'>incredibly dangerous to stay outside</span> even with protection. Time under the sun should be avoided if possible. If it is necessary to remain outside, we recommend <span class='blue-highlight'>covering up as much skin as possible with clothing and wearing a hat and sunglasses</span>. Sunscreen of at least <span class='orange-highlight'>SPF 50</span> should be used and reapplied as the skin feels dry or irritated."
            }
        } else {
            text = "No live data available"
        }

        $('#uv-index-message').html(text)

        if (alerted_user == false && sum > 9000) { // seconds * uv_index
            alert_user();
            alerted_user = true
        }
    }

    //console.log(snapshot.val());
    //console.log(labels)
    //console.log(data)
    //console.log(data_sum)
    //console.log(snapshot.val()[1]);

    return [labels, data, data_sum]
}

// variables for graphs
var statsGraph, statsSumGraph;

// creates the graphs (2 graphs - one displaying current UV amount; the other displaying the cumulative UV amount for that dataset)
function createGraph(labels, data, data_sum) {

    // if there are graphs that have been previously created, destroy them
    if (statsGraph) {
        statsGraph.destroy();
        statsSumGraph.destroy();
    }

    //console.log("Create graph", data_selected,snapshot)

    // creates the graph for current UV exposure using Charts JS
    statsGraph = new Chart("statsGraph", {
        type: "line",
        data: {
            labels: labels,     // time labels
            datasets: [{
                label: "UV Exposure",
                data: data,     // uv index data
                borderColor: "rgba(0, 143, 143,1)",     // same color as blue-4 on css
                pointRadius: 0,
                fill: false,
            }]
        },
        options: {
            title : {       // title of graph
                display: true,
                text: "UV Exposure"
            },
            scales: {
                xAxes: [{
                    ticks: {        // only 20 x-axis labels (time)
                        maxTicksLimit: 20
                    },
                    scaleLabel: {   // x-axis label
                        display: true,
                        labelString: 'Time',
                    }
                }],
                yAxes: [{
                    scaleLabel: {       //y axis label
                        display: true,
                        labelString: 'UV Index',
                    }
                }]
            },
            animation: {            // doesn't animate the graph each time it is created
                duration: 0,
            }
        }
    })

    // creates the graph for cumulative UV exposure using Charts JS
    statsSumGraph = new Chart("statsSumGraph", {
        type: "line",
        data: {
            labels: labels,         // time labels
            datasets: [{
                label: "Cumulative UV Exposure",
                data: data_sum,     // cumulative uv index data
                borderColor: "rgba(0, 143, 143,1)",     // same as css blue-4
                pointRadius: 0,
                fill: false,
            }]
        },
        options: {
            title : {           // chart title
                display: true,
                text: "Cumulative UV Exposure"
            },
            scales: {
                xAxes: [{
                    ticks: {
                        maxTicksLimit: 20
                    },
                    scaleLabel: {       // x-axis label
                        display: true,
                        labelString: 'Time',
                    }
                }],
                yAxes: [{
                    scaleLabel: {           // y-axis label
                        display: true,
                        labelString: 'UV Index',
                    }
                }]
            },
            animation: {            // doesn't animate each time
                duration: 0,
            }
        }
    })
}

//when the page first loads, the onValue function fires, no matter status of actual data/database
// the counter makes sure that the actual functions don't run until after the page loads
// i.e. it ignores the first time the onValue() function fires
let counter = 0;

// fires when the database changes
onValue(ref(db), (snapshot) => {
    //console.log("change")

    // if user is logged in 
    if (counter > 0 && uid != null) {

        //dropdown()

        // today's date
        let full_date = get_full_date()

        let data_selected = document.getElementById("dataset-options").value;

        // if data has been selected
        if (data_selected != "none") {

            let dataset = snapshot.val()[uid][data_selected]

            //console.log(data_selected)
            //console.log(dataset)

            // if selected date is equal to today's date (i.e. live data)
            //console.log(data_selected.slice(0,10))
            if (data_selected.slice(0, 10) == full_date) {
                let graph_data = graphData(data_selected, dataset, true)
                createGraph(graph_data[0], graph_data[1], graph_data[2])
            } else {
                let graph_data = graphData(data_selected, dataset)
                createGraph(graph_data[0], graph_data[1], graph_data[2])
            }

        } else {
            // no data has been selected but there is still live data from today

            data_selected = "00-00-0000 00:00:00"
            let dataset = []

            Object.entries(snapshot.val()[uid]).forEach(([key, value]) => {
                //console.log(key, value);
                if (key.slice(0, 10) == full_date) {
                    for (let i = 0; i < value.length; i++) {
                        dataset.push(value[i])
                    }
                }
            });

            graphData(data_selected, dataset, true)
        }
    } else {
        counter += 1;
    }
})

// returns the date in dd-mm-yyyy format
function get_full_date() {
    let datetime = new Date()
    // getMonth() returns int 0-11
    let date = String(datetime.getDate())
    if (date.length < 2) {
        date = "0" + date
    }
    let month = String(datetime.getMonth() + 1)
    if (month.length < 2) {
        month = "0" + month
    }
    let year = String(datetime.getFullYear())
    //console.log(datetime)
    //console.log(date + "-" + month + "-" + year)
    return date + "-" + month + "-" + year
}

// creates the labels for the time
// based on start time (hh:mm:ss) and amount of time (in seconds) that has passed
// returns a time label (hh:mm:ss)
function time_labels(start_time, elapsed_time) {

    // slice start time string
    let hour = parseInt(start_time.slice(11, 13))
    let minute = parseInt(start_time.slice(14, 16))
    let second = parseInt(start_time.slice(17))

    // add time for each second that has passed
    for (let j = 0; j < elapsed_time; j++) {
        second++

        // 60 seconds = 1 minute
        if (second === 60) {
            second = 0
            minute++

            // 60 minutes = 1 hour
            if (minute === 60) {
                minute = 0
                hour++
            }
        }
    }

    let time_string = ""

    // if hour is only a single digit
    if (hour < 10) {
        time_string += "0"
    }

    time_string += hour

    // if minute is only a single digit
    if (minute < 10) {
        time_string += ":0"
    } else {
        time_string += ":"
    }

    time_string += minute

    // if second is only a single digit
    if (second < 10) {
        time_string += ":0"
    } else {
        time_string += ":"
    }
    time_string += second

    return time_string
}

let collecting_data = false

// when the data collection button is clicked, starts/stops collecting data
// changes button text
// sends this change to flask server
$('#data-collection-btn').click(function () {
    //console.log("clicked")
    //console.log($('#data-collection-btn').text())
    if ($('#data-collection-btn').text() == "Start Data Collection") {
        $.post("http://" + ip_address + ":5000/data_collection", { "collecting_data": "true" })
            .then(() => {
                //console.log("success: data true")
                $('#data-collection-btn').text("Stop Data Collection")
            })

    } else if ($('#data-collection-btn').text() == "Stop Data Collection") {
        $.post("http://" + ip_address + ":5000/data_collection", { "collecting_data": "false" })
            .then(() => {
                //console.log("success: data false")
                $('#data-collection-btn').text("Start Data Collection")
            })
    }
})
