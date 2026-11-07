# 🩸 HemoPulse AI — Emergency Blood & Component Matching Mesh

> **Hackathon Track:** Blood Donor Finder  
> **Problem:** Finding donors in medical emergencies is dangerously slow, uncoordinated, and fails to differentiate critical short-shelf-life components (like platelets).  
> **Solution:** A sub-minute searchable donor directory and emergency broadcast mesh connecting Requesters, Verified Lifesaver Donors, and 24x7 Certified Blood Banks with interactive GIS radar routing, 5-point emergency safety screening, and bedside coordination chat.

---

## 🌟 Key Innovations & Hackathon Highlights

1. **Dual Component & Group Precision Matching:**
   - Doesn't just find "blood" — searches specifically for **Whole Blood**, **Packed Red Cells (PRBC)**, **Platelets (SDP/RDP)**, **Fresh Frozen Plasma (FFP)**, and **Cryoprecipitate**.
   - Built-in medical compatibility engine handles different antigen rules (e.g. O- is universal for red cells, while AB is universal for plasma).

2. **5-Point Immediate Emergency Donor Screening:**
   - When a nearby donor receives an urgent SOS ping, before dispatching they take a rapid 5-question pre-donation safety check (infection/fever, sleep & food, 24h alcohol/tobacco, 48h antibiotics, and donation interval spacing).
   - Prevents rejected donations at the hospital bedside and saves critical turnaround time.

3. **Hospital Verification & Certified Lifesaver Badges:**
   - Donors submit a comprehensive medical history form and nominate their preferred blood bank/hospital for official verification.
   - Blood banks review medical declarations in an administrative queue and issue certified digital donor cards.

4. **Instant In-App Coordination Hub & Handshake OTP:**
   - Requesters and accepted donors unlock a real-time messaging room with one-tap quick action buttons ("Driving to hospital", "Arrived at reception", "Bring photo ID").
   - Generates a secure 4-digit bedside handshake code to ensure patient safety and authenticate donors at hospital intake.

5. **24x7 Blood Bank Component Inventory Matrix:**
   - Live unit tracker for all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-) across 5 essential blood components with low-stock warnings (< 3 units).

6. **Interactive GIS Radar Map & Visual Route Preview:**
   - Powered by Leaflet with custom div-icons, pulsating radar beacons, search radius circles, and dynamic routing lines between en-route donors and recipient hospitals.

7. **Synthesized Web Audio Alerts:**
   - Zero external audio assets needed! Native Web Audio API generates urgent dual-tone hospital pager beeps for SOS broadcasts and uplifting chimes for donation confirmations.

---

## 📋 Comprehensive Questionnaire Specs Implemented

### 1. Donor Onboarding & Eligibility Form:
- Full name, Date of birth, Age, Gender
- Blood group & Rh factor
- Home area, city, state, PIN code
- Willing to travel up to X km (interactive range slider)
- Prior blood/plasma donation history & complication notes
- Pregnancy / breastfeeding status (conditional for women)
- Vaccination in the past month
- Medical conditions checklist:
  - Diabetes / High BP / Heart disease / Chest pain / Serious allergy
  - Cancer / Blood-clotting or other blood disorder
  - Liver / Kidney disease / Tuberculosis / Epilepsy / Neurological
  - Jaundice / Hepatitis contact / HIV / Transfusion risk
  - Major surgery or serious illness in the past 6 months
  - Rabies treatment or Hepatitis B immune globulin in the past year
- Selected blood bank or hospital for verification
- Consent to be contacted for emergency requests
- Consent to share limited privacy-preserving details with verified requesters

### 2. Immediate Pre-Donation Screening Questions (When Requester asks for blood):
- Do you currently have fever, cold, cough, flu, sore throat, or any infection?
- Have you slept adequately and eaten in the last few hours?
- Have you consumed alcohol or smoked in the last 24 hours?
- Have you taken antibiotics or other medicines in the last 48 hours?
- Donated blood within 12 weeks (if man) or 16 weeks (if woman)?

### 3. Emergency Requester Fields:
- Required blood group and Rh factor
- Component: Whole blood, Packed red cells (PRBC), Platelets (SDP/RDP), Fresh frozen plasma (FFP), Cryoprecipitate
- Number of units needed
- Hospital name, address, and patient diagnosis notes
- Emergency priority level (Critical, Urgent, Standard)

---

## 🛠️ Project Structure

```
hemo-pulse-blood-finder/
├── index.html               # Main Single Page Application with all views and modals
├── css/
│   └── styles.css           # Glassmorphism panels, radar sweep animations, custom scrollbars
├── js/
│   ├── compatibility.js     # Medical ABO/Rh & component compatibility logic
│   ├── audio.js             # Synthesized Web Audio API sound alerts (SOS & chimes)
│   ├── store.js             # State machine, LocalStorage persistence, event bus
│   ├── map.js               # Leaflet GIS interactive radar & routing visualization
│   ├── chat.js              # Real-time coordination chat with quick actions & OTP
│   └── app.js               # Main UI controller & lifecycle coordinator
└── README.md                # Hackathon pitch & user manual
```

---
