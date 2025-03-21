// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MedicalAssistantUI from './MedicalAssistantUI';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import './App.css';

// Firebase configuration
const firebaseConfig = {
 apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
 authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
 projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
 storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
 messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
 appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
 const [user, setUser] = useState(null);

 useEffect(() => {
   const unsubscribe = onAuthStateChanged(auth, (authUser) => {
     if (authUser) {
       // User is signed in
       setUser(authUser);
     } else {
       // User is signed out
       setUser(null);
     }
   });

   // Clean up the subscription on unmount
   return () => unsubscribe();
 }, []);

 return (
   <Router>
     <Routes>
       <Route 
         path="/" 
         element={<MedicalAssistantUI user={user} />} 
       />
     </Routes>
   </Router>
 );
};

export default App;