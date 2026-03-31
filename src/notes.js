import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './style.css';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, remove, update } from 'firebase/database';
import confetti from 'canvas-confetti';

//  FIREBASE CONFIGURATION
const firebaseConfig = {
  apiKey: "AIzaSyAcyZo3pNQMeq3f2nWj7ubgzKFt96BMtv0",
  authDomain: "://firebaseapp.com",
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

// THE LISTENER (Reading from Firebase)
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
            const myPosts = JSON.parse(localStorage.getItem('my_posts') || "[]");
            const isOwner = myPosts.includes(key);

            /*************************************** FORMING MARKERS ***************************************/
            const el = document.createElement('div');
            el.className = 'sos-marker pulse';

            el.style.filter = `
                drop-shadow(0 0 8px ${report.color}) 
                drop-shadow(0 0 25px ${report.color}) 
                drop-shadow(0 0 50px ${report.color}44)`;

            if (report.type === 'need') {
                el.classList.add('need');
                el.innerHTML = `
                    <svg xmlns="http://w3.org" fill="${report.color}33" viewBox="0 0 24 24" stroke-width="1.5" stroke="${report.color}" style="width: 32px; height: 32px;">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>`;
                el.style.backgroundColor = 'transparent';
            } else {
                el.classList.add('offer');
                el.innerHTML = ` <svg xmlns="http://w3.org/2000/svg" fill="${report.color}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${report.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`;
                el.style.backgroundColor = 'transparent';
            }

            const popup = new mapboxgl.Popup({ offset: 25, anchor: 'bottom' })
                .setHTML(`
                    <div style="color: #333; font-family: sans-serif; padding: 5px; min-width: 160px;">
                        <strong style="color:${report.color}; text-transform: uppercase; font-size:10px;"
                        >${report.category} | ${report.type === 'need' ? 'REQUEST' : 'OFFER'}</strong>
                        <h3 style="margin: 5px 0; font-size: 16px;">${report.item}</h3>
                        <button id="btn-${key}" class="help-btn" style="width:100%; background:${report.color}; 
                        color:white; border:none; padding:10px; border-radius:4px; font-weight:bold; cursor:pointer;">
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
                const delBtn = document.getElementById(`delete-${key}`);
                const btn = document.getElementById(`btn-${key}`);
                const popupElement = document.querySelector('.mapboxgl-popup-content');
                
                if (typeof Hammer !== 'undefined' && popupElement) {
                    const hammer = new Hammer(popupElement);
                    hammer.on('swiperight', () => { if (btn) btn.click(); });
                    hammer.on('swipeleft', () => popup.remove());
                }

                if (delBtn) {
                    delBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm("Permanently remove your post from the globe?")) {
                            remove(ref(db, `reports/${key}`))
                                .then(() => {
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
                        update(ref(db, `reports/${key}`), { status: 'claimed' });
                        btn.innerText = "MISSION CLAIMED 🚀";
                        btn.style.backgroundColor = "#4dff4d";
                        btn.disabled = true;

                        const emptyMsg = document.querySelector('.empty-msg');
                        if (emptyMsg) emptyMsg.remove();

                        const intelSection = document.getElementById('intel-section');
                        const missionCard = document.getElementById('active-mission-card');
                        
                        if (intelSection && missionCard) {
                            intelSection.style.display = 'block';
                            intelSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                            missionCard.innerHTML = `
                                <div style="font-family: monospace; border-left: 2px solid #4db8ff; padding-left: 10px;">
                                    <p style="margin: 0; color: #4db8ff; font-weight: bold;">[ACTIVE MISSION]</p>
                                    <p style="margin: 5px 0;"><strong>TARGET:</strong> ${report.item}</p>
                                    <p style="margin: 5px 0;"><strong>STATUS:</strong> <span style="color: #4dff4d;">EN ROUTE</span></p>
                                    <p style="margin: 5px 0; font-size: 11px; opacity: 0.7;">COORDS: ${report.loc[0].toFixed(4)}, ${report.loc[1].toFixed(4)}</p>
                                    <button id="complete-${key}" style="width:100%; margin-top:10px; padding:8px; background:#4db8ff; 
                                    border:none; border-radius:4px; font-weight:bold; cursor:pointer; color:black;">MARK AS RECEIVED</button>
                                </div>
                            `;

                            document.getElementById(`complete-${key}`).addEventListener('click', () => {
                                const duration = 3 * 1000;
                                const end = Date.now() + duration;
                            
                                (function frame() {
                                    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#4db8ff', '#4dff4d', '#ffffff'] });
                                    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#4db8ff', '#4dff4d', '#ffffff'] });
                                    if (Date.now() < end) requestAnimationFrame(frame);
                                }());
                            
                                const cBtn = document.getElementById(`complete-${key}`);
                                cBtn.innerText = "MISSION LOGGED! ✅";
                                cBtn.style.backgroundColor = "#4dff4d";
                            
                                setTimeout(() => {
                                    if (intelSection) intelSection.style.display = 'none';
                                }, 2500); 
                            });
                        } 

                        const matchEntry = document.createElement('div');
                        matchEntry.className = 'match-item';
                        matchEntry.innerHTML = `
                            <div style="border-left: 4px solid ${report.color}; padding: 10px; margin-top: 10px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                                <h4 style="margin:0;">${report.item}</h4>
                                <p style="margin:4px 0; font-size:11px;">Category: ${report.category}</p>
                                <button onclick="this.parentElement.remove(); document.getElementById('match-count').innerText = document.querySelectorAll('.match-item').length;" 
                                style="font-size:10px; background:none; border:1px solid #666; color:white; border-radius:2px; cursor:pointer;">Release</button>
                            </div>
                        `;
                        matchList.appendChild(matchEntry);
                        matchCount.innerText = document.querySelectorAll('.match-item').length;
                    });
                }
            });
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

searchBtn.addEventListener('click', () => {
    const query = zipInput.value;
    if (!query) return;
    const url = `https://mapbox.com{encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&limit=1`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.features && data.features.length > 0) {
                const [lng, lat] = data.features[0].center;
                map.flyTo({ center: [lng, lat], zoom: 12, pitch: 45, essential: true, duration: 3000 });
            } else {
                alert("Location not found.");
            }
        });
});

