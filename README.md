# 🌿 Allergy Tracker

**Allergy Tracker** is a cross-platform mobile app that predicts and visualizes seasonal allergy periods using real-time environmental data and machine learning. It’s designed for individuals with pollen allergies, helping them anticipate risk days, plan outdoor activity, and manage symptoms effectively.

---

## 🚀 Key Features

### 📅 Calendar View
- View blooming windows for allergenic plants
- Intensity graph using color-coded forecast per day
- Dynamically updates with new data

### 🗺️ Map View
- Interactive map powered by **Mapbox** and **Breezometer**
- Clickable regions provide 5-day forecasts and list of blooming plants
- Highlights pollen zones based on personalized sensitivity

### 📚 Plant Library
- Details on allergenic plants: bloom periods, images, cross-reactions
- Weekly bloom prediction chart per plant
- Filters based on user allergies

![App Screenshot](readme_images/allergy_tracker_ss1.png)

---

### 🔐 User Accounts & Personalization

- **Firebase Authentication** (email + password)
- Stores:
  - Allergy sensitivity levels (0–5 per plant)
  - Preferred language and theme (light/dark)
  - Location preference
- All settings sync to cloud and remain available across devices
- **Account deletion** removes all local and remote data immediately

> 🌐 Offline support: fallback to cached predictions and stored preferences using AsyncStorage.

![App Screenshot](readme_images/allergy_tracker_ss2.png)

---

## 🤖 Machine Learning Models

### 1. **Bloom Prediction Model** – *(Random Forest Regression)*
- Predicts start/end bloom dates using historical pollen and weather
- Adjusts per region and year

### 2. **Two-Stage Pollen Intensity Model**
**Stage 1: Normal distribution**
- Creates a baseline intensity curve between predicted bloom start and end

**Stage 2: Real-time environmental adjustments**
- Inputs:
  - Temperature delta
  - Humidity
  - Rainfall
  - Cloud cover
  - Wind speed
  - CO₂ concentration
- Trained to apply realistic daily corrections to baseline (94% accuracy)

---

## 📡 APIs & Data Sources

- **Open-Meteo** – Regional weather + location suggestions
- **OpenCageData** – Coordinate-to-city conversion
- **Breezometer** – Real-time pollen concentration and map tiles
- **Firebase** – Auth + secure storage of user data

---

## 🛠 Technology Stack

| Layer      | Tools / Frameworks |
|------------|--------------------|
| Frontend   | React Native CLI   |
| Backend    | Python (Render)    |
| ML Models  | Random Forest      |
| Storage    | Firebase Firestore |
| Offline    | AsyncStorage       |
| Map        | Mapbox + Breezometer |
| APIs       | Open-Meteo, Breezometer, OpenCageData |

---


## 📦 How to Use the App

You can download the latest Android version here:

👉 [**Download APK from Releases**](https://github.com/pothedev/allergy-tracker-app/releases/tag/release)

> No installation or setup required — just download and start using.
