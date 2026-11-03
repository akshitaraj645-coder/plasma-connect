/**
 * HemoPulse - Central Reactive Store & State Machine
 * Manages Donors, Blood Banks, Inventories, SOS Requests, Verification Queues,
 * Realtime Event Bus, and LocalStorage persistence.
 */

const INITIAL_DONORS = [
    {
        id: 'donor-1',
        fullName: 'Rahul Sharma',
        dob: '1998-04-12',
        age: 28,
        gender: 'Male',
        bloodGroup: 'O+',
        phone: '+91 98765 43210',
        area: 'Koramangala, 5th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560095',
        travelDistanceKm: 15,
        lat: 12.9352,
        lng: 77.6245,
        donatedBefore: true,
        lastDonationDate: '2026-05-10',
        hadComplications: false,
        complicationNotes: '',
        isPregnantOrNursing: false,
        vaccinatedLastMonth: false,
        medicalConditions: {
            diabetesOrHypertension: false,
            cancerOrBloodDisease: false,
            liverOrKidneyOrNeuro: false,
            hepatitisOrJaundiceOrHIVRisk: false,
            majorSurgeryPast6Months: false,
            rabiesOrHepBInYear: false
        },
        selectedBloodBankId: 'bank-1',
        verificationStatus: 'verified', // 'verified', 'pending', 'rejected'
        verifiedBy: 'Apex Metro Red Cross Blood Bank',
        verifiedAt: '2026-06-15',
        isAvailable: true,
        totalDonationsCount: 6,
        consentContact: true,
        consentShareLimitedDetails: true,
        responseRate: '98%',
        avgResponseMinutes: 4
    },
    {
        id: 'donor-2',
        fullName: 'Priya Patel',
        dob: '2001-08-22',
        age: 25,
        gender: 'Female',
        bloodGroup: 'B-',
        phone: '+91 98123 45678',
        area: 'Indiranagar, 100ft Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560038',
        travelDistanceKm: 20,
        lat: 12.9784,
        lng: 77.6408,
        donatedBefore: true,
        lastDonationDate: '2026-04-01',
        hadComplications: false,
        complicationNotes: '',
        isPregnantOrNursing: false,
        vaccinatedLastMonth: false,
        medicalConditions: {
            diabetesOrHypertension: false,
            cancerOrBloodDisease: false,
            liverOrKidneyOrNeuro: false,
            hepatitisOrJaundiceOrHIVRisk: false,
            majorSurgeryPast6Months: false,
            rabiesOrHepBInYear: false
        },
        selectedBloodBankId: 'bank-2',
        verificationStatus: 'verified',
        verifiedBy: 'St. John Memorial Regional Blood Centre',
        verifiedAt: '2026-07-20',
        isAvailable: true,
        totalDonationsCount: 4,
        consentContact: true,
        consentShareLimitedDetails: true,
        responseRate: '100%',
        avgResponseMinutes: 3
    },
    {
        id: 'donor-3',
        fullName: 'Arjun Verma',
        dob: '1995-11-05',
        age: 31,
        gender: 'Male',
        bloodGroup: 'O-', // Universal donor!
        phone: '+91 97456 12389',
        area: 'Whitefield Main Rd',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560066',
        travelDistanceKm: 25,
        lat: 12.9698,
        lng: 77.7499,
        donatedBefore: true,
        lastDonationDate: '2026-02-14',
        hadComplications: false,
        complicationNotes: '',
        isPregnantOrNursing: false,
        vaccinatedLastMonth: false,
        medicalConditions: {
            diabetesOrHypertension: false,
            cancerOrBloodDisease: false,
            liverOrKidneyOrNeuro: false,
            hepatitisOrJaundiceOrHIVRisk: false,
            majorSurgeryPast6Months: false,
            rabiesOrHepBInYear: false
        },
        selectedBloodBankId: 'bank-1',
        verificationStatus: 'pending', // Pending verification demo!
        verifiedBy: null,
        verifiedAt: null,
        isAvailable: true,
        totalDonationsCount: 2,
        consentContact: true,
        consentShareLimitedDetails: true,
        responseRate: '95%',
        avgResponseMinutes: 5
    },
    {
        id: 'donor-4',
        fullName: 'Ananya Rao',
        dob: '1999-01-30',
        age: 27,
        gender: 'Female',
        bloodGroup: 'AB+', // Universal Recipient / Plasma Donor
        phone: '+91 99011 22334',
        area: 'Jayanagar 4th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560011',
        travelDistanceKm: 10,
        lat: 12.9250,
        lng: 77.5938,
        donatedBefore: true,
        lastDonationDate: '2026-06-01',
        hadComplications: false,
        complicationNotes: '',
        isPregnantOrNursing: false,
        vaccinatedLastMonth: false,
        medicalConditions: {
            diabetesOrHypertension: false,
            cancerOrBloodDisease: false,
            liverOrKidneyOrNeuro: false,
            hepatitisOrJaundiceOrHIVRisk: false,
            majorSurgeryPast6Months: false,
            rabiesOrHepBInYear: false
        },
        selectedBloodBankId: 'bank-3',
        verificationStatus: 'verified',
        verifiedBy: 'City Life Care Blood Bank & Research',
        verifiedAt: '2026-05-18',
        isAvailable: true,
        totalDonationsCount: 5,
        consentContact: true,
        consentShareLimitedDetails: true,
        responseRate: '92%',
        avgResponseMinutes: 6
    },
    {
        id: 'donor-5',
        fullName: 'Karthik Nair',
        dob: '2000-09-14',
        age: 26,
        gender: 'Male',
        bloodGroup: 'A+',
        phone: '+91 98860 99887',
        area: 'HSR Layout Sector 2',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560102',
        travelDistanceKm: 12,
        lat: 12.9121,
        lng: 77.6446,
        donatedBefore: false,
        lastDonationDate: null,
        hadComplications: false,
        complicationNotes: '',
        isPregnantOrNursing: false,
        vaccinatedLastMonth: false,
        medicalConditions: {
            diabetesOrHypertension: false,
            cancerOrBloodDisease: false,
            liverOrKidneyOrNeuro: false,
            hepatitisOrJaundiceOrHIVRisk: false,
            majorSurgeryPast6Months: false,
            rabiesOrHepBInYear: false
        },
        selectedBloodBankId: 'bank-1',
        verificationStatus: 'pending',
        verifiedBy: null,
        verifiedAt: null,
        isAvailable: true,
        totalDonationsCount: 0,
        consentContact: true,
        consentShareLimitedDetails: true,
        responseRate: '100%',
        avgResponseMinutes: 2
    }
];