resetViewBtn.addEventListener('click', () => {
    map.flyTo({ center: [-98.57, 39.82], zoom: 3, pitch: 0, bearing: 0, essential: true, duration: 3000 });
});

map.on('zoom', () => {
    const zoom = map.getZoom();
    const newScale = zoom < 5 ? 3 : (zoom < 10 ? 1.5 : 1);
    document.documentElement.style.setProperty('--marker-scale', newScale);
});

map.addControl(new mapboxgl.NavigationControl());

postOfferBtn.addEventListener('click', () => {
    currentPostType = 'offer';
    postForm.style.display = 'block';
    dropPinBtn.innerText = "DROP OFFER ON MAP";
    dropPinBtn.style.background = "#4dff4d";
    dropPinBtn.style.color = "black";
});

postNeedBtn.addEventListener('click', () => {
    currentPostType = 'need';
    postForm.style.display = 'block';
    dropPinBtn.innerText = "DROP NEED ON MAP";
    dropPinBtn.style.background = "#ff4d4d";
    dropPinBtn.style.color = "white";
});

dropPinBtn.addEventListener('click', () => {
    const item = document.getElementById('item-input').value;
    const select = document.getElementById('category-select');
    const category = select.value;
    const color = select.options[select.selectedIndex].getAttribute('data-color');

    if (!item) return alert("Please describe the need first!");
    map.getCanvas().style.cursor = 'crosshair';
    alert(`Ready! Click on the map to place your ${category} request.`);

    map.once('click', (e) => {
        const { lng, lat } = e.lngLat;
        const newReport = { category, color, item, type: currentPostType, msg: `Urgent ${category}: ${item}`, loc: [lng, lat] };
        const newReportRef = push(ref(db, 'reports'));
        const myPosts = JSON.parse(localStorage.getItem('my_posts') || "[]");
        myPosts.push(newReportRef.key);
        localStorage.setItem('my_posts', JSON.stringify(myPosts));
        set(newReportRef, newReport);
        map.getCanvas().style.cursor = '';
        postForm.style.display = 'none';
        document.getElementById('item-input').value = '';
    });
});

document.getElementById('clear-matches-btn').addEventListener('click', () => {
    if (confirm("Are you sure?")) {
        document.getElementById('match-list').innerHTML = '<p class="empty-msg">No active missions.</p>';
        document.getElementById('intel-section').style.display = 'none';
        document.getElementById('match-count').innerText = '0';
    }
});

// 🌍 AUTO-ROTATE ENGINE
let userInteracting = false;
function spinGlobe() {
    if (!userInteracting && map.getZoom() < 5) {
        const center = map.getCenter();
        center.lng -= (360 / 120); 
        map.easeTo({ center, duration: 1000, easing: (n) => n, essential: true });
    }
}
map.on('mousedown', () => { userInteracting = true; });
map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
map.on('moveend', () => { spinGlobe(); });
spinGlobe();
