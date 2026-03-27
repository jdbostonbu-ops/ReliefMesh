# Last Mile
# 🆘 ReliefMesh: Peer-to-Peer Disaster Response
A real-time, "Last-Mile" resource exchange for local communities during crises.

## 🌍 The Problem
During disasters, official dashboards focus on infrastructure (power grids, roads). Individual human needs—"I need insulin," "I have a generator to share"—are often lost in the noise.

## 🚀 The Solution
A "Tinder-style" matching system for crisis relief. Users can swipe through nearby resource offers or requests within a 5-mile radius, even when traditional networks are strained.

## 🛠 Tech Stack
- **Frontend:** Vite + Vanilla JS (or React)
- **Maps:** Mapbox GL JS (3D Terrain & Heatmaps)
- **Database:** Firebase Realtime Database (Instant Sync)
- **Auth:** Firebase Auth (Secure User Profiles)
- **Styling:** Tailwind CSS (Mobile-First Design)

## ⚡ Key Features
- **Live SOS Map:** Pulse markers for urgent medical or food needs.
- **Resource Swiper:** Swipe right to "Claim" or "Offer" help to a neighbor.
- **Geofencing:** Logic to only show users within a 5-mile radius to keep help local.
- **Offline-First:** Basic UI caching for low-connectivity environments.

# Why my version of ReliefMesh is actually "Competitive":
- **Peer-to-Peer (P2P):** FEMA is "Top-Down" (Government to Citizen). My app is "Side-to-Side" (Neighbor to Neighbor). In a real disaster, neighbors usually help each other hours or days before a FEMA truck arrives.
- **The "Mother Earth" Visual:** By using the 3D Globe, I make it easy for a global org like Johns Hopkins to see "Hotspots" of needs across an entire continent at a glance. 
- **Speed (Firebase):** My app updates in milliseconds. Most government tools are slow, require logins, and have massive forms to fill out.
How they would use it:
- **FEMA:** They could use your data to see where the "pockets of need" are to decide where to send their supply trucks.
- **Johns Hopkins:** They could use the Medical (Red) markers to track the spread of a health crisis or where oxygen/insulin is running low in real-time.