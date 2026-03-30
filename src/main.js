import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import confetti from 'canvas-confetti';

//  FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAcyZo3pNQMeq3f2nWj7ubgzKFt96BMtv0",
  authDomain: "reliefmesh-ce8fd.firebaseapp.com",
  projectId: "reliefmesh-ce8fd",
  storageBucket: "reliefmesh-ce8fd.firebasestorage.app",
  messagingSenderId: "733310520698",
  appId: "1:733310520698:web:16f1beae5874ce6786dac3",
  measurementId: "G-SWFLEQ64L2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//  UI ELEMENT SELECTORS
const zipInput = document.getElementById('zip-input');
const clearBtn = document.getElementById('clear-btn');
const searchBtn = document.getElementById('search-btn');
const matchCount = document.getElementById('match-count');
const matchList = document.getElementById('match-list');
const postNeedBtn = document.getElementById('post-need-btn'); 
const postOfferBtn = document.getElementById('post-offer-btn');
const postForm = document.getElementById('post-form');
const dropPinBtn = document.getElementById('drop-pin-btn');
const resetViewBtn = document.getElementById('reset-view-btn');

// STABILITY FIX: Clear storage before starting
mapboxgl.clearStorage();

// MAP INITIALIZATION
mapboxgl.accessToken = 'pk.eyJ1IjoiamRib3N0b24iLCJhIjoiY21uODFjZGRlMDZrajJzcHR6MWV4dTQwaSJ9.tRjtkCuIH6URpa9IBZCpBg';

// INITIALIZE GLOBAL MAP (Globe View)
const map = new mapboxgl.Map({
    container: 'app', 
    style: 'mapbox://styles/mapbox/dark-v11', 
    center: [-98.57, 39.82], // Center of North America
    zoom: 3, 
    pitch: 45, 
    projection: 'globe', // 3D Globe Factor
    failIfMajorPerformanceCaveat: false,
    canvasContextAttributes: {
    antialias: false,
    preserveDrawingBuffer: false
    }
});

// 4. ATMOSPHERE & HEATMAP
map.on('style.load', () => {
    
    // Set the Space/Atmosphere 
    map.setFog({
        'color': 'rgb(186, 210, 235)', 
        'high-color': 'rgb(36, 92, 223)', 
        'space-color': 'rgb(11, 11, 25)', 
        'star-intensity': 1 
    });

    // The Heatmap Source & Layer
    map.addSource('reports-source', {
        'type': 'geojson',
        'data': { 'type': 'FeatureCollection', 'features': [] }
    });

    map.addLayer({
        'id': 'reports-heat',
        'type': 'heatmap',
        'source': 'reports-source',
        'maxzoom': 9,
        'paint': {
            'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
            'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
            'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 9, 0]
        }
    });
});

/************************************************ */
let currentPostType = 'offer'; 
let currentMarkers = [];

