// uploadPrompts.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebaseConfig.js"
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Example prompt data
const prompts = [
  { text: "Something you'd find in a haunted house", category: "Spooky" },
  { text: "An item you'd pack for a desert island", category: "Survival" },
  { text: "Something you shouldn't say on a first date", category: "Funny" },
  { text: "A profession that wears a uniform", category: "General" },
  { text: "A terrible baby name", category: "Funny" },
  { text: "Something you do when you're bored", category: "Everyday" },
  { text: "A kitchen appliance", category: "Household" },
  { text: "Something you shout at a sporting event", category: "Sports" },
  { text: "A celebrity people either love or hate", category: "Pop Culture" },
  { text: "A food you eat with your hands", category: "Food" },
  { text: "Something that gets hot", category: "General" },
  { text: "A movie that makes people cry", category: "Entertainment" },
  { text: "A word kids think is funny", category: "Funny" },
  { text: "A reason to call 911", category: "Serious" },
  { text: "Something you'd find in a teenager’s room", category: "Everyday" },
  { text: "A famous landmark", category: "Travel" },
  { text: "A guilty pleasure TV show", category: "Entertainment" },
  { text: "An animal you'd never want as a pet", category: "Animals" },
  { text: "A chore nobody likes doing", category: "Household" },
  { text: "Something you bring to a picnic", category: "Outdoors" },
];

async function uploadPrompts() {
  for (const prompt of prompts) {
    try {
      await addDoc(collection(db, "prompts"), prompt);
      console.log(`Uploaded: "${prompt.text}"`);
    } catch (err) {
      console.error(`Failed to upload "${prompt.text}":`, err);
    }
  }
}

uploadPrompts();
