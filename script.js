import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { API_URL, EMAIL_KEY, KEY } from "./config.js";

import { emailjs } from "./email.min.js";


// const switchers = [...document.querySelectorAll(".switcher")];

// switchers?.forEach((item) => {
//   item.addEventListener("click", function () {
//     switchers.forEach((item) =>
//       item.parentElement.classList.remove("is-active")
//     );
//     this.parentElement.classList.add("is-active");
//   });
// });

// let email, mobileNo, adhaarNo;

// Initialize Supabase client
const supabase = createClient(API_URL, KEY);

// const form = document.getElementById("signupForm");

// form?.addEventListener("submit", (event) => {
//   event.preventDefault(); // Prevent default form submission

//   // Collect form data
//   email = document.getElementById("signup-email").value;
//   mobileNo = document.getElementById("mobile-no").value;
//   adhaarNo = document.getElementById("adhaar-no").value;

//   // Validate form data
//   if (!validateEmail(email)) {
//     alert("Please enter a valid email address");
//     return;
//   }
//   if (!validateMobileNo(mobileNo)) {
//     alert("Please enter a valid mobile number");
//     return;
//   }
//   if (!validateAdhaarNo(adhaarNo)) {
//     alert("Please enter a valid Aadhaar number");
//     return;
//   }

//   sessionStorage.emailID = email;
//   sessionStorage.mobileNo = mobileNo;
//   sessionStorage.adhaarNo = adhaarNo;
//   // If all data is valid, proceed to the registration page
//   window.location.href = "registrationpage.html"; // Redirect to registration page
// });

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobileNo(mobileNo) {
  return /^[0-9]{10}$/.test(mobileNo);
}

function validateAdhaarNo(adhaarNo) {
  return /^[0-9]{12}$/.test(adhaarNo);
}

const form_registration_submit = document.getElementById(
  "form-registration-submit"
);

form_registration_submit?.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Collect form data
  const email = document.getElementById("signup-email").value;
  const mobileNo = document.getElementById("mobile-no").value;
  const adhaarNo = document.getElementById("adhaar-no").value;

  // Validate form data
  if (!validateEmail(email)) {
    alert("Please enter a valid email address");
    return;
  }
  if (!validateMobileNo(mobileNo)) {
    alert("Please enter a valid mobile number");
    return;
  }
  if (!validateAdhaarNo(adhaarNo)) {
    alert("Please enter a valid Aadhaar number");
    return;
  }
  // const email = sessionStorage.emailID;
  // const mobileNo = sessionStorage.mobileNo;
  // const adhaarNo = sessionStorage.adhaarNo;
  // Collect form data
  const voterID = document.getElementById("voter-ID").value;
  const userName = document.getElementById("user-name").value;
  const userAge = document.getElementById("user-age").value;
  const userGender = document.getElementById("gender").value;
  const address = document.getElementById("address").value;
  const district = document.getElementById("district").value;
  const state = document.getElementById("state").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-password-confirm"
  ).value;

  // Check if passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  if(!(userAge>=18)){
    alert("Your Age is lesser than 18, Register once your age is equal to or greater than 18 years");
    return;
  }

  // Validate form data if necessary

  try {
    const { data, error } = await supabase
      .from("UserData")
      .insert([
        {
          email_id: email,
          mobile_no: mobileNo,
          adhaar_no: adhaarNo,
          voter_id: voterID,
          user_name: userName,
          user_age: userAge,
          user_gender: userGender,
          address: address,
          district: district,
          state: state,
          password: password,
        },
      ])
      .select();

    if (error) {
      if (error.message.toString().startsWith("duplicate")) {
        alert("Already Registered");
        console.error(error);
        window.location.href = "index.html";
        return;
      } else {
        alert("Error fetching user data from Supabase");
        console.error(error);
        return;
      }
    } else {
      alert("User data updated successfully");
      // Redirect to success page or perform any other action
      window.location.href = "index.html";
    }
  } catch (error) {
    alert("Try Again");
    console.error(error);
  }
});

