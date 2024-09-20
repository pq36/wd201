// Validate email on input
const email = document.getElementById('email');
email.addEventListener('input', () => validate(email));

const submit = document.getElementById('submit');
submit.addEventListener('click', (event) => {
    if (!email.checkValidity()) {
        event.preventDefault();  // Prevent form submission on invalid email
        validate(email);
    }
});

function validate(element) {
    if (element.validity.typeMismatch) {
        element.setCustomValidity("The Email is not in the right format!!");
        element.reportValidity();
    } else {
        element.setCustomValidity('');
    }
}

// Retrieve entries from localStorage
const retrieveEntries = () => {
    let entries = localStorage.getItem('user-entries');
    if (entries) {
        entries = JSON.parse(entries);
    } else {
        entries = [];
    }
    return entries;
}

// Get the current date
const dobInput = document.getElementById('dob');
const today = new Date();

// Calculate the minimum date (55 years ago from today)
const minDate = new Date(today.getFullYear() - 55, today.getMonth(), today.getDate());

// Calculate the maximum date (18 years ago from today)
const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());

// Set the min and max attributes for DOB
dobInput.setAttribute('min', minDate.toISOString().split('T')[0]);
dobInput.setAttribute('max', maxDate.toISOString().split('T')[0]);

let userForm = document.getElementById('registerForm');
let userEntries = retrieveEntries();

// Display entries in the "Entries" section
const displayEntries = () => {
    const entries = retrieveEntries();
    const tableEntries = entries.map((entry) => {
        const nameCell = `<td class='border px-4 py-2'>${entry.name}</td>`;
        const emailCell = `<td class='border px-4 py-2'>${entry.email}</td>`;
        const passwordCell = `<td class='border px-4 py-2'>${entry.password}</td>`;
        const dobCell = `<td class='border px-4 py-2'>${entry.dob}</td>`;
        const acceptTermsCell = `<td class='border px-4 py-2'>${entry.acceptTermsAndConditions}</td>`;
        const row = `<tr>${nameCell} ${emailCell} ${passwordCell} ${dobCell} ${acceptTermsCell}</tr>`;
        return row;
    }).join('\n');
    const table = `<table class="table-auto w-full">
        <tr>
            <th class="px-4 py-2">Name</th>
            <th class="px-4 py-2">Email</th>
            <th class="px-4 py-2">Password</th>
            <th class="px-4 py-2">Dob</th>
            <th class="px-4 py-2">Accepted terms?</th>
        </tr> ${tableEntries}</table>`;
    let details = document.getElementById("user-entries");
    details.innerHTML = table;
}

// Save user form data and update the display
const saveUserForm = (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const dob = document.getElementById("dob").value;
    const acceptTermsAndConditions = document.getElementById("acceptTerms").checked;

    const entry = {
        name, email, password, dob, acceptTermsAndConditions
    };

    // Push the new entry into the array and update localStorage
    userEntries.push(entry);
    localStorage.setItem("user-entries", JSON.stringify(userEntries));

    // Update the entries display
    displayEntries();

    // Optionally, reset the form after submission
    userForm.reset();
}

// Attach event listener to form submission
userForm.addEventListener('submit', saveUserForm);

// Display the entries on page load
displayEntries();