// 1. THE LISTENER (Reading from Firebase)
const reportsRef = ref(db, 'reports');
onValue(reportsRef, (snapshot) => {
    const data = snapshot.val();
    currentMarkers.forEach(marker => marker.remove());
    currentMarkers = [];

    if (data) {
        const features = Object.keys(data).map(key => ({
            'type': 'Feature',
            'geometry': { 'type': 'Point', 'coordinates': data[key].loc }
        }));

        if (map.getSource('reports-source')) {
            map.getSource('reports-source').setData({ 'type': 'FeatureCollection', 'features': features });
        }

        Object.keys(data).forEach(key => {
            const report = data[key];

            // OWNERSHIP CHECK
            const myPosts = JSON.parse(localStorage.getItem('my_posts') || "[]");
            const isOwner = myPosts.includes(key);

            const el = document.createElement('div');
            el.className = 'sos-marker pulse'; 

            // --- FORMING TRIANGLES / CIRCLES ---
            if (report.type === 'need') {
                el.classList.add('need');
                el.innerHTML = `
                    <svg xmlns="http://www.w3.org" fill="${report.color}33" viewBox="0 0 24 24" stroke-width="1.5" stroke="${report.color}" style="width: 32px; height: 32px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>`;
                el.style.backgroundColor = 'transparent';
            } else {
                el.classList.add('offer');
                el.style.backgroundColor = report.color;
                el.style.borderRadius = '50%';
                el.style.width = '20px';
                el.style.height = '20px';
                el.style.border = '2px solid white';
            }

            const popup = new mapboxgl.Popup({ offset: 25, anchor: 'bottom' })
                .setHTML(`
                    <div style="color: #333; font-family: sans-serif; padding: 5px; min-width: 160px;">
                        <strong style="color:${report.color}; text-transform: uppercase; font-size:10px;">
                            ${report.category} | ${report.type === 'need' ? 'REQUEST' : 'OFFER'}
                        </strong>
                        <h3 style="margin: 5px 0; font-size: 16px;">${report.item}</h3>
                        <button id="btn-${key}" class="help-btn" style="width:100%; background:${report.color}; color:white; border:none; padding:10px; border-radius:4px; font-weight:bold; cursor:pointer;">
                            ${report.type === 'need' ? 'I CAN HELP' : 'I NEED THIS'}
                        </button>
                        ${isOwner ? `<button id="delete-${key}" style="width:100%; margin-top:8px; background:none; border:1px solid #ff4d4d; color:#ff4d4d; padding:5px; border-radius:4px; font-size:10px; cursor:pointer; font-weight:bold;">CANCEL MY POST</button>` : ''}
                    </div>
                `);

            const marker = new mapboxgl.Marker({ element: el, occludedOpacity: 0 })
                .setLngLat(report.loc)
                .setPopup(popup)
                .addTo(map);
            
            currentMarkers.push(marker);

           popup.on('open', () => {
    const btn = document.getElementById(`btn-${key}`);
    const delBtn = document.getElementById(`delete-${key}`);

    // FIXED DELETE LOGIC
    if (delBtn) {
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 1. Stops the map from closing the popup immediately
            
            if (confirm("Permanently remove your post from the globe?")) {
                // 2. Use correct Firebase v9 remove function
                remove(ref(db, `reports/${key}`))
                    .then(() => {
                        // 3. Clean up local storage
                        const updatedPosts = myPosts.filter(id => id !== key);
                        localStorage.setItem('my_posts', JSON.stringify(updatedPosts));
                        popup.remove();
                    })
                    .catch(err => console.error("Delete failed:", err));
            }
        });
    }

    if (btn) {
        btn.addEventListener('click', () => {
            // Update Firebase to show this mission is CLAIMED
            update(ref(db, `reports/${key}`), { status: 'claimed' });

            btn.innerText = "MISSION CLAIMED 🚀";
            btn.style.backgroundColor = "#4dff4d";
            btn.disabled = true;

            const matchEntry = document.createElement('div');
            matchEntry.className = 'match-item';
            matchEntry.innerHTML = `
                <div style="border-left: 4px solid ${report.color}; padding: 10px; margin-top: 10px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                    <h4 style="margin:0;">${report.item}</h4>
                    <button id="release-${key}" style="font-size:10px; background:none; border:1px solid #666; color:white; border-radius:2px; cursor:pointer;">Release</button>
                </div>
            `;
            matchList.appendChild(matchEntry);
            
            // FIXED RELEASE LOGIC
            document.getElementById(`release-${key}`).addEventListener('click', function() {
                // 1. Reset status in Firebase so others can help again
                update(ref(db, `reports/${key}`), { status: 'active' });
                
                // 2. Remove from UI
                this.parentElement.remove();
                matchCount.innerText = document.querySelectorAll('.match-item').length;
            });

            matchCount.innerText = document.querySelectorAll('.match-item').length;
        });
    }
})
       


                    /* Sidebar */
                     const matchEntry = document.createElement('div');
                        matchEntry.className = 'match-item';
                        matchEntry.innerHTML = `
                            <div style="border-left: 4px solid ${report.color}; padding: 10px; margin-top: 10px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                                <h4 style="margin:0;">${report.item}</h4>
                                <p style="margin:4px 0; font-size:11px;">Category: ${report.category}</p>
                                <button onclick="this.parentElement.remove(); document.getElementById('match-count')
                                .innerText = document.querySelectorAll('.match-item').length;" style="font-size:10px; 
                                background:none; border:1px solid #666; color:white; border-radius:2px; cursor:pointer;">Release</button>
                            </div>
                        `;
                        matchList.appendChild(matchEntry);
                        matchCount.innerText = document.querySelectorAll('.match-item').length;
                    });
                }
            });
   


// 3D BUILDINGS LAYER
map.on('style.load', () => {
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(l => l.type === 'symbol' && l.layout['text-field']).id;
    map.addLayer({
        'id': 'add-3d-buildings', 
        'source': 'composite', 
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'], 
        'type': 'fill-extrusion', 
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'height']],
            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'min_height']],
            'fill-extrusion-opacity': 0.6
        }
    }, labelLayerId);
});

// SEARCH & CLEAR BUTTON LOGIC
zipInput.addEventListener('input', () => {
    clearBtn.style.display = zipInput.value ? 'block' : 'none';
});

clearBtn.addEventListener('click', () => {
    zipInput.value = '';
    clearBtn.style.display = 'none';
    zipInput.focus();
});

// SEARCH & FORM LOGIC

