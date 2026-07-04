// api.js — ES6 Module Conversion
const API_BASE = '/rest/api';

const Api = {
    // ==================== TOKEN YÖNETİMİ ====================
    getToken() { return localStorage.getItem('accessToken'); },
    getRefreshToken() { return localStorage.getItem('refreshToken'); },
    setTokens(access, refresh) {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
    },
    clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
    },
    getCurrentUser() {
        try { return JSON.parse(localStorage.getItem('currentUser')); } catch(e) { return null; }
    },
    setCurrentUser(user) { localStorage.setItem('currentUser', JSON.stringify(user)); },
    isLoggedIn() { return !!this.getToken(); },

    // ==================== HTTP HELPER ====================
    async request(url, options = {}) {
        const headers = options.headers || {};
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';

        if (this.getToken()) {
            headers['Authorization'] = 'Bearer ' + this.getToken();
        }

        if (options.body instanceof FormData) {
            delete headers['Content-Type'];
        }

        const resp = await fetch(API_BASE + url, { ...options, headers });

        if (resp.status === 401 && this.getRefreshToken()) {
            const refreshed = await this.doRefreshToken();
            if (refreshed) {
                headers['Authorization'] = 'Bearer ' + this.getToken();
                return fetch(API_BASE + url, { ...options, headers });
            } else {
                this.clearTokens();
                window.location.href = '/login';
                return;
            }
        }
        return resp;
    },

    async json(url, options = {}) {
        const resp = await this.request(url, options);
        if (!resp) return null;
        const data = await resp.json();
        return data;
    },

    // ==================== AUTH ====================
    async login(username, password) {
        try {
            const resp = await fetch(API_BASE + '/auth/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await resp.json();
            if (data.status === 200 && data.payload) {
                if (data.payload.requiresTwoFactor) {
                    return { 
                        success: true, 
                        requiresTwoFactor: true, 
                        twoFactorToken: data.payload.twoFactorToken,
                        maskedEmail: data.payload.maskedEmail,
                        maskedPhone: data.payload.maskedPhone
                    };
                }

                this.setTokens(data.payload.accessToken, data.payload.refreshToken);
                this.decodeAndSetUser(data.payload.accessToken);
                return { success: true, requiresTwoFactor: false };
            }
            return { success: false, error: data.errorMessage || 'Giriş başarısız' };
        } catch(e) {
            return { success: false, error: 'Sunucuya bağlanılamadı: ' + e.message };
        }
    },

    decodeAndSetUser(token) {
        try {
            const payloadB64 = token.split('.')[1];
            const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            const decoded = JSON.parse(jsonPayload);
            this.setCurrentUser({ username: decoded.sub, role: decoded.role });
        } catch(e) {
            console.error("JWT decode error:", e);
        }
    },

    async sendTwoFactorCode(twoFactorToken, method) {
        try {
            const resp = await fetch(API_BASE + '/auth/send-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twoFactorToken, method })
            });
            const data = await resp.json();
            if (data.status === 200) {
                return { success: true };
            }
            return { success: false, error: data.errorMessage || 'Kod gönderilemedi.' };
        } catch (e) {
            return { success: false, error: 'Sunucuya bağlanılamadı: ' + e.message };
        }
    },

    async verifyTwoFactorCode(twoFactorToken, code) {
        try {
            const resp = await fetch(API_BASE + '/auth/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ twoFactorToken, code })
            });
            const data = await resp.json();
            if (data.status === 200 && data.payload && !data.payload.requiresTwoFactor) {
                this.setTokens(data.payload.accessToken, data.payload.refreshToken);
                this.decodeAndSetUser(data.payload.accessToken);
                return { success: true };
            }
            return { success: false, error: data.errorMessage || 'Doğrulama başarısız.' };
        } catch (e) {
            return { success: false, error: 'Sunucuya bağlanılamadı: ' + e.message };
        }
    },

    async register(username, email, password, phoneNumber) {
        try {
            const resp = await fetch(API_BASE + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, phoneNumber })
            });
            const data = await resp.json();
            if (data.status === 200 && data.payload) {
                return { success: true, user: data.payload };
            }
            return { success: false, error: data.errorMessage || 'Kayıt başarısız' };
        } catch(e) {
            return { success: false, error: 'Sunucuya bağlanılamadı: ' + e.message };
        }
    },

    async doRefreshToken() {
        try {
            const resp = await fetch(API_BASE + '/auth/refresh-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.getRefreshToken() })
            });
            const data = await resp.json();
            if (data.status === 200 && data.payload) {
                this.setTokens(data.payload.accessToken, data.payload.refreshToken);
                try {
                    const payloadB64 = data.payload.accessToken.split('.')[1];
                    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
                    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
                    const decoded = JSON.parse(jsonPayload);
                    this.setCurrentUser({ username: decoded.sub, role: decoded.role });
                } catch(e) {
                    console.error("JWT decode error:", e);
                }
                return true;
            }
        } catch(e) {}
        return false;
    },

    logout() {
        this.clearTokens();
    },

    // ==================== USER ====================
    async getUserSettings() {
        return this.json('/user/settings');
    },

    async updateUserSettings(enabled) {
        return this.json('/user/settings?enabled=' + enabled, { method: 'POST' });
    },

    async updateUserProfile(email, phoneNumber) {
        return this.json('/user/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, phoneNumber })
        });
    },

    // ==================== DASHBOARD ====================
    async getMyMemorial() { return this.json('/dashboard/memorial'); },
    async saveMemorial(memorialData) {
        return this.json('/dashboard/memorial', { method: 'POST', body: JSON.stringify(memorialData) });
    },
    async deleteMyMemorial() {
        return this.json('/memorials/my-memorial', { method: 'DELETE' });
    },

    // ==================== PUBLIC ====================
    async getMemorials(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
        return this.json('/public/memorials?' + params.toString(), { noAuth: true });
    },
    async getMemorialBySlug(slug, preview) {
        const q = preview ? '?preview=true' : '';
        return this.json('/public/memorial/' + slug + q, { noAuth: !preview });
    },
    async searchMemorials(query) {
        return this.json('/public/search?q=' + encodeURIComponent(query), { noAuth: true });
    },
    async getStats(filters = {}) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
        return this.json('/public/stats?' + params.toString(), { noAuth: true });
    },

    // ==================== INTERACTIONS ====================
    async performAction(memorialId, actionType) {
        return this.json('/interaction/' + memorialId + '/' + actionType, { method: 'POST', noAuth: true });
    },
    async addComment(memorialId, name, content) {
        return this.json('/comment/' + memorialId, {
            method: 'POST', noAuth: true, body: JSON.stringify({ name, content })
        });
    },

    // ==================== ADMIN ====================
    async getAdminDashboard() { return this.json('/admin/dashboard'); },
    async approveMemorial(id) { return this.json('/admin/approve/' + id, { method: 'POST' }); },
    async rejectMemorial(id) { return this.json('/admin/reject/' + id, { method: 'POST' }); },
    async pendingMemorial(id) { return this.json('/admin/pending/' + id, { method: 'POST' }); },
    async moderate(itemType, itemId, action) {
        return this.json('/admin/moderate/' + itemType + '/' + itemId + '/' + action, { method: 'POST' });
    },

    // ==================== FILES ====================
    async uploadVisitorMedia(memorialId, file) {
        const formData = new FormData();
        formData.append('visitor_media', file);
        return this.json('/visitor-media/' + memorialId, { method: 'POST', noAuth: true, body: formData });
    },
    getQrCodeUrl(slug) { return API_BASE + '/qr/' + slug; },
    async uploadProfileImage(file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.request('/dashboard/upload/profile-image', { method: 'POST', body: formData }).then(r => r ? r.json() : null);
    },
    async uploadGallery(files) {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
        return this.request('/dashboard/upload/gallery', { method: 'POST', body: formData }).then(r => r ? r.json() : null);
    },
    async uploadAudio(file, audioType) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('audioType', audioType);
        return this.request('/dashboard/upload/audio', { method: 'POST', body: formData }).then(r => r ? r.json() : null);
    }
};

export default Api;
