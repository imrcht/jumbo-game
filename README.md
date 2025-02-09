# Real-Time Quiz Game

A real-time quiz game where two players compete against each other by answering a series of questions. The game is built using **Node.js** for the backend, **MongoDB** for the database, and **WebSockets** for real-time communication. Players are authenticated using **JWT (JSON Web Tokens)**, and the game handles **question delivery, answer validation, scoring, and result calculation in real-time**.

## Features

### User Authentication:
- Register and log in using **JWT** for secure authentication.
- Passwords are securely hashed before storing in the database.

### Game Session Setup:
- Start a new game session and match two players.
- Notify both players when the game starts using **WebSockets**.

### Real-Time Question Delivery:
- Players receive questions one at a time in real-time.
- Questions are fetched from a pre-stored set in the database.

### Answer Submission and Scoring:
- Players submit their answers via **WebSocket**.
- Answers are validated, and scores are updated in real-time.

### Result Calculation:
- After both players answer all questions, the final scores are calculated.
- The winner is determined, and results are sent to both players.

### Database Storage:
- Game session results are stored in **MongoDB** for future reference.

## Technologies Used
- **Backend:** Node.js
- **Database:** MongoDB
- **Real-Time Communication:** WebSockets (Socket.IO)
- **Authentication:** JWT (JSON Web Tokens)
- **Frontend:** HTML, CSS, JavaScript (Minimalistic frontend for demonstration)

---

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running locally or remotely)
- Git

### Steps

## Steps

### Clone the Repository:

```bash
git clone https://github.com/your-username/real-time-quiz-game.git
cd real-time-quiz-game
```

### Install Dependencies:

```bash
npm install
```

### Set Up Environment Variables:
Create a `.env` file in the root directory and add the following:

```
PORT=8090
MONGODB_URI=mongodb://localhost:27017/quizgame
JWT_SECRET=your_jwt_secret_key
SALT_ROUND=80
```

### Run the Backend Server:

```bash
npm start
```

### Set Up the Frontend:

- Open the `index.html` file in your browser.
- Use the frontend to register, log in, and play the game.

## API Endpoints

### Authentication

#### `POST /auth/register`: Register a new user.

```json
{
  "username": "player1",
  "password": "password123"
}
```

#### `POST /auth/login`: Log in an existing user.

```json
{
  "username": "player1",
  "password": "password123"
}
```

### Game

#### `POST /game/start`: Start a new game session.

```json
{
  "player1Id": "player1_id",
  "player2Id": "player2_id"
}
```

## WebSocket Events

### Emitted by the Client

#### `join:game`: Join the game room.

```json
{
  "playerId": "player1_id"
}
```

#### `question:request`: Request the next question.

```json
{
  "sessionId": "game_session_id",
  "playerId": "player1_id"
}
```

#### `answer:submit`: Submit an answer.

```json
{
  "sessionId": "game_session_id",
  "playerId": "player1_id",
  "questionId": "question_id",
  "answer": "Paris"
}
```

### Emitted by the Server

#### `game:init`: Notify players that the game has started.

```json
{
  "sessionId": "game_session_id",
  "questions": [
    {
      "text": "What is the capital of France?",
      "choices": ["Paris", "London", "Berlin", "Madrid"]
    }
  ]
}
```

#### `question:send`: Send the next question to the player.

```json
{
  "questionId": "question_id",
  "text": "What is the capital of France?",
  "choices": ["Paris", "London", "Berlin", "Madrid"]
}
```

#### `answer:result`: Notify the player if their answer was correct or incorrect.

```json
{
  "result": "correct"
}
```

#### `game:end`: Notify players of the final results.

```json
{
  "scores": {
    "player1_id": 3,
    "player2_id": 2
  },
  "winner": "player1_id",
  "isTie": false
}
```

## Database Schema

### User

```javascript
{
  username: String,
  password: String
}
```

### Question

```javascript
{
  text: String,
  choices: [String],
  correctAnswer: String
}
```

### GameSession

```javascript
{
  players: [ObjectId], // References to User documents
  questions: [ObjectId], // References to Question documents
  scores: Map, // Key: playerId, Value: score
  currentQuestionIndex: Map, // Key: playerId, Value: current question index
  playersAnsweredFinalQuestion: Number, // Count of players who answered the 4th question
  winner: ObjectId, // Reference to the winning User document
  status: String // "waiting", "in-progress", "completed"
}
```

## Sample Questions

The following questions are pre-stored in the database:

**Question:** What is the capital of France?

- **Choices:** `["Paris", "London", "Berlin", "Madrid"]`
- **Correct Answer:** `"Paris"`

**Question:** Which planet is known as the Red Planet?

- **Choices:** `["Earth", "Mars", "Jupiter", "Saturn"]`
- **Correct Answer:** `"Mars"`

**Question:** Who wrote the play "Romeo and Juliet"?

- **Choices:** `["William Shakespeare", "Charles Dickens", "Mark Twain", "Jane Austen"]`
- **Correct Answer:** `"William Shakespeare"`

**Question:** What is the largest mammal in the world?

- **Choices:** `["Elephant", "Blue Whale", "Giraffe", "Shark"]`
- **Correct Answer:** `"Blue Whale"`

## Contributing

Contributions are welcome! If you'd like to contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Push your branch and submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

Built with ❤️ by [Rachit Gupta].

Inspired by real-time multiplayer games and quiz applications.