const INITIAL_BLOOD_BANKS = [
    {
        id: 'bank-1',
        name: 'Apex Metro Red Cross Blood Centre',
        license: 'KA-BB-2023-8841',
        phone: '+91 80 2553 4400',
        helpline: '1800-425-4366 (Toll Free 24x7)',
        email: 'emergency@apexredcross.org',
        address: 'No. 22, Hospital Rd, Shivajinagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560001',
        operatingHours: '24 Hours / 7 Days',
        is24x7: true,
        lat: 12.9856,
        lng: 77.6057,
        verifiedStatus: true,
        // Inventory Units [Whole Blood, PRBC, Platelets, FFP, Cryoprecipitate]
        inventory: {
            'A+':  { wholeBlood: 14, prbc: 22, platelets: 6,  ffp: 18, cryo: 5 },
            'A-':  { wholeBlood: 4,  prbc: 7,  platelets: 2,  ffp: 6,  cryo: 2 },
            'B+':  { wholeBlood: 18, prbc: 30, platelets: 8,  ffp: 20, cryo: 8 },
            'B-':  { wholeBlood: 3,  prbc: 5,  platelets: 1,  ffp: 4,  cryo: 1 },
            'AB+': { wholeBlood: 8,  prbc: 12, platelets: 4,  ffp: 14, cryo: 4 },
            'AB-': { wholeBlood: 2,  prbc: 3,  platelets: 0,  ffp: 3,  cryo: 1 },
            'O+':  { wholeBlood: 25, prbc: 38, platelets: 10, ffp: 25, cryo: 9 },
            'O-':  { wholeBlood: 3,  prbc: 4,  platelets: 1,  ffp: 5,  cryo: 2 }
        }
    },
    {
        id: 'bank-2',
        name: 'St. John Memorial Regional Blood Centre',
        license: 'KA-BB-2021-3910',
        phone: '+91 80 4946 6000',
        helpline: '+91 80 2206 5000',
        email: 'bloodcentre@stjohns.edu',
        address: 'Koramangala 2nd Block, Sarjapur Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560034',
        operatingHours: '24 Hours / 7 Days',
        is24x7: true,
        lat: 12.9304,
        lng: 77.6208,
        verifiedStatus: true,
        inventory: {
            'A+':  { wholeBlood: 10, prbc: 16, platelets: 4,  ffp: 12, cryo: 3 },
            'A-':  { wholeBlood: 2,  prbc: 4,  platelets: 1,  ffp: 4,  cryo: 1 },
            'B+':  { wholeBlood: 12, prbc: 20, platelets: 5,  ffp: 16, cryo: 6 },
            'B-':  { wholeBlood: 1,  prbc: 3,  platelets: 0,  ffp: 2,  cryo: 0 },
            'AB+': { wholeBlood: 5,  prbc: 8,  platelets: 3,  ffp: 9,  cryo: 2 },
            'AB-': { wholeBlood: 1,  prbc: 2,  platelets: 0,  ffp: 2,  cryo: 0 },
            'O+':  { wholeBlood: 16, prbc: 24, platelets: 7,  ffp: 18, cryo: 7 },
            'O-':  { wholeBlood: 2,  prbc: 3,  platelets: 1,  ffp: 3,  cryo: 1 }
        }
    },
    {
        id: 'bank-3',
        name: 'City Life Care Blood Bank & Research',
        license: 'KA-BB-2024-1102',
        phone: '+91 80 6711 9999',
        helpline: '+91 94808 22100',
        email: 'bloodtransfusion@citylifecare.org',
        address: '9th Main, Jayanagar 3rd Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        pinCode: '560011',
        operatingHours: '24 Hours / 7 Days',
        is24x7: true,
        lat: 12.9317,
        lng: 77.5834,
        verifiedStatus: true,
        inventory: {
            'A+':  { wholeBlood: 8,  prbc: 14, platelets: 3,  ffp: 10, cryo: 2 },
            'A-':  { wholeBlood: 3,  prbc: 5,  platelets: 1,  ffp: 3,  cryo: 1 },
            'B+':  { blood: 15,    prbc: 22, platelets: 6,  ffp: 15, cryo: 5 },
            'B-':  { wholeBlood: 2,  prbc: 4,  platelets: 1,  ffp: 3,  cryo: 1 },
            'AB+': { wholeBlood: 6,  prbc: 9,  platelets: 2,  ffp: 8,  cryo: 3 },
            'AB-': { wholeBlood: 1,  prbc: 2,  platelets: 0,  ffp: 1,  cryo: 0 },
            'O+':  { wholeBlood: 20, prbc: 28, platelets: 8,  ffp: 22, cryo: 6 },
            'O-':  { wholeBlood: 1,  prbc: 2,  platelets: 0,  ffp: 2,  cryo: 0 }
        }
    }
];