const loginForm = document.getElementById("login-form");

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission

  // Collect form data
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    // Check if the email exists in the database
    const { data: userData, error: userError } = await supabase
      .from("UserData")
      .select("*")
      .eq("email_id", email)
      .single();

    if (!userData) {
      // If no user found with this email
      alert("Invalid User, Please register by clicking New User");
      return;
    }

    // Compare the password with the one stored in the database
    if (userData.password !== password) {
      // If password doesn't match
      alert("Invalid  password");
      return;
    }

    const userDistrict = userData.district;
    const userState = userData.state;
    const userID = userData.id;

    sessionStorage.userDistrict = userDistrict;
    sessionStorage.userState = userState;
    sessionStorage.userID = userID;

    // Authentication successful
    alert("Login successful!");
    // Redirect to voter page or perform any other action
    window.location.href = "voterpage.html";
  } catch (error) {
    alert("An error occurred while processing the login");
    console.error(error);
  }
});

// Function to fetch and display candidate data
async function displayCandidates(userDistrict, userState) {
  try {
    const { data: candidates, error } = await supabase
      .from("ElectrolCandidates")
      .select("*")
      .order("id");

    if (error) {
      throw error;
    }

    if (!candidates || candidates.length === 0) {
      // Handle case where no candidates are found
      console.log("No candidates found");
      return;
    }

    const candidatesContainer = document.getElementById("candidates-container");

    // Clear previous content if any
    candidatesContainer.innerHTML = "";

    // Filter candidates based on user's district and state
    const filteredCandidates = candidates.filter((candidate) => {
      return (
        candidate.district.toLowerCase() === userDistrict &&
        candidate.state.toLowerCase() === userState
      );
    });

    // Iterate through candidates and display information
    filteredCandidates.forEach((candidate, index) => {
      const candidateDiv = document.createElement("div");
      candidateDiv.classList.add("voters-card");

      // Display candidate information
      candidateDiv.innerHTML = `<div class="voters-info">
      <div>
      <img src="${candidate.avatar}" alt="${candidate.candidate_name}" class="avatar" />
      </div>
      <div class="voter-details">
      <p>Name: <span class="non-bold">${candidate.candidate_name}</span></p>
      <p>Party: <span class="non-bold">${candidate.party_name}</span></p>
      <p>District: <span class="non-bold">${candidate.district}</span></p>
      <p>State: <span class="non-bold">${candidate.state}</span></p>
      </div>
      </div>
          <input type="radio" name="candidate" value="${candidate.id}" id="candidate-${index}">
      </div>`;

      candidatesContainer.appendChild(candidateDiv);
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
  }
}

// Function to handle vote submission
async function submitVote(userID) {
  const selectedCandidateId = document.querySelector(
    'input[name="candidate"]:checked'
  );

  if (!selectedCandidateId) {
    alert("Please select a candidate to vote");
    return;
  }

  const candidateId = selectedCandidateId.value;

  // Process vote submission, you can implement this logic based on your requirements
  console.log("Voting for candidate with ID:", candidateId);
  console.log("User ID:", userID);

  try {
    // Fetch user data from UserData table
    const { data: userData, error: userError } = await supabase
      .from("UserData")
      .select("*")
      .eq("id", userID) // Assuming userId is the ID of the user
      .single();

    if (userError) {
      throw userError;
    }

    if (!userData) {
      alert("User not found");
      return;
    }

    // Fetch candidate data from ElectrolCandidates table
    const { data: candidateData, error: candidateError } = await supabase
      .from("ElectrolCandidates")
      .select("*")
      .eq("id", candidateId)
      .single(); // Assuming candidateId is the ID of the candidate

    if (candidateError) {
      throw candidateError;
    }

    if (!candidateData || candidateData.length === 0) {
      alert("Candidate not found");
      return;
    }

    // Save vote data to Votes table
    const { error: voteError } = await supabase.from("Votes").insert([
      {
        user_id: userData.id,
        user_email_id: userData.email_id,
        user_mobile_no: userData.mobile_no,
        user_adhaar_no: userData.adhaar_no,
        user_name: userData.user_name,
        user_age: userData.user_age,
        user_gender: userData.user_gender,
        user_voter_id: userData.voter_id,
        user_address: userData.address,
        user_district: userData.district,
        user_state: userData.state,

        candidate_id: candidateData.id,
        candidate_avatar: candidateData.avatar,
        candidate_name: candidateData.candidate_name,
        candidate_party_name: candidateData.party_name,
        candidate_district: candidateData.district,
        candidate_state: candidateData.state,

        // Add other necessary fields here
      },
    ]);

    if (voteError) {      
      throw voteError;
    }
    

    // If everything is successful
    alert("Vote saved successfully");
    emailjs.init(EMAIL_KEY); 
    emailjs.send("service_nrmcgha","template_zjj5jzk",{
      to_name: userData.user_name,
      from_name: "Election Commission",
      message: "Your vote successfully submitted to " + candidateData.candidate_name,
      to_email: userData.email_id,
      });
    // window.location.href = "index.html";
  } catch (error) {
    if(error.message.toString().startsWith("duplicate")){
      alert("Already Submitted your vote");
    }else{
      alert("An error occurred. Please try again.");
      
    }
  }
}

const candidatesContainer = document.getElementById("candidates-container");
let userDistrict = sessionStorage.userDistrict;
let userState = sessionStorage.userState;
let userID = sessionStorage.userID;

if (candidatesContainer) {
  displayCandidates(userDistrict, userState);
}

const voteSubmitValue = document.getElementById("vote-submit");

voteSubmitValue?.addEventListener("submit", async (event) => {
  event.preventDefault(); // Prevent default form submission
  submitVote(userID);
});

const logOutElement = document.getElementById("log-out-button-id");

logOutElement?.addEventListener("click", function () {
  window.location.href = "index.html";
});

const dashboardElement = document.getElementById("dashboard");
dashboardElement?.addEventListener("click", function () {
  window.location.href = "dashboardpage.html";
});

// Function to fetch and display all candidate data
async function displayAllCandidates() {
  try {
    const { data: candidates, error } = await supabase
      .from("ElectrolCandidates")
      .select("*")
      .order("id");

    if (error) {
      throw error;
    }

    if (!candidates || candidates.length === 0) {
      // Handle case where no candidates are found
      console.log("No candidates found");
      return;
    }

    const candidatesContainer = document.getElementById("candidates-container-dashboard");

    // Clear previous content if any
    candidatesContainer.innerHTML = "";

    // // Filter candidates based on user's district and state
    // const filteredCandidates = candidates.filter((candidate) => {
    //   return (
    //     candidate.district.toLowerCase() === userDistrict &&
    //     candidate.state.toLowerCase() === userState
    //   );
    // });

    // Iterate through candidates and display information
    candidates.forEach((candidate, index) => {
      const candidateDiv = document.createElement("div");
      candidateDiv.classList.add("voters-card");

      // Display candidate information
      candidateDiv.innerHTML = `<div class="voters-info">
      <div>
      <img src="${candidate.avatar}" alt="${candidate.candidate_name}" class="avatar" />
      </div>
      <div class="voter-details">
      <p>Name: <span class="non-bold">${candidate.candidate_name}</span></p>
      <p>Party: <span class="non-bold">${candidate.party_name}</span></p>
      <p>District: <span class="non-bold">${candidate.district}</span></p>
      <p>State: <span class="non-bold">${candidate.state}</span></p>
      </div>
      </div>
          <input type="radio" name="candidate" value="${candidate.id}" id="candidate-${index}">
      </div>`;

      candidatesContainer.appendChild(candidateDiv);
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
  }
}
const candidatesContainerDashboard= document.getElementById("candidates-container-dashboard");

if (candidatesContainerDashboard) {
  displayAllCandidates();
}
