/**
 * HemoPulse - Blood & Component Compatibility Engine
 * Handles compatibility rules for Whole Blood, Packed Red Cells (PRBC), 
 * Platelets, and Fresh Frozen Plasma (FFP).
 */

const BloodCompatibility = {
    // Red Blood Cell / Whole Blood Compatibility (Antigen/Antibody rule)
    // Key: Recipient blood group -> Array of compatible Donor blood groups
    redCellCompatibility: {
        'O-': ['O-'],
        'O+': ['O-', 'O+'],
        'B-': ['O-', 'B-'],
        'B+': ['O-', 'O+', 'B-', 'B+'],
        'A-': ['O-', 'A-'],
        'A+': ['O-', 'O+', 'A-', 'A+'],
        'AB-': ['O-', 'B-', 'A-', 'AB-'],
        'AB+': ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'] // Universal Recipient
    },

    // Plasma Compatibility (Reverse rule: AB is universal plasma donor, O is universal recipient)
    plasmaCompatibility: {
        'O-': ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'],
        'O+': ['O-', 'O+', 'B-', 'B+', 'A-', 'A+', 'AB-', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'AB+'],
        'B+': ['B-', 'B+', 'AB-', 'AB+'],
        'A-': ['A-', 'A+', 'AB-', 'AB+'],
        'A+': ['A-', 'A+', 'AB-', 'AB+'],
        'AB-': ['AB-', 'AB+'],
        'AB+': ['AB-', 'AB+'] // Only AB plasma
    },

    // Platelet Compatibility (Prefer identical group, then plasma-compatible)
    plateletCompatibility: {
        'O-': ['O-', 'O+', 'A-', 'B-', 'AB-'],
        'O+': ['O+', 'O-', 'A+', 'B+', 'AB+'],
        'B-': ['B-', 'B+', 'AB-', 'O-'],
        'B+': ['B+', 'B-', 'AB+', 'O+'],
        'A-': ['A-', 'A+', 'AB-', 'O-'],
        'A+': ['A+', 'A-', 'AB+', 'O+'],
        'AB-': ['AB-', 'AB+', 'A-', 'B-', 'O-'],
        'AB+': ['AB+', 'AB-', 'A+', 'B+', 'O+']
    },

    // Component Metadata & Shelf Life Information
    components: {
        'Whole Blood': {
            shelfLife: '35 to 42 days',
            storageTemp: '2°C to 6°C',
            typicalUses: 'Massive blood loss, trauma, major surgery',
            urgencyRank: 3
        },
        'Packed Red Cells': {
            shelfLife: '42 days',
            storageTemp: '2°C to 6°C',
            typicalUses: 'Severe anemia, post-operative recovery, trauma',
            urgencyRank: 2
        },
        'Platelets': {
            shelfLife: '5 days only (CRITICAL SHORTAGE RISK)',
            storageTemp: '20°C to 24°C with continuous gentle agitation',
            typicalUses: 'Dengue, leukemia, cancer chemotherapy, severe bleeding',
            urgencyRank: 1
        },
        'Fresh Frozen Plasma': {
            shelfLife: '1 year (when frozen at -18°C)',
            storageTemp: '-18°C or colder',
            typicalUses: 'Coagulation disorders, liver diseases, burn shock',
            urgencyRank: 4
        },
        'Cryoprecipitate': {
            shelfLife: '1 year (frozen)',
            storageTemp: '-18°C or colder',
            typicalUses: 'Hemophilia, von Willebrand disease, massive hemorrhage',
            urgencyRank: 4
        }
    },

    /**
     * Check if donor blood is compatible for a recipient given the component type
     */
    isCompatible(recipientGroup, donorGroup, component = 'Whole Blood') {
        if (!recipientGroup || !donorGroup) return false;
        
        const cleanRecipient = recipientGroup.trim().toUpperCase();
        const cleanDonor = donorGroup.trim().toUpperCase();

        if (cleanRecipient === cleanDonor) return true;

        if (component.includes('Plasma')) {
            return (this.plasmaCompatibility[cleanRecipient] || []).includes(cleanDonor);
        } else if (component.includes('Platelet')) {
            return (this.plateletCompatibility[cleanRecipient] || []).includes(cleanDonor);
        } else {
            // Whole blood and Packed Red Cells
            return (this.redCellCompatibility[cleanRecipient] || []).includes(cleanDonor);
        }
    },

    /**
     * Get list of all compatible donor blood groups for a given recipient & component
     */
    getCompatibleDonors(recipientGroup, component = 'Whole Blood') {
        const cleanRecipient = (recipientGroup || '').trim().toUpperCase();
        if (component.includes('Plasma')) {
            return this.plasmaCompatibility[cleanRecipient] || [];
        } else if (component.includes('Platelet')) {
            return this.plateletCompatibility[cleanRecipient] || [];
        } else {
            return this.redCellCompatibility[cleanRecipient] || [];
        }
    },

    /**
     * Calculates donation interval eligibility (in weeks)
     */
    getMinimumDonationInterval(gender) {
        // Indian/WHO standards: Males every 12 weeks (3 months), Females every 16 weeks (4 months)
        return gender && gender.toLowerCase() === 'female' ? 16 : 12;
    }
};

window.BloodCompatibility = BloodCompatibility;