const INITIAL_REQUESTS = [
    {
        id: 'req-demo-1',
        patientName: 'Sunita Mehra',
        requesterName: 'Dr. Ramesh (Attending Physician)',
        requesterPhone: '+91 98450 11223',
        bloodGroup: 'O+',
        component: 'Platelets',
        unitsNeeded: 2,
        hospitalName: 'Manipal Hospital, HAL Old Airport Rd',
        hospitalAddress: '98, HAL Old Airport Rd, Kodihalli, Bengaluru',
        city: 'Bengaluru',
        pinCode: '560017',
        lat: 12.9584,
        lng: 77.6534,
        urgency: 'CRITICAL', // 'CRITICAL', 'URGENT', 'STANDARD'
        patientDiagnosis: 'Severe Dengue with Platelet count < 18,000/μL. Active epistaxis.',
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(), // 25 mins ago
        status: 'BROADCASTING', // 'BROADCASTING', 'ACCEPTED', 'FULFILLED', 'CANCELLED'
        otp: '4821', // Bedside verification handshake OTP
        notifiedDonorIds: ['donor-1', 'donor-2', 'donor-3', 'donor-5'],
        acceptedDonorId: null,
        acceptedDonorName: null,
        acceptedAt: null
    }
];

const INITIAL_CHATS = {
    'req-demo-1': [
        {
            sender: 'requester',
            senderName: 'Dr. Ramesh (Hospital ICU Coordinator)',
            text: 'Urgent: Patient is in ICU-3 Bed 12 with acute platelet drop. Blood bank has ran out of SDP units.',
            timestamp: new Date(Date.now() - 20 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]
};

class Store {
    constructor() {
        this.STORAGE_KEY = 'hemopulse_v2_data';
        this.listeners = [];
        this.load();
    }

    load() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.donors = parsed.donors || INITIAL_DONORS;
                this.bloodBanks = parsed.bloodBanks || INITIAL_BLOOD_BANKS;
                this.requests = parsed.requests || INITIAL_REQUESTS;
                this.chats = parsed.chats || INITIAL_CHATS;
                this.currentDonorId = parsed.currentDonorId || 'donor-1';
                this.currentBankId = parsed.currentBankId || 'bank-1';
                this.activeRole = parsed.activeRole || 'home';
                return;
            } catch (e) {
                console.error('Failed to parse saved state, resetting', e);
            }
        }
        this.resetToDefaults(false);
    }

    save() {
        const payload = {
            donors: this.donors,
            bloodBanks: this.bloodBanks,
            requests: this.requests,
            chats: this.chats,
            currentDonorId: this.currentDonorId,
            currentBankId: this.currentBankId,
            activeRole: this.activeRole
        };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
        this.emit('change', payload);
    }

    resetToDefaults(triggerEvent = true) {
        this.donors = JSON.parse(JSON.stringify(INITIAL_DONORS));
        this.bloodBanks = JSON.parse(JSON.stringify(INITIAL_BLOOD_BANKS));
        this.requests = JSON.parse(JSON.stringify(INITIAL_REQUESTS));
        this.chats = JSON.parse(JSON.stringify(INITIAL_CHATS));
        this.currentDonorId = 'donor-1';
        this.currentBankId = 'bank-1';
        this.activeRole = 'home';
        if (triggerEvent) {
            this.save();
            this.emit('reset', {});
        }
    }

    subscribe(fn) {
        this.listeners.push(fn);
        return () => {
            this.listeners = this.listeners.filter(l => l !== fn);
        };
    }

    emit(event, data) {
        this.listeners.forEach(fn => {
            try { fn(event, data); } catch (err) { console.error('Listener err', err); }
        });
    }

    getCurrentDonor() {
        return this.donors.find(d => d.id === this.currentDonorId) || this.donors[0];
    }

    getCurrentBank() {
        return this.bloodBanks.find(b => b.id === this.currentBankId) || this.bloodBanks[0];
    }

    // Create a new Emergency Blood Request from Requester
    createRequest(requestData) {
        const newReq = {
            id: 'req-' + Date.now(),
            patientName: requestData.patientName || 'Emergency Patient',
            requesterName: requestData.requesterName || 'Emergency Attendant',
            requesterPhone: requestData.requesterPhone || '+91 98000 11111',
            bloodGroup: requestData.bloodGroup,
            component: requestData.component || 'Whole Blood',
            unitsNeeded: parseInt(requestData.unitsNeeded) || 1,
            hospitalName: requestData.hospitalName,
            hospitalAddress: requestData.hospitalAddress,
            city: requestData.city || 'Bengaluru',
            pinCode: requestData.pinCode || '',
            lat: requestData.lat || 12.9716,
            lng: requestData.lng || 77.5946,
            urgency: requestData.urgency || 'CRITICAL',
            patientDiagnosis: requestData.patientDiagnosis || 'Emergency transfusion required',
            createdAt: new Date().toISOString(),
            status: 'BROADCASTING',
            otp: Math.floor(1000 + Math.random() * 9000).toString(),
            notifiedDonorIds: [],
            acceptedDonorId: null,
            acceptedDonorName: null,
            acceptedAt: null
        };

        // Find matching compatible donors
        const compatibleDonors = this.donors.filter(donor => {
            if (!donor.isAvailable) return false;
            // Check compatibility using compatibility engine
            return window.BloodCompatibility.isCompatible(newReq.bloodGroup, donor.bloodGroup, newReq.component);
        });

        newReq.notifiedDonorIds = compatibleDonors.map(d => d.id);
        this.requests.unshift(newReq);
        this.chats[newReq.id] = [
            {
                sender: 'system',
                senderName: 'HemoPulse Broadcast Bot',
                text: `🚨 SOS BROADCAST ACTIVE: ${newReq.unitsNeeded} unit(s) of ${newReq.bloodGroup} (${newReq.component}) requested at ${newReq.hospitalName}. Broadcasted to ${compatibleDonors.length} nearby eligible donors.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ];

        this.save();
        this.emit('sos_broadcast', { request: newReq, donorsMatched: compatibleDonors.length });
        return newReq;
    }

    // Donor accepts request after passing the 5 emergency screening questions
    acceptRequest(requestId, donorId) {
        const req = this.requests.find(r => r.id === requestId);
        const donor = this.donors.find(d => d.id === donorId);
        if (!req || !donor) return false;

        req.status = 'ACCEPTED';
        req.acceptedDonorId = donor.id;
        req.acceptedDonorName = donor.fullName;
        req.acceptedDonorGroup = donor.bloodGroup;
        req.acceptedDonorPhone = donor.phone;
        req.acceptedAt = new Date().toISOString();

        // Increment donor's donation commitment
        donor.totalDonationsCount = (donor.totalDonationsCount || 0) + 1;

        // Add message in chat
        if (!this.chats[requestId]) this.chats[requestId] = [];
        this.chats[requestId].push({
            sender: 'system',
            senderName: 'Emergency Coordinator',
            text: `✅ ${donor.fullName} (${donor.bloodGroup}) passed safety screening and ACCEPTED the emergency request! They are coordinating travel to ${req.hospitalName}. Bedside Handshake OTP: ${req.otp}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        this.save();
        this.emit('request_accepted', { request: req, donor: donor });
        return true;
    }

    // Add chat message
    addChatMessage(requestId, sender, senderName, text) {
        if (!this.chats[requestId]) {
            this.chats[requestId] = [];
        }
        const message = {
            sender,
            senderName,
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        this.chats[requestId].push(message);
        this.save();
        this.emit('new_chat_message', { requestId, message });
        return message;
    }

    // Register / Update an Individual Donor Profile
    registerDonor(donorData) {
        const id = donorData.id || 'donor-' + Date.now();
        const existingIdx = this.donors.findIndex(d => d.id === id);

        const donorRecord = {
            id,
            fullName: donorData.fullName,
            dob: donorData.dob,
            age: donorData.age || 25,
            gender: donorData.gender || 'Other',
            bloodGroup: donorData.bloodGroup,
            phone: donorData.phone,
            area: donorData.area,
            city: donorData.city,
            state: donorData.state || 'Karnataka',
            pinCode: donorData.pinCode,
            travelDistanceKm: parseInt(donorData.travelDistanceKm) || 15,
            lat: 12.9716 + (Math.random() - 0.5) * 0.08,
            lng: 77.5946 + (Math.random() - 0.5) * 0.08,
            donatedBefore: donorData.donatedBefore === true || donorData.donatedBefore === 'true',
            lastDonationDate: donorData.lastDonationDate || '',
            hadComplications: donorData.hadComplications === true || donorData.hadComplications === 'true',
            complicationNotes: donorData.complicationNotes || '',
            isPregnantOrNursing: donorData.isPregnantOrNursing === true || donorData.isPregnantOrNursing === 'true',
            vaccinatedLastMonth: donorData.vaccinatedLastMonth === true || donorData.vaccinatedLastMonth === 'true',
            medicalConditions: donorData.medicalConditions || {
                diabetesOrHypertension: false,
                cancerOrBloodDisease: false,
                liverOrKidneyOrNeuro: false,
                hepatitisOrJaundiceOrHIVRisk: false,
                majorSurgeryPast6Months: false,
                rabiesOrHepBInYear: false
            },
            selectedBloodBankId: donorData.selectedBloodBankId || 'bank-1',
            verificationStatus: 'pending', // Starts as pending verification by chosen blood bank!
            verifiedBy: null,
            verifiedAt: null,
            isAvailable: true,
            totalDonationsCount: donorData.totalDonationsCount || 0,
            consentContact: !!donorData.consentContact,
            consentShareLimitedDetails: !!donorData.consentShareLimitedDetails,
            responseRate: '100%',
            avgResponseMinutes: 4
        };

        if (existingIdx >= 0) {
            this.donors[existingIdx] = donorRecord;
        } else {
            this.donors.push(donorRecord);
        }

        this.currentDonorId = id;
        this.save();
        this.emit('donor_registered', donorRecord);
        return donorRecord;
    }

    // Toggle donor active availability
    toggleDonorAvailability(donorId) {
        const donor = this.donors.find(d => d.id === donorId);
        if (donor) {
            donor.isAvailable = !donor.isAvailable;
            this.save();
            this.emit('donor_updated', donor);
        }
        return donor ? donor.isAvailable : false;
    }

    // Blood Bank verifies or rejects donor
    setDonorVerification(donorId, status, bankName) {
        const donor = this.donors.find(d => d.id === donorId);
        if (donor) {
            donor.verificationStatus = status; // 'verified' or 'rejected'
            donor.verifiedBy = status === 'verified' ? bankName : null;
            donor.verifiedAt = status === 'verified' ? new Date().toISOString() : null;
            this.save();
            this.emit('donor_verified', { donor, status });
        }
    }

    // Update Blood Bank inventory count
    updateInventory(bankId, bloodGroup, componentKey, deltaOrValue, isDelta = false) {
        const bank = this.bloodBanks.find(b => b.id === bankId);
        if (!bank || !bank.inventory[bloodGroup]) return;

        let currentVal = bank.inventory[bloodGroup][componentKey] || 0;
        let newVal = isDelta ? Math.max(0, currentVal + deltaOrValue) : Math.max(0, deltaOrValue);
        bank.inventory[bloodGroup][componentKey] = newVal;

        this.save();
        this.emit('inventory_updated', { bankId, bloodGroup, componentKey, newVal });
    }
}

window.appStore = new Store();
