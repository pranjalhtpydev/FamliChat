// Import necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js';
import { getDatabase, ref, push, onChildAdded, remove } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-database.js';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.4.0/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
  // Your Firebase configuration details
  apiKey: "AIzaSyAdzwse7zkOmUVl8_Ptft_R_UXXUueIsXU",
  authDomain: "psdev-personal-use.firebaseapp.com",
  databaseURL: "https://psdev-personal-use-default-rtdb.firebaseio.com",
  projectId: "psdev-personal-use",
  storageBucket: "psdev-personal-use.appspot.com",
  messagingSenderId: "657435456987",
  appId: "1:657435456987:web:fdce69cde5f36de64f23fe",
  measurementId: "G-M7R6ZL6VJH"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);
const storage = getStorage(firebaseApp);

// DOM elements
const authContainer = document.querySelector('.auth-container');
const joinContainer = document.querySelector('.join-container');
const chatContainer = document.querySelector('.chat-container');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const joinCodeInput = document.getElementById('join-code-input');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');
const forgotPasswordButton = document.getElementById('forgot-password-button');
const joinButton = document.getElementById('join-button');
const logoutButton = document.getElementById('logout-button');
const clearChatButton = document.getElementById('clear-chat-button');
const usernameDisplay = document.getElementById('username-display');
const messageContainer = document.getElementById('message-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const authErrorMessage = document.getElementById('error-message');
const joinErrorMessage = document.getElementById('join-error-message');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress-bar');

// Set initial state
let currentUser = null;
const joinCode = '12'; // Set your desired join code here

// Function to handle user registration
async function handleSignup() {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    const username = email.split('@')[0];
    currentUser = { email, username };
    updateUI();
  } catch (error) {
    authErrorMessage.textContent = error.message;
  }
}

// Function to handle user login
async function handleLogin() {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    const username = email.split('@')[0];
    currentUser = { email, username };
    updateUI();
  } catch (error) {
    authErrorMessage.textContent = error.message;
  }
}

// Function to handle password reset
async function handleForgotPassword() {
  const email = emailInput.value;

  try {
    await sendPasswordResetEmail(auth, email);
    authErrorMessage.textContent = 'Password reset email sent. Check your inbox.';
  } catch (error) {
    authErrorMessage.textContent = error.message;
  }
}

// Function to handle user logout
async function handleLogout() {
  try {
    await signOut(auth);
    currentUser = null;
    updateUI();
  } catch (error) {
    authErrorMessage.textContent = error.message;
  }
}

// Function to handle join code validation
function handleJoin() {
  const enteredCode = joinCodeInput.value.trim();
  if (enteredCode === joinCode) {
    joinContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
  } else {
    joinErrorMessage.textContent = 'Incorrect join code. Please try again.';
  }
}

// Function to update the UI based on the current user state
function updateUI() {
  if (currentUser) {
    authContainer.classList.add('hidden');
    joinContainer.classList.remove('hidden');
    usernameDisplay.textContent = currentUser.username;
  } else {
    authContainer.classList.remove('hidden');
    joinContainer.classList.add('hidden');
    chatContainer.classList.add('hidden');
    usernameDisplay.textContent = '';
  }
}

// Listen for new messages in the database
onChildAdded(ref(database, 'messages'), (snapshot) => {
  const message = snapshot.val();
  appendMessage(message.sender, message.text, message.fileUrl);
});

// Function to send a message
function sendMessage() {
  const messageText = messageInput.value.trim();
  if (messageText !== '' && currentUser) {
    push(ref(database, 'messages'), {
      sender: currentUser.username,
      text: messageText,
      fileUrl: null
    });
    messageInput.value = '';
  }
}

// Function to append a message to the message container
function appendMessage(sender, text, fileUrl) {
  const messageElement = document.createElement('div');
  if (fileUrl) {
    const fileType = fileUrl.split('.').pop();
    if (fileType === 'jpg' || fileType === 'png' || fileType === 'gif' || fileType === 'jpeg') {
      messageElement.innerHTML = `<a href="${fileUrl}" target="_blank"><img src="${fileUrl}" alt="Shared image" class="shared-file"></a>`;
    } else if (fileType === 'mp4' || fileType === 'mov' || fileType === 'avi') {
      messageElement.innerHTML = `<a href="${fileUrl}" target="_blank"><video src="${fileUrl}" controls class="shared-file"></video></a>`;
    } else {
      messageElement.innerHTML = `<a href="${fileUrl}" target="_blank">${sender} shared a file</a>`;
    }
  } else {
    messageElement.textContent = `${sender}: ${text}`;
  }
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

// Function to clear the chat
function clearChat() {
  remove(ref(database, 'messages')).then(() => {
    messageContainer.innerHTML = '';
  }).catch((error) => {
    console.error('Error clearing chat:', error);
  });
}

// Event listeners
loginButton.addEventListener('click', handleLogin);
signupButton.addEventListener('click', handleSignup);
forgotPasswordButton.addEventListener('click', handleForgotPassword);
joinButton.addEventListener('click', handleJoin);
logoutButton.addEventListener('click', handleLogout);
clearChatButton.addEventListener('click', clearChat);
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});