searchBtn.addEventListener('click', () => {
    const query = zipInput.value;
    if (!query) return;
    
    // Added /geocoding/v5/mapbox.places/ to the URL
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=1`;

        
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Search API error - Check token scopes");
            return response.json();
        })
        .then(data => {
            // Standardized the way we grab coordinates for the Globe
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const [lng, lat] = feature.center;

                console.log(`Flying to: ${feature.place_name}`);

                map.flyTo({ 
                    center: [lng, lat], 
                    zoom: 12, 
                    pitch: 45, 
                    essential: true, 
                    duration: 3000 
                });
            } else {
                alert("Location not found. Try a city name or zip code.");
            }
        })
        .catch(err => {
            console.error("Search Error:", err);
            alert("Search failed. Check your internet or token.");
        });
});

resetViewBtn.addEventListener('click', () => {
    map.flyTo({
        center: [-98.57, 39.82], // Back to North America
        zoom: 3,
        pitch: 0,
        bearing: 0,
        essential: true,
        duration: 3000
    });
});

//  ZOOM & SCALE LISTENER
map.on('zoom', () => {
    const zoom = map.getZoom();
    const newScale = zoom < 5 ? 3 : (zoom < 10 ? 1.5 : 1);
    document.documentElement.style.setProperty('--marker-scale', newScale);
});

map.addControl(new mapboxgl.NavigationControl());

// *********************************************** //
postOfferBtn.addEventListener('click', () => {
    currentPostType = 'offer'; // Sets the switch
    postForm.style.display = 'block';
    dropPinBtn.innerText = "DROP OFFER ON MAP";
    dropPinBtn.style.background = "#4dff4d"; // Green for Offer
    dropPinBtn.style.color = "black";
});


postNeedBtn.addEventListener('click', () => {
    currentPostType = 'need'; // Sets the switch
    postForm.style.display = 'block';
    dropPinBtn.innerText = "DROP NEED ON MAP";
    dropPinBtn.style.background = "#ff4d4d"; // Red for Need
    dropPinBtn.style.color = "white";
});

/************************************************** */

// The actual "Drop" logic
dropPinBtn.addEventListener('click', () => {
    const item = document.getElementById('item-input').value;
    const select = document.getElementById('category-select');
    const category = select.value;
    const color = select.options[select.selectedIndex].getAttribute('data-color');

    if (!item) return alert("Please describe the need first!");
  
    // Change cursor to crosshair
    map.getCanvas().style.cursor = 'crosshair';
    alert(`Ready! Click on the map to place your ${category} request.`);
  
    map.once('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        const newReport = {
            category: category,
            color: color,
            item: item,
            type: currentPostType, // Important: Ensure your script tracks if it's a 'need' or 'offer'
            msg: `Urgent ${category} request: ${item}`,
            loc: [lng, lat],
            timestamp: Date.now() // Good for sorting later
        };
  
        // 1. PUSH TO FIREBASE AND CAPTURE THE KEY
        const reportsRef = ref(db, 'reports');
        const newReportRef = push(reportsRef);
        const newKey = newReportRef.key; // This is the unique ID for THIS specific post

        // 2. SAVE KEY TO LOCAL STORAGE (The "Ownership Receipt")
        // This allows the user to delete their own post later without an account
        const myPosts = JSON.parse(localStorage.getItem('my_posts') || "[]");
        myPosts.push(newKey);
        localStorage.setItem('my_posts', JSON.stringify(myPosts));

        // 3. SET DATA TO FIREBASE
        set(newReportRef, newReport);
  
        // Reset UI
        map.getCanvas().style.cursor = '';
        postForm.style.display = 'none';
        document.getElementById('item-input').value = '';
        alert("SOS Broadcasted to Mother Earth!");
    });
});


document.getElementById('clear-matches-btn').addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your mission history?")) {
        // Wipe the match list
        const matchList = document.getElementById('match-list');
        matchList.innerHTML = '<p class="empty-msg" style="color: #fff; opacity: 0.7;">No active matches yet. Swipe on a marker to help!</p>';
        
        // Hide the Intel box
        document.getElementById('intel-section').style.display = 'none';
        
        // Reset the counter to 0
        document.getElementById('match-count').innerText = '0';
        
        alert("All missions cleared. System reset.");
    }
});

document.getElementById('reset-view-btn').addEventListener('click', () => {
    map.flyTo({
        center: [-98.57, 39.82], // Back to North America center
        zoom: 3,                 // Back to space
        pitch: 0,                // Look straight down (removes 3D tilt)
        bearing: 0,              // Reset rotation to North
        essential: true,
        duration: 3000           // A smooth 3-second flight
    });
});


// 🌍 THE AUTO-ROTATE ENGINE
// Setup Variables
let userInteracting = false;
const maxSpinZoom = 5; // Rotation stops if you zoom in past this
const msPerRotation = 120000; // Time for one full spin (2 minutes)

// The Rotation Engine
function spinGlobe() {
    const zoom = map.getZoom();
    if (!userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / (msPerRotation / 1000);
        const center = map.getCenter();
        center.lng -= distancePerSecond; // Drift left

        map.easeTo({ 
            center, 
            duration: 1000, 
            easing: (n) => n, 
            essential: true 
        });
    }
}

// EVENT LISTENERS: The "Green Light" for the engine
// Stop when touching
map.on('mousedown', () => { userInteracting = true; });

// Restart when released or finished moving
map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
map.on('dragend', () => { userInteracting = false; spinGlobe(); });
map.on('pitchend', () => { userInteracting = false; spinGlobe(); });
map.on('rotateend', () => { userInteracting = false; spinGlobe(); });

// The Loop: When one 1-second 'easeTo' finishes, start the next one
map.on('moveend', () => {
    spinGlobe();
});

// 4. Initial start
spinGlobe();