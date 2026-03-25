# Double Ditto

Double Ditto is a real-time multiplayer party game where players try to match answers with others. Given a prompt, players score points by submitting answers that at least one other player also chooses.

## Live Demo
Coming soon

## Features

- Real-time multiplayer gameplay using Firebase Firestore  
- Lobby system with host and player roles  
- Join games using a lobby code  
- Timed rounds with live answer submission  
- Automatic scoring based on matching answers  
- Real-time score updates across all clients  

## Tech Stack

**Frontend**
- React (Vite)  
- JavaScript  

**Backend / Infrastructure**
- Firebase Firestore  
- Firebase Hosting  

## How It Works

1. A host creates a lobby  
2. Players join using a code  
3. A prompt is shown each round  
4. Players submit answers within a time limit  
5. Matching answers earn points  
6. Scores update in real time  

## Getting Started

### 1. Clone the repository

```
git clone https://github.com/your-username/double-ditto.git
cd double-ditto
```

### 2. Install dependencies

```
npm install
```

### 3. Set up Firebase

Create a `.env` file:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### 4. Run the development server

```
npm run dev
```

Open in browser:

```
http://localhost:5173
```

## Deployment

```
npm run build
firebase deploy
```

## License

MIT

