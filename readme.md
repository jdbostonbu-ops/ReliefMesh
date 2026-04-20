# 🆘 ReliefMesh: Peer-to-Peer Disaster Response
A real-time, "Last-Mile" resource exchange for local communities during crises.

### 👤 Author
**Jacqueline**  
[Check out my GitHub Profile](https://github.com/jdbostonbu-ops)

🚀 **[Visit ReliefMesh](https://jdbostonbu-ops.github.io/ReliefMesh/)**

## 🌐 Browser & Device Compatibility

| Browser / Device | Status | Performance Notes |
| :--- | :--- | :--- |
| **Google Chrome** | ✅ Compatible | Full support for Chrome and Chromium-based rendering. Optimized for Firebase sync. |
| **Microsoft Edge** | ✅ Compatible | Full support for Edge (Chromium) rendering. Optimized for Mapbox GL performance. |
| **Safari** | ✅ Compatible | Full support for Safari and WebKit rendering. Optimized for SVG marker pulsing. |
| **Firefox** | ✅ Supported | Full support. Verified for interactive post cards and coordinate mapping. |
| **iPad & Tablets** | ✅ Supported | Full support. Verified for interactive post cards and coordinate mapping.  
| **iPhone (iOS)** | ⚠️ Limited | **Landscape Orientation only.** please use Landscape Orientation at 50% zoom.|

### 📱 Special Instructions for iPhone specific Mobile Devices
ReliefMesh was developed without a mobile-responsive framework like Bootstrap, as it was primarily architected for large-scale geospatial visualization. Consequently, the interface is not as reliable on mobile devices as it is on tablets or computers; for the best experience on a phone:
1.  Rotate your device to **Landscape Mode**.
2.  Set your browser zoom to **50%** (via the `AA` menu in Safari or Browser Settings in Chrome).

## 🌍 The Problem
During disasters, official dashboards focus on infrastructure (power grids, roads). Individual human needs—"I need insulin," "I have a generator to share"—are often lost in the noise.

## 🚀 The Solution
A matching system for crisis relief. Users can enter their zip code or any city, state or country and view resource offers or requests. FEMA or American Redcross can see the need immediately by glow and triangles and community members can be involved in relief efforts through a peer-to-peer network by posting offers circumventing traditional networks that can be strained. The idea came from the "Tinder app". I thought I could implement a "Tinder style" app but as my project morphed, I realized that "Google Earth style" was better suited for my project.

# 🗺️ Data & Geospatial Engineering | Technical Summary
This project demonstrates the application of API-driven architecture by bridging Firebase Realtime Database with Mapbox GL JS to create a live, interactive community resource map.

* Geospatial API Logic:** Implemented a full data lifecycle by fetching raw JSON coordinates (latitude/longitude) from Firebase and injecting them into the Mapbox API to render dynamic, custom-styled "Need" and "Want" pins.

* Real-Time Synchronization:** Leveraged Firebase SDK listeners to monitor server-side changes, ensuring the client-side map reflects new resource pins instantly without requiring a page refresh.

* Persistent State Management:** Utilized Firebase for persistent data retrieval, maintaining a stable "source of truth" for geospatial markers even across different browser sessions.

* **Interactive Visualizations:** Used Mapbox GL JS to manipulate map layers programmatically, transforming static data points into interactive elements with custom popups and optimized performance.

## 🛠 Tech Stack
- **Frontend:** Vite + Vanilla JS (or React), React, Mapbox GL JS, CSS3 (Custom UI)
- **Maps:** Mapbox GL JS (3D Terrain & Heatmaps)
- **Database:** Firebase Realtime Database (Instant Sync)
- **Auth:** Firebase Auth (Secure User Profiles)
- **Backend:** Firebase (Realtime Database & Authentication)
- **Deployment:** AWS Amplify (CI/CD)

## ⚡ Key Features
- **Live SOS Map:** Pulse markers for urgent medical, food needs, utility and shelter.
- **Resource Cards:** "Claim" or "Offer" to help a neighbor.
- **Geocoding** (turning an address into a pin)
- **Spatial Mapping** (showing icons based on coordinates).
- **Offline-First:** Basic UI caching for low-connectivity environments.

# Why my version of ReliefMesh is actually "Competitive":
- **Peer-to-Peer (P2P):** FEMA is "Top-Down" (Government to Citizen). My app is "Side-to-Side" (Neighbor to Neighbor). In a real disaster, neighbors usually help each other hours or days before a FEMA truck arrives.
- **The "Mother Earth" Visual:** By using the 3D Globe, I make it easy for a global org like Johns Hopkins to see "Hotspots" of needs across an entire continent at a glance. 
- **Speed (Firebase):** My app updates in milliseconds. Most government tools are slow, require logins, and have massive forms to fill out.
How they would use it:
- **FEMA:** They could use your data to see where the "pockets of need" are to decide where to send their supply trucks.
- **Johns Hopkins:** They could use the Medical (Red) markers to track the spread of a health crisis or where oxygen/insulin is running low in real-time.