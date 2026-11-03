/**
 * HemoPulse - Realtime Emergency Chat & Coordination Hub
 * Coordinates donor-requester logistics, bedside OTP handshakes,
 * hospital navigation directions, and quick status actions.
 */

class ChatManager {
    constructor() {
        this.activeRequestId = null;
    }

    openChat(requestId) {
        this.activeRequestId = requestId;
        const modal = document.getElementById('chat-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            this.renderMessages();
            this.renderHeader();
        }
    }

    closeChat() {
        const modal = document.getElementById('chat-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        this.activeRequestId = null;
    }

    renderHeader() {
        if (!this.activeRequestId) return;
        const req = window.appStore.requests.find(r => r.id === this.activeRequestId);
        if (!req) return;

        const titleEl = document.getElementById('chat-title');
        const subtitleEl = document.getElementById('chat-subtitle');
        const otpEl = document.getElementById('chat-otp-display');
        const hospitalLinkEl = document.getElementById('chat-hospital-link');

        if (titleEl) {
            titleEl.textContent = req.acceptedDonorName 
                ? `Coordination: ${req.acceptedDonorName} (${req.bloodGroup} ${req.component})`
                : `Emergency Dispatch: ${req.hospitalName}`;
        }

        if (subtitleEl) {
            subtitleEl.textContent = `Destination: ${req.hospitalName} • Urgency: ${req.urgency}`;
        }

        if (otpEl) {
            otpEl.innerHTML = `
                <div class="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
                    <span class="font-bold">Bedside OTP:</span>
                    <span class="font-mono font-black tracking-widest text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded">${req.otp || '5924'}</span>
                </div>
            `;
        }

        if (hospitalLinkEl) {
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(req.hospitalName + ' ' + (req.hospitalAddress || ''))}`;
            hospitalLinkEl.href = mapsUrl;
        }
    }

    renderMessages() {
        if (!this.activeRequestId) return;
        const messages = window.appStore.chats[this.activeRequestId] || [];
        const container = document.getElementById('chat-messages-container');
        if (!container) return;

        container.innerHTML = messages.map(msg => {
            const isSystem = msg.sender === 'system';
            const isRequester = msg.sender === 'requester';
            
            if (isSystem) {
                return `
                    <div class="flex justify-center my-2">
                        <div class="bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs px-3.5 py-1.5 rounded-full shadow text-center max-w-md">
                            ${msg.text}
                        </div>
                    </div>
                `;
            }

            return `
                <div class="flex flex-col ${isRequester ? 'items-end' : 'items-start'} my-2">
                    <span class="text-[10px] text-slate-400 font-medium px-1 mb-0.5">
                        ${msg.senderName} • ${msg.timestamp}
                    </span>
                    <div class="max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow ${
                        isRequester 
                            ? 'bg-rose-600 text-white rounded-br-none' 
                            : 'bg-slate-800 text-slate-100 border border-slate-700/70 rounded-bl-none'
                    }">
                        ${msg.text}
                    </div>
                </div>
            `;
        }).join('');

        // Auto-scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    sendMessage(text) {
        if (!text || !text.trim() || !this.activeRequestId) return;
        const role = window.appStore.activeRole;
        const currentDonor = window.appStore.getCurrentDonor();
        
        let sender = 'requester';
        let senderName = 'Attendant (Requester)';

        if (role === 'donor') {
            sender = 'donor';
            senderName = currentDonor ? currentDonor.fullName : 'Donor';
        } else if (role === 'bloodbank') {
            sender = 'bloodbank';
            senderName = 'Blood Bank Dispatch';
        }

        window.appStore.addChatMessage(this.activeRequestId, sender, senderName, text.trim());
        window.soundEngine.playMessage();
        this.renderMessages();

        // Optional smart simulation reply if sender is requester and donor is accepted
        if (sender === 'requester') {
            const req = window.appStore.requests.find(r => r.id === this.activeRequestId);
            if (req && req.status === 'ACCEPTED' && req.acceptedDonorName) {
                setTimeout(() => {
                    if (this.activeRequestId === req.id) {
                        const responses = [
                            `Got it! I am leaving now. Navigating to ${req.hospitalName}. ETA is approximately 20 mins.`,
                            `Understood! I have my ID card ready and had plenty of fluids. See you at the reception.`,
                            `Will head straight to the Blood Bank on 1st floor. Please keep the patient donation slip ready.`
                        ];
                        const randomReply = responses[Math.floor(Math.random() * responses.length)];
                        window.appStore.addChatMessage(req.id, 'donor', req.acceptedDonorName, randomReply);
                        window.soundEngine.playMessage();
                        this.renderMessages();
                    }
                }, 2200);
            }
        }
    }

    sendQuickAction(actionType) {
        const quickTexts = {
            'driving': '🚗 I am now on the way to the hospital. Estimated travel time is 20-25 minutes.',
            'arrived': '📍 I have arrived at the hospital reception! Where should I meet the medical team?',
            'bring_id': '🪪 Please ensure the donor brings an official Government Photo ID for blood bank intake.',
            'icu_details': '🏥 Attending team is on standby in the 2nd Floor Transfusion Unit. Patient Bed #14.',
            'call_urgent': '📞 Please call my direct mobile line immediately for urgent gate entry coordination.'
        };

        const text = quickTexts[actionType];
        if (text) {
            this.sendMessage(text);
        }
    }
}

window.chatManager = new ChatManager();
