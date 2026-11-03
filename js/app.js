/**
 * HemoPulse - Main Application Coordinator & UI Controller
 * Integrates Requester, Donor, Blood Bank, Directory, Audio, Leaflet Map, and Chat.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons if available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // App state references
    const store = window.appStore;
    const sound = window.soundEngine;
    const chat = window.chatManager;
    const compat = window.BloodCompatibility;

    // Active state
    let activeTab = 'home';
    let screeningRequestId = null;

    // DOM Elements
    const views = {
        home: document.getElementById('view-home'),
        requester: document.getElementById('view-requester'),
        donor: document.getElementById('view-donor'),
        bloodbank: document.getElementById('view-bloodbank'),
        directory: document.getElementById('view-directory')
    };

    const navButtons = document.querySelectorAll('[data-nav-target]');
    const audioToggleBtn = document.getElementById('audio-toggle-btn');
    const toastEl = document.getElementById('app-toast');

    // Toast Notification Utility
    function showToast(message, type = 'info', duration = 4000) {
        if (!toastEl) return;
        const iconMap = {
            success: '✓',
            error: '✕',
            warning: '⚠️',
            info: 'ℹ️',
            sos: '🚨'
        };
        const colorMap = {
            success: 'bg-emerald-600 border-emerald-400 text-white',
            error: 'bg-rose-700 border-rose-500 text-white',
            warning: 'bg-amber-600 border-amber-400 text-white',
            info: 'bg-slate-800 border-slate-700 text-slate-100',
            sos: 'bg-red-600 border-red-400 text-white animate-pulse'
        };

        toastEl.className = `fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-medium transition-all duration-300 transform translate-y-0 opacity-100 ${colorMap[type] || colorMap.info}`;
        toastEl.innerHTML = `
            <span class="text-lg font-black">${iconMap[type] || '•'}</span>
            <span>${message}</span>
        `;
        toastEl.classList.remove('hidden');

        setTimeout(() => {
            toastEl.classList.add('opacity-0', 'translate-y-4');
            setTimeout(() => toastEl.classList.add('hidden'), 300);
        }, duration);
    }
    window.showAppToast = showToast;

    // View Navigation Handler
    function switchTab(targetTab) {
        activeTab = targetTab;
        store.activeRole = targetTab;
        store.save();

        // Update Nav styling
        navButtons.forEach(btn => {
            const btnTarget = btn.getAttribute('data-nav-target');
            if (btnTarget === targetTab) {
                btn.classList.add('bg-rose-600', 'text-white', 'shadow-md');
                btn.classList.remove('text-slate-300', 'hover:bg-slate-800');
            } else {
                btn.classList.remove('bg-rose-600', 'text-white', 'shadow-md');
                btn.classList.add('text-slate-300', 'hover:bg-slate-800');
            }
        });

        // Show selected view, hide others
        Object.keys(views).forEach(key => {
            if (views[key]) {
                if (key === targetTab) {
                    views[key].classList.remove('hidden');
                } else {
                    views[key].classList.add('hidden');
                }
            }
        });

        // Specific view refresh logic
        if (targetTab === 'requester') {
            renderRequesterView();
        } else if (targetTab === 'donor') {
            renderDonorView();
        } else if (targetTab === 'bloodbank') {
            renderBloodBankView();
        } else if (targetTab === 'directory') {
            renderDirectoryView();
        }

        // Trigger map re-render if visible
        setTimeout(() => {
            if (window.mapManager) {
                const activeReq = store.requests.find(r => r.status === 'BROADCASTING' || r.status === 'ACCEPTED') || store.requests[0];
                window.mapManager.render(store.donors, store.bloodBanks, activeReq);
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 100);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.switchTab = switchTab;

    // Setup Nav Button clicks
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-nav-target');
            switchTab(target);
        });
    });

    // Audio Toggle
    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            const isEnabled = sound.toggle();
            audioToggleBtn.innerHTML = isEnabled 
                ? `<span class="flex items-center gap-1.5 text-xs text-emerald-400 font-medium"><span>🔊</span> Audio Alerts On</span>`
                : `<span class="flex items-center gap-1.5 text-xs text-slate-400 font-medium"><span>🔇</span> Audio Alerts Off</span>`;
            showToast(isEnabled ? 'Sound alerts enabled' : 'Sound alerts muted', 'info');
        });
    }

    // =========================================================================
    // 1. REQUESTER VIEW LOGIC
    // =========================================================================
    function renderRequesterView() {
        const activeRequestsContainer = document.getElementById('requester-active-requests');
        if (!activeRequestsContainer) return;

        if (store.requests.length === 0) {
            activeRequestsContainer.innerHTML = `
                <div class="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
                    <p class="text-base font-semibold text-slate-300">No active emergency requests</p>
                    <p class="text-xs text-slate-500 mt-1">Fill out the Emergency SOS broadcast form below to alert donors & blood banks.</p>
                </div>
            `;
            return;
        }

        activeRequestsContainer.innerHTML = store.requests.map(req => {
            const isAccepted = req.status === 'ACCEPTED';
            const isBroadcasting = req.status === 'BROADCASTING';
            const matchedCount = (req.notifiedDonorIds || []).length;

            return `
                <div class="glass-card p-5 rounded-2xl border ${isAccepted ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-rose-500/40 bg-rose-950/20'} relative overflow-hidden transition-all hover:shadow-xl">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                    isAccepted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                                }">
                                    ${req.status === 'ACCEPTED' ? '✓ DONOR ACCEPTED & EN ROUTE' : '🚨 BROADCASTING TO DONORS'}
                                </span>
                                <span class="text-xs text-slate-400">${new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <h3 class="text-xl font-bold text-white mt-2 flex items-center gap-2">
                                <span>${req.unitsNeeded} Units</span>
                                <span class="px-2 py-0.5 rounded bg-rose-600 text-white font-black text-sm">${req.bloodGroup}</span>
                                <span class="text-slate-300 text-base font-normal">(${req.component})</span>
                            </h3>
                            <p class="text-sm font-semibold text-slate-200 mt-1">🏥 ${req.hospitalName}</p>
                            <p class="text-xs text-slate-400">${req.hospitalAddress}</p>
                            ${req.patientDiagnosis ? `<p class="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80"><strong class="text-rose-400">Diagnosis:</strong> ${req.patientDiagnosis}</p>` : ''}
                        </div>

                        <!-- Status badge / Action -->
                        <div class="flex flex-col items-end gap-2">
                            <span class="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-slate-800 border border-slate-700 text-slate-300">
                                OTP: <strong class="text-amber-400 tracking-wider text-sm">${req.otp}</strong>
                            </span>
                            ${isAccepted ? `
                                <button onclick="window.chatManager.openChat('${req.id}')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 flex items-center gap-1.5 transition-all">
                                    <span>💬 Open Coordination Chat</span>
                                </button>
                            ` : `
                                <div class="text-right">
                                    <span class="text-xs font-bold text-rose-400 flex items-center gap-1">
                                        <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                        ${matchedCount} Donors Alerted
                                    </span>
                                    <p class="text-[10px] text-slate-400 mt-0.5">Awaiting first response</p>
                                </div>
                            `}
                        </div>
                    </div>

                    ${isAccepted ? `
                        <div class="mt-4 pt-3 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div class="flex items-center gap-2 text-emerald-300 font-medium">
                                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span>Accepted by <strong>${req.acceptedDonorName}</strong> (${req.acceptedDonorGroup})</span>
                                <span class="text-slate-400">• Contact: ${req.acceptedDonorPhone || '+91 98765 43210'}</span>
                            </div>
                            <span class="text-slate-400">ETA: ~20-25 mins</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Emergency SOS Broadcast Form submission
    const sosForm = document.getElementById('emergency-sos-form');
    if (sosForm) {
        sosForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(sosForm);

            const requestPayload = {
                patientName: formData.get('patientName') || 'Emergency Patient',
                requesterName: formData.get('requesterName') || 'Emergency Attendant',
                requesterPhone: formData.get('requesterPhone') || '+91 98450 11223',
                bloodGroup: formData.get('bloodGroup'),
                component: formData.get('component'),
                unitsNeeded: formData.get('unitsNeeded'),
                hospitalName: formData.get('hospitalName'),
                hospitalAddress: formData.get('hospitalAddress'),
                city: formData.get('city') || 'Bengaluru',
                pinCode: formData.get('pinCode') || '560001',
                urgency: formData.get('urgency') || 'CRITICAL',
                patientDiagnosis: formData.get('patientDiagnosis')
            };

            const createdReq = store.createRequest(requestPayload);
            sound.playSOS();
            showToast(`🚨 SOS Broadcasted to ${createdReq.notifiedDonorIds.length} eligible donors in radius!`, 'sos', 6000);
            
            // Re-render requester view and reset form
            sosForm.reset();
            renderRequesterView();
            
            if (window.mapManager) {
                window.mapManager.render(store.donors, store.bloodBanks, createdReq);
            }
        });
    }

    // =========================================================================
    // 2. DONOR VIEW LOGIC & 5-QUESTION EMERGENCY SCREENING
    // =========================================================================
    function renderDonorView() {
        const currentDonor = store.getCurrentDonor();
        const donorProfileCard = document.getElementById('donor-profile-summary');
        const donorFeedContainer = document.getElementById('donor-sos-feed');

        // Render Donor Profile Summary
        if (donorProfileCard && currentDonor) {
            const isVerified = currentDonor.verificationStatus === 'verified';
            donorProfileCard.innerHTML = `
                <div class="glass-card p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                        <div class="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-rose-900/30">
                            ${currentDonor.bloodGroup}
                            ${isVerified ? '<span class="absolute -bottom-1 -right-1 text-sm bg-emerald-500 rounded-full p-0.5">🛡️</span>' : ''}
                        </div>
                        <div>
                            <div class="flex items-center gap-2">
                                <h3 class="text-lg font-bold text-white">${currentDonor.fullName}</h3>
                                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                    isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }">
                                    ${isVerified ? `✓ Verified by ${currentDonor.verifiedBy || 'Blood Bank'}` : '⏳ Pending Blood Bank Verification'}
                                </span>
                            </div>
                            <p class="text-xs text-slate-400 mt-0.5">
                                Age: ${currentDonor.age} • ${currentDonor.gender} • ${currentDonor.area}, ${currentDonor.city}
                            </p>
                            <div class="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-300">
                                <span>🚗 Travel Radius: <strong>${currentDonor.travelDistanceKm} km</strong></span>
                                <span>🩸 Total Donations: <strong class="text-rose-400">${currentDonor.totalDonationsCount}</strong></span>
                                <span>⚡ Response Rate: <strong>${currentDonor.responseRate}</strong></span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <div class="text-right mr-2">
                            <span class="text-xs font-semibold ${currentDonor.isAvailable ? 'text-emerald-400' : 'text-slate-400'} block">
                                ${currentDonor.isAvailable ? '● Ready for SOS Alerts' : '○ On Standby / Unavailable'}
                            </span>
                            <span class="text-[10px] text-slate-500">Instant toggle</span>
                        </div>
                        <button id="toggle-donor-avail-btn" class="px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            currentDonor.isAvailable ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        }">
                            ${currentDonor.isAvailable ? 'Active' : 'Standby'}
                        </button>
                        <button onclick="window.openDonorCardModal('${currentDonor.id}')" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all">
                            <span>🪪 Digital Card</span>
                        </button>
                    </div>
                </div>
            `;

            // Setup availability toggle click
            const toggleAvailBtn = document.getElementById('toggle-donor-avail-btn');
            if (toggleAvailBtn) {
                toggleAvailBtn.addEventListener('click', () => {
                    const newStatus = store.toggleDonorAvailability(currentDonor.id);
                    renderDonorView();
                    showToast(newStatus ? 'You are now ACTIVE for nearby emergency alerts!' : 'Status changed to STANDBY. You will not receive pings.', 'info');
                });
            }
        }

        // Render Emergency Requests Alert Feed for this Donor
        if (donorFeedContainer && currentDonor) {
            // Find requests matching compatibility
            const matchedRequests = store.requests.filter(req => {
                return compat.isCompatible(req.bloodGroup, currentDonor.bloodGroup, req.component);
            });

            if (matchedRequests.length === 0) {
                donorFeedContainer.innerHTML = `
                    <div class="p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
                        <span class="text-3xl mb-2 block">🕊️</span>
                        <p class="text-base font-semibold text-slate-300">No emergency requests matching ${currentDonor.bloodGroup} right now</p>
                        <p class="text-xs text-slate-500 mt-1">Thank you for standing by. We will immediately ping you with a push notification when an urgent match is needed in your area.</p>
                    </div>
                `;
                return;
            }

            donorFeedContainer.innerHTML = matchedRequests.map(req => {
                const isAcceptedByMe = req.acceptedDonorId === currentDonor.id;
                const isAcceptedByOther = req.status === 'ACCEPTED' && !isAcceptedByMe;
                const isPending = req.status === 'BROADCASTING';

                return `
                    <div class="glass-card p-5 rounded-2xl border ${
                        isAcceptedByMe 
                            ? 'border-emerald-500/50 bg-emerald-950/20' 
                            : isAcceptedByOther 
                                ? 'border-slate-800 opacity-60' 
                                : 'border-rose-500/50 bg-rose-950/15'
                    } transition-all">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                                        isAcceptedByMe 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : isAcceptedByOther 
                                                ? 'bg-slate-700 text-slate-400' 
                                                : 'bg-rose-500/20 text-rose-400 animate-pulse'
                                    }">
                                        ${isAcceptedByMe ? '✓ YOU ACCEPTED THIS REQUEST' : isAcceptedByOther ? 'FULFILLED BY ANOTHER DONOR' : '🚨 EMERGENCY SOS PING'}
                                    </span>
                                    <span class="text-xs text-slate-400">${new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <h4 class="text-lg font-bold text-white mt-2">
                                    ${req.unitsNeeded} unit(s) of <span class="text-rose-400 font-black">${req.bloodGroup}</span> (${req.component})
                                </h4>
                                <p class="text-sm font-semibold text-slate-300 mt-0.5">🏥 ${req.hospitalName}</p>
                                <p class="text-xs text-slate-400">${req.hospitalAddress}</p>
                                ${req.patientDiagnosis ? `<p class="text-xs text-slate-300 mt-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800"><strong class="text-rose-400">Diagnosis:</strong> ${req.patientDiagnosis}</p>` : ''}
                            </div>

                            <div>
                                ${isAcceptedByMe ? `
                                    <button onclick="window.chatManager.openChat('${req.id}')" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg flex items-center gap-1.5 transition-all">
                                        <span>💬 Open Hospital Chat</span>
                                    </button>
                                ` : isAcceptedByOther ? `
                                    <span class="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                                        Fulfilled by another donor
                                    </span>
                                ` : `
                                    <button onclick="window.openScreeningModal('${req.id}')" class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 flex items-center gap-1.5 transition-all">
                                        <span>🩸 Respond & Screen Eligibility</span>
                                    </button>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Open the 5-Question Immediate Screening Modal
    window.openScreeningModal = function(requestId) {
        screeningRequestId = requestId;
        const modal = document.getElementById('donor-screening-modal');
        const req = store.requests.find(r => r.id === requestId);
        if (!modal || !req) return;

        const infoEl = document.getElementById('screening-request-info');
        if (infoEl) {
            infoEl.innerHTML = `
                <div class="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200">
                    Responding for: <strong>${req.unitsNeeded} unit(s) of ${req.bloodGroup} (${req.component})</strong> at <strong>${req.hospitalName}</strong>
                </div>
            `;
        }

        // Reset screening form radio buttons
        const form = document.getElementById('donor-screening-form');
        if (form) form.reset();

        const resultBox = document.getElementById('screening-result-box');
        if (resultBox) resultBox.classList.add('hidden');

        const acceptBtn = document.getElementById('screening-accept-btn');
        if (acceptBtn) {
            acceptBtn.disabled = true;
            acceptBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeScreeningModal = function() {
        const modal = document.getElementById('donor-screening-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        screeningRequestId = null;
    };

    // Screening Question Live Validation
    const screeningForm = document.getElementById('donor-screening-form');
    if (screeningForm) {
        screeningForm.addEventListener('change', () => {
            const formData = new FormData(screeningForm);
            const qFever = formData.get('q_fever');
            const qFoodSleep = formData.get('q_food_sleep');
            const qAlcoholSmoke = formData.get('q_alcohol_smoke');
            const qAntibiotics = formData.get('q_antibiotics');
            const qDonatedRecent = formData.get('q_donated_recent');

            const resultBox = document.getElementById('screening-result-box');
            const acceptBtn = document.getElementById('screening-accept-btn');

            // Check if all 5 answered
            if (!qFever || !qFoodSleep || !qAlcoholSmoke || !qAntibiotics || !qDonatedRecent) {
                return;
            }

            // Medical criteria:
            // Fever: NO
            // Food/Sleep: YES
            // Alcohol/Smoke: NO
            // Antibiotics: NO
            // Donated within 12/16 weeks: NO
            const isEligible = (
                qFever === 'no' &&
                qFoodSleep === 'yes' &&
                qAlcoholSmoke === 'no' &&
                qAntibiotics === 'no' &&
                qDonatedRecent === 'no'
            );

            resultBox.classList.remove('hidden');

            if (isEligible) {
                resultBox.className = 'p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs';
                resultBox.innerHTML = `
                    <div class="flex items-center gap-2 font-bold text-sm text-emerald-400">
                        <span>✓</span>
                        <span>Safety Screening Passed: You are eligible to donate!</span>
                    </div>
                    <p class="mt-1 text-slate-300">Click below to commit your donation. The requester and hospital will be immediately notified, and live coordination chat will unlock.</p>
                `;
                acceptBtn.disabled = false;
                acceptBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                resultBox.className = 'p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs';
                resultBox.innerHTML = `
                    <div class="flex items-center gap-2 font-bold text-sm text-amber-400">
                        <span>⚠️</span>
                        <span>Temporary Deferral Notice</span>
                    </div>
                    <p class="mt-1 text-slate-300">For patient safety and your own health, blood donation requires full recovery from infection/antibiotics, adequate nourishment, and mandatory interval spacing. Thank you for your honesty!</p>
                `;
                acceptBtn.disabled = true;
                acceptBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        // Submit accept emergency donation
        screeningForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!screeningRequestId) return;

            const currentDonor = store.getCurrentDonor();
            const success = store.acceptRequest(screeningRequestId, currentDonor.id);

            if (success) {
                sound.playSuccess();
                window.closeScreeningModal();
                showToast(`🎉 Lifesaver confirmed! You accepted the request. Hospital has been notified.`, 'success', 6000);
                renderDonorView();
                // Open chat window
                setTimeout(() => {
                    chat.openChat(screeningRequestId);
                }, 500);
            }
        });
    }

    // Donor Comprehensive Registration / Onboarding Form Submission
    const donorRegForm = document.getElementById('donor-registration-form');
    if (donorRegForm) {
        donorRegForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(donorRegForm);

            // Medical history checkboxes
            const medicalConditions = {
                diabetesOrHypertension: formData.get('med_diabetes_heart') === 'on',
                cancerOrBloodDisease: formData.get('med_cancer_blood') === 'on',
                liverOrKidneyOrNeuro: formData.get('med_liver_kidney_neuro') === 'on',
                hepatitisOrJaundiceOrHIVRisk: formData.get('med_hepatitis_hiv') === 'on',
                majorSurgeryPast6Months: formData.get('med_surgery_6months') === 'on',
                rabiesOrHepBInYear: formData.get('med_rabies_hepb') === 'on'
            };

            const donorPayload = {
                fullName: formData.get('fullName'),
                dob: formData.get('dob'),
                age: parseInt(formData.get('age')) || 25,
                gender: formData.get('gender'),
                bloodGroup: formData.get('bloodGroup'),
                phone: formData.get('phone'),
                area: formData.get('area'),
                city: formData.get('city') || 'Bengaluru',
                state: formData.get('state') || 'Karnataka',
                pinCode: formData.get('pinCode'),
                travelDistanceKm: formData.get('travelDistanceKm') || 15,
                donatedBefore: formData.get('donatedBefore') === 'yes',
                lastDonationDate: formData.get('lastDonationDate') || '',
                hadComplications: formData.get('hadComplications') === 'yes',
                complicationNotes: formData.get('complicationNotes') || '',
                isPregnantOrNursing: formData.get('isPregnantOrNursing') === 'yes',
                vaccinatedLastMonth: formData.get('vaccinatedLastMonth') === 'yes',
                medicalConditions: medicalConditions,
                selectedBloodBankId: formData.get('selectedBloodBankId') || 'bank-1',
                consentContact: formData.get('consentContact') === 'on',
                consentShareLimitedDetails: formData.get('consentShareLimitedDetails') === 'on'
            };

            const registeredDonor = store.registerDonor(donorPayload);
            sound.playSuccess();
            showToast(`✓ Welcome ${registeredDonor.fullName}! Registration submitted. Your profile is queued for verification at ${store.bloodBanks.find(b => b.id === registeredDonor.selectedBloodBankId)?.name || 'the blood bank'}.`, 'success', 6000);
            
            // Switch to donor dashboard tab and refresh
            renderDonorView();
            donorRegForm.reset();
            window.closeDonorRegModal();
        });
    }

    // Open / Close Donor Registration Modal
    window.openDonorRegModal = function() {
        const modal = document.getElementById('donor-registration-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            // Populate Blood Banks dropdown
            const selectEl = document.getElementById('reg-blood-bank-select');
            if (selectEl) {
                selectEl.innerHTML = store.bloodBanks.map(b => `
                    <option value="${b.id}">${b.name} (${b.city})</option>
                `).join('');
            }
        }
    };

    window.closeDonorRegModal = function() {
        const modal = document.getElementById('donor-registration-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // Donor Digital Health Card Modal
    window.openDonorCardModal = function(donorId) {
        const modal = document.getElementById('donor-card-modal');
        const donor = store.donors.find(d => d.id === donorId) || store.getCurrentDonor();
        if (!modal || !donor) return;

        const container = document.getElementById('donor-card-print-area');
        if (container) {
            const isVerified = donor.verificationStatus === 'verified';
            container.innerHTML = `
                <div class="relative bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-6 rounded-3xl border border-rose-500/30 text-white shadow-2xl overflow-hidden">
                    <div class="absolute -right-8 -top-8 w-40 h-40 bg-rose-600/20 rounded-full blur-2xl"></div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🩸</span>
                            <span class="font-black text-lg tracking-wider text-rose-400">HEMOPULSE</span>
                        </div>
                        <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isVerified ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/50' : 'bg-amber-500/30 text-amber-300 border border-amber-400/50'
                        }">
                            ${isVerified ? '✓ CERTIFIED DONOR' : 'PENDING VERIFICATION'}
                        </span>
                    </div>

                    <div class="mt-6 flex items-center justify-between">
                        <div>
                            <span class="text-[10px] uppercase tracking-wider text-slate-400">Full Name</span>
                            <h3 class="text-xl font-bold">${donor.fullName}</h3>
                            <p class="text-xs text-slate-300 mt-0.5">ID: HP-${donor.id.toUpperCase()}</p>
                        </div>
                        <div class="w-16 h-16 rounded-2xl bg-rose-600/30 border border-rose-500/50 flex flex-col items-center justify-center">
                            <span class="text-[9px] uppercase font-bold text-rose-300">Blood Group</span>
                            <span class="text-2xl font-black text-white">${donor.bloodGroup}</span>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                        <div class="bg-slate-800/50 p-2 rounded-xl">
                            <span class="text-[10px] text-slate-400 block">Donations</span>
                            <span class="font-bold text-rose-400 text-sm">${donor.totalDonationsCount}</span>
                        </div>
                        <div class="bg-slate-800/50 p-2 rounded-xl">
                            <span class="text-[10px] text-slate-400 block">Radius</span>
                            <span class="font-bold text-slate-200 text-sm">${donor.travelDistanceKm} km</span>
                        </div>
                        <div class="bg-slate-800/50 p-2 rounded-xl">
                            <span class="text-[10px] text-slate-400 block">Verified By</span>
                            <span class="font-bold text-emerald-400 text-[10px] truncate block">${donor.verifiedBy ? 'Apex Red Cross' : 'Pending'}</span>
                        </div>
                    </div>
                </div>
            `;
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    };

    window.closeDonorCardModal = function() {
        const modal = document.getElementById('donor-card-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // =========================================================================
    // 3. BLOOD BANK / HOSPITAL VIEW LOGIC
    // =========================================================================
    function renderBloodBankView() {
        const currentBank = store.getCurrentBank();
        const bankHeader = document.getElementById('bloodbank-header-summary');
        const inventoryTable = document.getElementById('bloodbank-inventory-body');
        const verificationQueue = document.getElementById('bloodbank-verification-queue');

        // Header info
        if (bankHeader && currentBank) {
            bankHeader.innerHTML = `
                <div class="glass-card p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🏥</span>
                            <h3 class="text-xl font-bold text-white">${currentBank.name}</h3>
                            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                License: ${currentBank.license}
                            </span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1">${currentBank.address}, ${currentBank.city} • PIN: ${currentBank.pinCode}</p>
                        <p class="text-xs text-slate-300 mt-0.5">📞 Helpline: <strong class="text-white">${currentBank.phone}</strong> • ${currentBank.operatingHours}</p>
                    </div>

                    <!-- Switch Blood Bank Demo Select -->
                    <div class="flex items-center gap-2">
                        <label class="text-xs text-slate-400">Switch Facility:</label>
                        <select id="switch-bank-select" class="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2">
                            ${store.bloodBanks.map(b => `
                                <option value="${b.id}" ${b.id === currentBank.id ? 'selected' : ''}>${b.name}</option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            `;

            const selectBank = document.getElementById('switch-bank-select');
            if (selectBank) {
                selectBank.addEventListener('change', (e) => {
                    store.currentBankId = e.target.value;
                    store.save();
                    renderBloodBankView();
                });
            }
        }

        // Inventory Table Matrix (8 Groups x 5 Components)
        if (inventoryTable && currentBank) {
            const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
            
            inventoryTable.innerHTML = groups.map(grp => {
                const stock = currentBank.inventory[grp] || { wholeBlood: 0, prbc: 0, platelets: 0, ffp: 0, cryo: 0 };
                
                // Helper to render cell with +/- buttons
                const makeCell = (componentKey, value) => {
                    const isLow = value < 3;
                    return `
                        <div class="flex items-center justify-center gap-1.5 py-1">
                            <button onclick="window.adjustInventory('${currentBank.id}', '${grp}', '${componentKey}', -1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center transition-all">-</button>
                            <span class="w-8 text-center font-bold text-sm ${isLow ? 'text-rose-400 font-black underline' : 'text-slate-100'}">${value}</span>
                            <button onclick="window.adjustInventory('${currentBank.id}', '${grp}', '${componentKey}', 1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center transition-all">+</button>
                        </div>
                    `;
                };

                return `
                    <tr class="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                        <td class="p-3 font-black text-rose-400 text-sm bg-slate-900/40">${grp}</td>
                        <td class="p-2">${makeCell('wholeBlood', stock.wholeBlood || 0)}</td>
                        <td class="p-2">${makeCell('prbc', stock.prbc || 0)}</td>
                        <td class="p-2">${makeCell('platelets', stock.platelets || 0)}</td>
                        <td class="p-2">${makeCell('ffp', stock.ffp || 0)}</td>
                        <td class="p-2">${makeCell('cryo', stock.cryo || 0)}</td>
                    </tr>
                `;
            }).join('');
        }

        // Verification Queue: Donors who selected this bank for verification
        if (verificationQueue && currentBank) {
            const pendingDonors = store.donors.filter(d => d.selectedBloodBankId === currentBank.id);

            if (pendingDonors.length === 0) {
                verificationQueue.innerHTML = `
                    <div class="p-6 text-center text-slate-400 bg-slate-900/60 rounded-xl">
                        <p class="text-sm">No donors currently assigned to this blood bank for verification.</p>
                    </div>
                `;
                return;
            }

            verificationQueue.innerHTML = pendingDonors.map(donor => {
                const isVerified = donor.verificationStatus === 'verified';

                return `
                    <div class="glass-card p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center font-black text-rose-400 text-sm">
                                ${donor.bloodGroup}
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h4 class="font-bold text-white text-sm">${donor.fullName}</h4>
                                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                                        isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                                    }">
                                        ${isVerified ? '✓ Verified' : 'Pending Verification'}
                                    </span>
                                </div>
                                <p class="text-xs text-slate-400">
                                    Age: ${donor.age} • ${donor.gender} • ${donor.area} • Phone: ${donor.phone}
                                </p>
                                <p class="text-[11px] text-slate-400 mt-1">
                                    Prior donations: ${donor.donatedBefore ? 'Yes' : 'First-time'} • Complications: ${donor.hadComplications ? donor.complicationNotes : 'None reported'}
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            ${isVerified ? `
                                <button onclick="window.revokeDonorVerification('${donor.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
                                    Revoke Badge
                                </button>
                            ` : `
                                <button onclick="window.approveDonorVerification('${donor.id}')" class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1">
                                    <span>✓ Approve & Issue Badge</span>
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Inventory adjustment helper
    window.adjustInventory = function(bankId, bloodGroup, componentKey, delta) {
        store.updateInventory(bankId, bloodGroup, componentKey, delta, true);
        renderBloodBankView();
    };

    // Verification approve
    window.approveDonorVerification = function(donorId) {
        const currentBank = store.getCurrentBank();
        store.setDonorVerification(donorId, 'verified', currentBank.name);
        sound.playSuccess();
        showToast('✓ Donor successfully verified! Official badge issued.', 'success');
        renderBloodBankView();
    };

    // Verification revoke
    window.revokeDonorVerification = function(donorId) {
        store.setDonorVerification(donorId, 'pending', null);
        showToast('Donor verification badge revoked.', 'info');
        renderBloodBankView();
    };

    // =========================================================================
    // 4. SEARCHABLE PUBLIC DIRECTORY VIEW
    // =========================================================================
    function renderDirectoryView() {
        const directoryList = document.getElementById('directory-results-container');
        const filterGroup = document.getElementById('dir-filter-blood-group');
        const filterType = document.getElementById('dir-filter-type');
        const filterVerifiedOnly = document.getElementById('dir-filter-verified-only');
        const searchInput = document.getElementById('dir-search-input');

        if (!directoryList) return;

        const selectedGroup = filterGroup ? filterGroup.value : 'ALL';
        const selectedType = filterType ? filterType.value : 'ALL'; // 'ALL', 'DONORS', 'BANKS'
        const verifiedOnly = filterVerifiedOnly ? filterVerifiedOnly.checked : false;
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        const results = [];

        // 1. Process Donors
        if (selectedType === 'ALL' || selectedType === 'DONORS') {
            store.donors.forEach(donor => {
                if (selectedGroup !== 'ALL' && donor.bloodGroup !== selectedGroup) return;
                if (verifiedOnly && donor.verificationStatus !== 'verified') return;
                if (query && !donor.fullName.toLowerCase().includes(query) && !donor.area.toLowerCase().includes(query) && !donor.city.toLowerCase().includes(query)) return;

                results.push({
                    type: 'donor',
                    data: donor
                });
            });
        }

        // 2. Process Blood Banks
        if (selectedType === 'ALL' || selectedType === 'BANKS') {
            store.bloodBanks.forEach(bank => {
                if (query && !bank.name.toLowerCase().includes(query) && !bank.address.toLowerCase().includes(query) && !bank.city.toLowerCase().includes(query)) return;

                // Check group units if specific group is filtered
                let unitsForGroup = null;
                if (selectedGroup !== 'ALL') {
                    const inv = bank.inventory[selectedGroup];
                    if (inv) {
                        unitsForGroup = (inv.wholeBlood || 0) + (inv.prbc || 0) + (inv.platelets || 0) + (inv.ffp || 0) + (inv.cryo || 0);
                    }
                }

                results.push({
                    type: 'bank',
                    data: bank,
                    unitsForGroup
                });
            });
        }

        if (results.length === 0) {
            directoryList.innerHTML = `
                <div class="col-span-full p-8 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
                    <p class="text-base font-semibold text-slate-300">No matching donors or blood banks found</p>
                    <p class="text-xs text-slate-500 mt-1">Try broadening your search filters or blood group selection.</p>
                </div>
            `;
            return;
        }

        directoryList.innerHTML = results.map(item => {
            if (item.type === 'donor') {
                const donor = item.data;
                const isVerified = donor.verificationStatus === 'verified';

                return `
                    <div class="glass-card p-5 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span class="w-10 h-10 rounded-xl bg-rose-600 text-white font-black flex items-center justify-center text-base shadow">
                                        ${donor.bloodGroup}
                                    </span>
                                    <div>
                                        <h4 class="font-bold text-white text-base">${donor.fullName}</h4>
                                        <span class="text-xs text-slate-400">${donor.area}, ${donor.city}</span>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                    isVerified ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                                }">
                                    ${isVerified ? '✓ Verified' : 'Individual'}
                                </span>
                            </div>

                            <div class="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                                <p>🚗 Willing to travel: <strong>${donor.travelDistanceKm} km</strong></p>
                                <p>⚡ Response Rate: <strong>${donor.responseRate}</strong> (avg ~${donor.avgResponseMinutes}m)</p>
                                <p>🩸 Total donations: <strong>${donor.totalDonationsCount}</strong></p>
                            </div>
                        </div>

                        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                            <span class="text-xs font-semibold ${donor.isAvailable ? 'text-emerald-400' : 'text-slate-500'}">
                                ${donor.isAvailable ? '● Available' : '○ Standby'}
                            </span>
                            <button onclick="window.initiateDirectRequest('${donor.bloodGroup}', '${donor.fullName}')" class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md">
                                Request Blood
                            </button>
                        </div>
                    </div>
                `;
            } else {
                const bank = item.data;
                return `
                    <div class="glass-card p-5 rounded-2xl border border-blue-900/40 hover:border-blue-500/40 transition-all flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span class="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xl shadow">
                                        🏥
                                    </span>
                                    <div>
                                        <h4 class="font-bold text-white text-base">${bank.name}</h4>
                                        <span class="text-xs text-slate-400">${bank.address}</span>
                                    </div>
                                </div>
                                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                    24x7 Certified
                                </span>
                            </div>

                            <div class="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300 space-y-1">
                                <p>📞 Helpline: <strong class="text-blue-300">${bank.phone}</strong></p>
                                <p>🕒 Hours: <strong>${bank.operatingHours}</strong></p>
                                ${item.unitsForGroup !== null ? `
                                    <p class="text-emerald-400 font-bold mt-1 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/20">
                                        ${selectedGroup} Total Available: ${item.unitsForGroup} units
                                    </p>
                                ` : ''}
                            </div>
                        </div>

                        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                            <span class="text-xs text-slate-400">License: ${bank.license}</span>
                            <a href="tel:${bank.phone}" class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md">
                                Call Helpline
                            </a>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    // Directory filter listeners
    ['dir-filter-blood-group', 'dir-filter-type', 'dir-filter-verified-only', 'dir-search-input'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', renderDirectoryView);
            el.addEventListener('change', renderDirectoryView);
        }
    });

    // Helper: Request blood directly from directory card
    window.initiateDirectRequest = function(bloodGroup, donorName) {
        switchTab('requester');
        const grpSelect = document.querySelector('#emergency-sos-form select[name="bloodGroup"]');
        if (grpSelect) grpSelect.value = bloodGroup;
        showToast(`Prefilled emergency request for ${bloodGroup}. Complete hospital details and broadcast.`, 'info');
    };

    // =========================================================================
    // 5. DEMO SCENARIO & GLOBAL CONTROLS
    // =========================================================================
    const quickDemoBtn = document.getElementById('quick-demo-scenario-btn');
    if (quickDemoBtn) {
        quickDemoBtn.addEventListener('click', () => {
            const demoReq = {
                patientName: 'Sunita Mehra (Critical ICU)',
                requesterName: 'Dr. Ramesh (Attending Physician)',
                requesterPhone: '+91 98450 11223',
                bloodGroup: 'O+',
                component: 'Platelets',
                unitsNeeded: 2,
                hospitalName: 'Manipal Hospital, HAL Old Airport Rd',
                hospitalAddress: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
                city: 'Bengaluru',
                pinCode: '560017',
                urgency: 'CRITICAL',
                patientDiagnosis: 'Severe Dengue with Platelet count < 18,000/μL. Active bleeding.'
            };

            const created = store.createRequest(demoReq);
            sound.playSOS();
            showToast('⚡ DEMO TRIGGERED: Emergency Platelet request broadcasted to all nearby O+ & O- donors!', 'sos', 6000);
            switchTab('requester');
        });
    }

    const resetDemoBtn = document.getElementById('reset-demo-btn');
    if (resetDemoBtn) {
        resetDemoBtn.addEventListener('click', () => {
            if (confirm('Reset all demo requests, inventories, and donor data to default state?')) {
                store.resetToDefaults(true);
                showToast('State successfully reset to initial hackathon defaults.', 'info');
                switchTab('home');
            }
        });
    }

    // Role selection modal on home page
    window.openRoleSelectionModal = function(roleType) {
        if (roleType === 'requester') {
            switchTab('requester');
        } else if (roleType === 'donor') {
            const modal = document.getElementById('donor-choice-modal');
            if (modal) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            }
        }
    };

    window.closeDonorChoiceModal = function() {
        const modal = document.getElementById('donor-choice-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // Blood Compatibility Matrix Modal
    window.openCompatibilityModal = function() {
        const modal = document.getElementById('compatibility-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            window.updateCompatibilityTable('O+');
        }
    };

    window.closeCompatibilityModal = function() {
        const modal = document.getElementById('compatibility-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    window.updateCompatibilityTable = function(selectedGroup) {
        const redDonors = compat.getCompatibleDonors(selectedGroup, 'Whole Blood');
        const plasmaDonors = compat.getCompatibleDonors(selectedGroup, 'Fresh Frozen Plasma');
        const plateletDonors = compat.getCompatibleDonors(selectedGroup, 'Platelets');

        const badgeList = (arr) => arr.map(g => `
            <span class="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-sm">${g}</span>
        `).join('');

        const container = document.getElementById('compat-matrix-display');
        if (container) {
            container.innerHTML = `
                <div class="space-y-4">
                    <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span class="text-xs uppercase font-bold text-rose-400 block mb-1.5">Whole Blood & Packed Red Cells (PRBC)</span>
                        <div class="flex flex-wrap gap-1.5">${badgeList(redDonors)}</div>
                        <p class="text-[11px] text-slate-400 mt-2">Compatible based on ABO & Rh antigen presence. (O- is universal donor)</p>
                    </div>

                    <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span class="text-xs uppercase font-bold text-amber-400 block mb-1.5">Platelets (SDP / RDP)</span>
                        <div class="flex flex-wrap gap-1.5">${badgeList(plateletDonors)}</div>
                        <p class="text-[11px] text-slate-400 mt-2">Prefers identical group first, then plasma-compatible group.</p>
                    </div>

                    <div class="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                        <span class="text-xs uppercase font-bold text-blue-400 block mb-1.5">Fresh Frozen Plasma (FFP)</span>
                        <div class="flex flex-wrap gap-1.5">${badgeList(plasmaDonors)}</div>
                        <p class="text-[11px] text-slate-400 mt-2">Reverse rule: AB is the universal plasma donor!</p>
                    </div>
                </div>
            `;
        }
    };

    // Component Shelf Life Modal
    window.openComponentGuideModal = function() {
        const modal = document.getElementById('component-guide-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    };

    window.closeComponentGuideModal = function() {
        const modal = document.getElementById('component-guide-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    // Chat Message Form
    const chatForm = document.getElementById('chat-input-form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-text-input');
            if (input && input.value) {
                chat.sendMessage(input.value);
                input.value = '';
            }
        });
    }

    // Subscribe to store updates for reactive updates
    store.subscribe((event, data) => {
        if (event === 'request_accepted' || event === 'sos_broadcast') {
            if (activeTab === 'requester') renderRequesterView();
            if (activeTab === 'donor') renderDonorView();
            if (window.mapManager) {
                const activeReq = store.requests.find(r => r.status === 'BROADCASTING' || r.status === 'ACCEPTED') || store.requests[0];
                window.mapManager.render(store.donors, store.bloodBanks, activeReq);
            }
        }
    });

    // Initial setup
    switchTab('home');
});
