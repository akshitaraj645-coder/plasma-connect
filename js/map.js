/**
 * HemoPulse - Interactive GIS Radar & Leaflet Map Controller
 * Displays blood banks, nearby donors, emergency requests, radius circles,
 * and travel route previews with custom markers.
 */

class MapManager {
    constructor(containerId = 'leaflet-map-container') {
        this.containerId = containerId;
        this.map = null;
        this.markersLayer = null;
        this.routeLayer = null;
        this.radiusCircle = null;
        this.initialized = false;
        this.defaultCenter = [12.9516, 77.6200]; // Central Tech/Medical corridor
        this.defaultZoom = 12;
    }

    init() {
        if (this.initialized) return;
        const container = document.getElementById(this.containerId);
        if (!container) return;

        // Check if Leaflet L is available
        if (typeof L === 'undefined') {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full p-6 text-center text-slate-500 bg-slate-900 rounded-2xl">
                    <div class="w-16 h-16 mb-3 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <i data-lucide="map-pin" class="w-8 h-8"></i>
                    </div>
                    <p class="font-medium text-slate-300">Live Radar Simulation Active</p>
                    <p class="text-xs text-slate-400 mt-1">Simulating geographic proximity & GPS routing</p>
                </div>
            `;
            return;
        }

        try {
            this.map = L.map(this.containerId, {
                zoomControl: true,
                scrollWheelZoom: true
            }).setView(this.defaultCenter, this.defaultZoom);

            // Sleek dark-mode / medical clean carto tiles
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 19
            }).addTo(this.map);

            this.markersLayer = L.layerGroup().addTo(this.map);
            this.routeLayer = L.layerGroup().addTo(this.map);
            this.initialized = true;

            setTimeout(() => {
                if (this.map) this.map.invalidateSize();
            }, 300);
        } catch (e) {
            console.warn('Map initialization failed', e);
        }
    }

    render(donors = [], bloodBanks = [], activeRequest = null) {
        if (!this.initialized) this.init();
        if (!this.map || !this.markersLayer) return;

        this.markersLayer.clearLayers();
        this.routeLayer.clearLayers();
        if (this.radiusCircle) {
            this.map.removeLayer(this.radiusCircle);
            this.radiusCircle = null;
        }

        const bounds = [];

        // 1. Plot Blood Banks
        bloodBanks.forEach(bank => {
            if (bank.lat && bank.lng) {
                const iconHtml = `
                    <div class="relative flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform">
                        <span class="text-sm font-bold">🏥</span>
                        <span class="absolute -top-1 -right-1 flex h-3 w-3">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                    </div>
                `;
                const icon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-bank-marker',
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });

                const marker = L.marker([bank.lat, bank.lng], { icon }).addTo(this.markersLayer);
                
                // Popup with inventory summary
                marker.bindPopup(`
                    <div class="p-2 text-slate-800 text-xs font-sans max-w-xs">
                        <div class="flex items-center gap-1.5 font-bold text-sm text-blue-700">
                            <span>🏥</span>
                            <span>${bank.name}</span>
                        </div>
                        <p class="text-slate-500 mt-1">${bank.address}</p>
                        <div class="mt-2 py-1 px-2 bg-blue-50 rounded border border-blue-100 flex items-center justify-between">
                            <span class="font-semibold text-blue-800">24x7 Helpline:</span>
                            <span class="font-bold text-blue-900">${bank.phone}</span>
                        </div>
                        <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                            <span>Verified Centre</span>
                            <span class="text-emerald-600 font-bold">● Active Inventory</span>
                        </div>
                    </div>
                `);

                bounds.push([bank.lat, bank.lng]);
            }
        });

        // 2. Plot Donors
        donors.forEach(donor => {
            if (donor.lat && donor.lng && donor.isAvailable) {
                const isVerified = donor.verificationStatus === 'verified';
                const iconHtml = `
                    <div class="relative flex items-center justify-center w-9 h-9 ${isVerified ? 'bg-rose-600' : 'bg-amber-600'} text-white rounded-full shadow-md border-2 ${isVerified ? 'border-emerald-400' : 'border-white'} hover:scale-125 transition-transform">
                        <span class="text-xs font-black tracking-tight">${donor.bloodGroup}</span>
                        ${isVerified ? '<span class="absolute -bottom-1 -right-1 text-[10px]">🛡️</span>' : ''}
                    </div>
                `;
                const icon = L.divIcon({
                    html: iconHtml,
                    className: 'custom-donor-marker',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18]
                });

                const marker = L.marker([donor.lat, donor.lng], { icon }).addTo(this.markersLayer);
                marker.bindPopup(`
                    <div class="p-2 text-slate-800 text-xs font-sans">
                        <div class="flex items-center justify-between gap-2">
                            <span class="font-bold text-sm text-slate-900">${donor.fullName}</span>
                            <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}">
                                ${isVerified ? '✓ Verified Donor' : 'Pending Verification'}
                            </span>
                        </div>
                        <p class="text-slate-500 mt-0.5">Blood Group: <strong class="text-rose-600">${donor.bloodGroup}</strong></p>
                        <p class="text-slate-500">Area: ${donor.area}</p>
                        <p class="text-slate-500">Willing to travel: up to <strong>${donor.travelDistanceKm} km</strong></p>
                        <div class="mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                            Avg Response: ${donor.avgResponseMinutes} mins • Donations: ${donor.totalDonationsCount}
                        </div>
                    </div>
                `);

                bounds.push([donor.lat, donor.lng]);
            }
        });

        // 3. Plot Active Emergency Request Hospital & Draw Route if Accepted
        if (activeRequest && activeRequest.lat && activeRequest.lng) {
            const reqIconHtml = `
                <div class="relative flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full shadow-2xl border-4 border-white animate-pulse">
                    <span class="text-lg">🚨</span>
                    <span class="absolute -top-1 -right-1 flex h-4 w-4">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
                        <span class="relative inline-flex rounded-full h-4 w-4 bg-red-600"></span>
                    </span>
                </div>
            `;
            const reqIcon = L.divIcon({
                html: reqIconHtml,
                className: 'custom-emergency-marker',
                iconSize: [48, 48],
                iconAnchor: [24, 24]
            });

            const reqMarker = L.marker([activeRequest.lat, activeRequest.lng], { icon: reqIcon }).addTo(this.markersLayer);
            reqMarker.bindPopup(`
                <div class="p-2 text-slate-800 text-xs font-sans">
                    <span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold uppercase text-[10px]">
                        🚨 ${activeRequest.urgency} SOS
                    </span>
                    <h4 class="font-bold text-sm text-slate-900 mt-1">${activeRequest.hospitalName}</h4>
                    <p class="text-rose-600 font-bold text-xs mt-0.5">Need: ${activeRequest.unitsNeeded} unit(s) of ${activeRequest.bloodGroup} (${activeRequest.component})</p>
                    <p class="text-slate-500 mt-1">${activeRequest.hospitalAddress}</p>
                    <div class="mt-2 text-slate-600 font-mono text-[11px] bg-slate-50 p-1.5 rounded">
                        Status: <span class="text-amber-600 font-bold">${activeRequest.status}</span>
                    </div>
                </div>
            `);

            // Radius circle around emergency point (15 km)
            this.radiusCircle = L.circle([activeRequest.lat, activeRequest.lng], {
                radius: 12000, // 12 km search radius
                color: '#e11d48',
                fillColor: '#f43f5e',
                fillOpacity: 0.08,
                weight: 1.5,
                dashArray: '6, 6'
            }).addTo(this.map);

            bounds.push([activeRequest.lat, activeRequest.lng]);

            // If a donor has accepted, draw dynamic routing polyline to the hospital
            if (activeRequest.status === 'ACCEPTED' && activeRequest.acceptedDonorId) {
                const acceptedDonor = donors.find(d => d.id === activeRequest.acceptedDonorId);
                if (acceptedDonor && acceptedDonor.lat && acceptedDonor.lng) {
                    const latlngs = [
                        [acceptedDonor.lat, acceptedDonor.lng],
                        [
                            // Midpoint waypoint curve simulation
                            (acceptedDonor.lat + activeRequest.lat) / 2 + 0.005,
                            (acceptedDonor.lng + activeRequest.lng) / 2 - 0.005
                        ],
                        [activeRequest.lat, activeRequest.lng]
                    ];

                    const routeLine = L.polyline(latlngs, {
                        color: '#10b981',
                        weight: 4,
                        opacity: 0.85,
                        dashArray: '8, 8'
                    }).addTo(this.routeLayer);

                    // Add midway ETA label
                    const midpoint = latlngs[1];
                    const etaIcon = L.divIcon({
                        html: `
                            <div class="bg-emerald-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-full shadow-lg border border-white whitespace-nowrap animate-bounce flex items-center gap-1">
                                <span>⚡ Donor En Route: ETA ~22 mins</span>
                            </div>
                        `,
                        className: 'custom-eta-marker',
                        iconAnchor: [60, 15]
                    });
                    L.marker(midpoint, { icon: etaIcon }).addTo(this.routeLayer);
                }
            }
        }

        // Fit map bounds if points exist
        if (bounds.length > 0) {
            try {
                this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
            } catch (err) {
                console.warn('Could not fit bounds', err);
            }
        }
    }
}

window.mapManager = new MapManager('leaflet-map-container');
