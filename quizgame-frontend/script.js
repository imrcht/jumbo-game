const socket = io('http://localhost:8090', {
  auth: {
    token: localStorage.getItem('token'), // Retrieve the JWT token from localStorage
  },
}); // Connect to the backend

// Handle authentication errors
socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
  if (err.message === 'Authentication error') {
    alert('Authentication failed. Please log in again.');
  }
});

// Handle successful connection
socket.on('connect', () => {
  console.log('Connected to the server with socket ID:', socket.id);
});

let currentPlayerId = null;
let currentSessionId = null;
let currentQuestionId = null;

// DOM Elements
const authSection = document.getElementById('auth-section');
const gameSection = document.getElementById('game-section');
const gameStatus = document.getElementById('game-status');
const questionContainer = document.getElementById('question-container');
const answerContainer = document.getElementById('answer-container');
const answerInput = document.getElementById('answer-input');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const resultContainer = document.getElementById('result-container');

// Register User
document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:8090/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json();

  console.log(data);
  alert(data.message || 'Registration successful!');
});

// Login User
document.getElementById('login-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const response = await fetch('http://localhost:8090/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const { data } = await response.json();
  console.log(data);
  if (data.token) {
    // Store the token in localStorage
    localStorage.setItem('token', data.token);

    // Set the current player ID
    currentPlayerId = data._id;

    // Hide auth section and show game section
    authSection.style.display = 'none';
    gameSection.style.display = 'block';

    // Connect to the WebSocket server with the token
    socket.auth.token = data.token;
    socket.connect();

    socket.emit('join:game', currentPlayerId); // Join the game room

    // Start the game
    startGame();
  } else {
    alert('Login failed!');
  }
});

socket.on('disconnect', () => {
  console.log('Disconnected from the server. Reconnecting...');
  socket.auth.token = localStorage.getItem('token'); // Include the token in the reconnection attempt
  socket.connect();
});

// Start Game
// async function startGame() {
//   const response = await fetch('http://localhost:8090/v1/game/start', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       player1Id: currentPlayerId,
//     }),
//   });

//   const data = await response.json();
//   currentSessionId = data.sessionId;
//   gameStatus.textContent = 'Game started! Waiting for questions...';
// }

async function startGame() {
  const response = await fetch('http://localhost:8090/v1/game/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId: currentPlayerId, // Ensure correct field name
    }),
  });

  const data = await response.json();

  console.log('Game start response:', data);

  if (data.sessionId) {
    // If a session is created, store the session ID and update UI
    currentSessionId = data.sessionId;
    gameStatus.textContent = 'Game started! Waiting for questions...';

    // Join socket room for real-time updates
    socket.emit('join:game', currentPlayerId);
    socket.emit('question:request', {
      sessionId: currentSessionId,
      playerId: currentPlayerId,
    });
  } else {
    // If waiting for an opponent, update UI
    gameStatus.textContent = 'Waiting for an opponent...';
  }
}

// Handle Game Initialization
socket.on('game:init', (gameData) => {
  console.log('Game initialization data:', gameData);
  currentSessionId = gameData.sessionId;
  gameStatus.textContent = 'Game started! Get ready for the first question...';
  socket.emit('question:request', {
    sessionId: currentSessionId,
    playerId: currentPlayerId,
  });
});

// Handle Question Delivery
socket.on('question:send', (question) => {
  console.log('Question send response:', question);
  currentQuestionId = question.questionId;
  questionContainer.innerHTML = `
    <p><strong>Question:</strong> ${question.text}</p>
    <p><strong>Choices:</strong> ${question.choices.join(', ')}</p>
  `;
  answerContainer.style.display = 'block';
});

// Submit Answer
submitAnswerBtn.addEventListener('click', () => {
  const answer = answerInput.value;
  socket.emit('answer:submit', {
    sessionId: currentSessionId,
    playerId: currentPlayerId,
    questionId: currentQuestionId, // Replace with actual question ID
    answer,
  });
  answerInput.value = '';
});

// Handle Answer Result
socket.on('answer:result', (data) => {
  console.log('Answer result data:', data);
  resultContainer.textContent = `Your answer is ${data.result}!`;
});

// Handle Game End
socket.on('game:end', (data) => {
  console.log('Game end data:', data);
  const { scores, winner, isTie } = data;

  // Extract scores based on the new data structure
  const player1Score = scores[0]?.score || 0;
  const player2Score = scores[1]?.score || 0;
  const player1Id = scores[0]?.playerId || 'Unknown';
  const player2Id = scores[1]?.playerId || 'Unknown';

  resultContainer.innerHTML = `
      <p><strong>Scores:</strong> ${player1Id}: ${player1Score}, ${player2Id}: ${player2Score}</p>
      <p><strong>Winner:</strong> ${
        isTie ? "It's a tie!" : `Player ${winner}`
      }</p>
    `;

  answerContainer.style.display = 'none';
});
