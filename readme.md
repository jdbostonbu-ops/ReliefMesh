# Last Mile
# 🆘 ReliefMesh: Peer-to-Peer Disaster Response
> An interactive terrain and mesh visualization engine built for high-performance rendering. A real-time, "Last-Mile" resource exchange for local communities during crises.
> <br>
> 🚀 **[Live Demo](https://jdbostonbu-ops.github.io/ReliefMesh/)** | 👤 **[GitHub Profile](https://github.com)**

## 👤 Author
**Jacqueline**
*Full-Stack Developer & Crisis Tech Innovator* 
[Check out my GitHub Profile](https://github.com/jdbostonbu-ops)

## 🌍 The Problem
During disasters, official dashboards focus on infrastructure (power grids, roads). Individual human needs—"I need insulin," "I have a generator to share"—are often lost in the noise.

## 🚀 The Solution
A "Tinder-style" matching system for crisis relief. Users can swipe through nearby resource offers or requests within a 5-mile radius, even when traditional networks are strained.

## 🛠 Tech Stack
- **Compatibility:**: Mobile iOS and Tablet/iPad touch compapatible
- **Frontend:** Vite + Vanilla JS (or React)
- **Maps:** Mapbox GL JS (3D Terrain & Heatmaps)
- **Database:** Firebase Realtime Database (Instant Sync)
- **Auth:** Firebase Auth (Secure User Profiles)
- **Styling:** Tailwind CSS (Mobile-First Design)

### 🌐 Browser & Device Compatibility


### 🌐 Browser & Device Compatibility


| Browser / Device | Status | Performance Notes |
| :--- | :--- | :--- |
| **Google Chrome** | ✅ Optimized | Full support for WebGL rendering & high-poly mesh textures. |
| **Microsoft Edge** | ✅ Supported | Smooth performance; matches Chrome's Chromium engine. |
| **iPhone (iOS)** | ✅ Compatible | Fully functional; optimized touch-controls for 3D rotation. |
| **iPad / Tablets** | ✅ Compatible | Large-screen interactive mesh support with minimal latency. |
| **Apple Safari** | ⚠️ Limited | Supported; may experience variance in shader-intensive scenes. |

> **Note:** The ReliefMesh engine is built for cross-platform 3D visualization. While initialization times and frame rates depend on your device's GPU, the core interactive mesh experience is maintained across all modern browsers.

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
