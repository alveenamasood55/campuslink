
// Find the form and the area where requests will appear.

const helpForm = document.querySelector("#helpForm");

const requestList = document.querySelector("#requestList");

const formMessage = document.querySelector("#formMessage");


// Listen for someone submitting the form.

helpForm.addEventListener("submit", function(event) {

    // Stop the page from automatically refreshing.

    event.preventDefault();


    // Collect the information entered by the student.

    const studentName = document.querySelector("#studentName").value.trim();

    const subject = document.querySelector("#subject").value;

    const helpDetails = document.querySelector("#helpDetails").value.trim();


    // Check that the fields contain actual information.

    if (studentName === "" || subject === "" || helpDetails === "") {

        formMessage.textContent = "Please complete all fields.";

        return;
    }


    // Create a new request card.

    const card = document.createElement("article");

    card.className = "request-card";


    // Create the subject heading.

    const heading = document.createElement("h3");

    heading.textContent = subject + " - Help Needed";


    // Create the student's name.

    const name = document.createElement("p");

    name.textContent = "Posted by: " + studentName;


    // Create the request description.

    const details = document.createElement("p");

    details.textContent = helpDetails;


    // Put all the information inside the card.

    card.append(heading, name, details);


    // Display the newest request at the top.

    requestList.prepend(card);


    // Show a confirmation message.

    formMessage.textContent = "Your help request has been added!";


    // Clear the form after submission.

    helpForm.reset();

});
