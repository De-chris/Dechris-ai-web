// Dechris AI Web Application - Havenova-X Protocol
const App = {
    state: {
        chats: {},
        currentChatId: null,
        userName: 'Agent',
        isDeepThink: false,
        isTyping: false,
        lastNotif: '',
        notifMuted: false
    },

    init() {
        this.loadUserData();
        this.checkFirstTime();
        this.setupEventListeners();
        this.checkNotifications();
        
        // Auto-create chat on load
        setTimeout(() => {
            this.hideSplash();
            if (!this.state.currentChatId) {
                this.createNewChat(true);
            }
        }, 2000);
    },

    loadUserData() {
        const saved = localStorage.getItem('dechris_v3_data');
        if (saved) {
            const data = JSON.parse(saved);
            this.state.chats = data.chats || {};
            this.state.userName = data.userName || 'Agent';
            this.state.currentChatId = data.currentChatId || null;
            this.state.notifMuted = data.notifMuted || false;
            this.state.lastNotif = data.lastNotif || '';
        }
        this.updateUI();
    },

    saveData() {
        const data = {
            chats: this.state.chats,
            userName: this.state.userName,
            currentChatId: this.state.currentChatId,
            notifMuted: this.state.notifMuted,
            lastNotif: this.state.lastNotif,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('dechris_v3_data', JSON.stringify(data));
    },

    checkFirstTime() {
        if (!this.state.userName || this.state.userName === 'Agent') {
            document.getElementById('setupModal').classList.add('active');
        }
    },

    completeSetup() {
        const nameInput = document.getElementById('setupName');
        const name = nameInput.value.trim();
        if (name) {
            this.state.userName = name;
            this.saveData();
            document.getElementById('setupModal').classList.remove('active');
            this.updateUI();
            this.createNewChat();
        } else {
            nameInput.style.borderColor = '#ff4444';
            setTimeout(() => {
                nameInput.style.borderColor = '';
            }, 1000);
        }
    },

    hideSplash() {
        const splash = document.getElementById('splash');
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 500);
    },

    createNewChat(silent = false) {
        const id = 'hx_' + Date.now();
        const chat = {
            id: id,
            title: 'New Mission',
            messages: [],
            createdAt: new Date().toLocaleString(),
            updatedAt: Date.now()
        };
        
        this.state.chats[id] = chat;
        this.state.currentChatId = id;
        this.saveData();
        
        if (!silent) {
            this.loadChat(id);
            this.updateSidebar();
        }
        
        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.remove('open');
        }
    },

    loadChat(id) {
        this.state.currentChatId = id;
        this.saveData();
        
        const chat = this.state.chats[id];
        const welcomeScreen = document.getElementById('welcomeScreen');
        const messagesList = document.getElementById('messagesList');
        
        if (chat.messages.length === 0) {
            welcomeScreen.classList.remove('hidden');
            messagesList.classList.add('hidden');
            document.getElementById('welcomeTitle').textContent = `Hello, ${this.state.userName}`;
        } else {
            welcomeScreen.classList.add('hidden');
            messagesList.classList.remove('hidden');
            this.renderMessages(chat.messages);
        }
        
        this.updateSidebar();
        this.updateMessageCount();
    },

    renderMessages(messages) {
        const container = document.getElementById('messagesList');
        container.innerHTML = '';
        
        messages.forEach(msg => {
            this.appendMessage(msg.content, msg.role, false);
        });
        
        this.scrollToBottom();
    },

    appendMessage(content, role, animate = true) {
        const container = document.getElementById('messagesList');
        const welcomeScreen = document.getElementById('welcomeScreen');
        
        if (!welcomeScreen.classList.contains('hidden')) {
            welcomeScreen.classList.add('hidden');
            container.classList.remove('hidden');
        }
        
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${role} ${animate ? 'fade-in' : ''}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? this.state.userName[0].toUpperCase() : 'D';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (role === 'ai') {
            contentDiv.innerHTML = this.formatMessage(content);
        } else {
            contentDiv.textContent = content;
        }
        
        msgDiv.appendChild(avatar);
        msgDiv.appendChild(contentDiv);
        container.appendChild(msgDiv);
        
        this.scrollToBottom();
        this.updateMessageCount();
    },

    formatMessage(text) {
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `
                <pre>
                    <div class="code-header">
                        <span class="code-lang">${language}</span>
                        <button class="copy-code-btn" onclick="App.copyCode(this)">Copy</button>
                    </div>
                    <code>${code.trim()}</code>
                </pre>
            `;
        });
        
        text = text.replace(/`([^`]+)`/g, '<code style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
        text = text.replace(/\n/g, '<br>');
        
        return text;
    },

    copyCode(btn) {
        const code = btn.closest('pre').querySelector('code').textContent;
        navigator.clipboard.writeText(code);
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 2000);
    },

    async sendMessage() {
        if (this.state.isTyping) return;
        
        const input = document.getElementById('userInput');
        const text = input.value.trim();
        
        if (!text || !this.state.currentChatId) return;
        
        this.appendMessage(text, 'user');
        this.state.chats[this.state.currentChatId].messages.push({
            role: 'user',
            content: text,
            timestamp: Date.now()
        });
        
        if (this.state.chats[this.state.currentChatId].messages.length === 1) {
            this.state.chats[this.state.currentChatId].title = text.substring(0, 30);
            this.updateSidebar();
        }
        
        input.value = '';
        input.style.height = 'auto';
        this.saveData();
        
        this.state.isTyping = true;
        this.updateSendButton();
        const typingId = this.showTyping();
        
        try {
            const systemMsg = {
                role: "system",
                content: `You are Dechris AI, created by Havenova-X team led by founder Dechris. Address the user as "${this.state.userName}". Be professional, concise, and helpful. Use markdown for formatting. Contact: havenova.x@gmail.com`
            };
            
            const history = this.state.chats[this.state.currentChatId].messages.slice(-10);
            const apiMessages = [systemMsg, ...history.map(m => ({
                role: m.role === 'ai' ? 'assistant' : m.role,
                content: m.content
            }))];
            
            const response = await window.API_CONFIG.callAI(apiMessages, this.state.isDeepThink);
            
            document.getElementById(typingId).remove();
            this.appendMessage(response, 'ai');
            
            this.state.chats[this.state.currentChatId].messages.push({
                role: 'ai',
                content: response,
                timestamp: Date.now()
            });
            
            this.saveData();
            
        } catch (error) {
            document.getElementById(typingId).remove();
            this.appendMessage('⚠️ Connection interrupted. Please retry.', 'ai');
            console.error('API Error:', error);
        } finally {
            this.state.isTyping = false;
            this.updateSendButton();
        }
    },

    showTyping() {
        const container = document.getElementById('messagesList');
        const id = 'typing_' + Date.now();
        
        const div = document.createElement('div');
        div.id = id;
        div.className = 'message ai fade-in';
        div.innerHTML = `
            <div class="message-avatar">D</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        container.appendChild(div);
        this.scrollToBottom();
        return id;
    },

    quickStart(text) {
        document.getElementById('userInput').value = text;
        this.sendMessage();
    },

    toggleDeepThink() {
        this.state.isDeepThink = !this.state.isDeepThink;
        const btn = document.getElementById('deepThinkBtn');
        const selector = document.getElementById('modelSelector');
        const modelName = document.getElementById('modelName');
        
        if (this.state.isDeepThink) {
            btn.classList.add('active');
            selector.classList.add('active');
            modelName.textContent = 'Dechris DeepThink';
        } else {
            btn.classList.remove('active');
            selector.classList.remove('active');
            modelName.textContent = 'Dechris Flash';
        }
    },

    updateSidebar() {
        const list = document.getElementById('chatList');
        list.innerHTML = '';
        
        const sorted = Object.values(this.state.chats).sort((a, b) => b.updatedAt - a.updatedAt);
        
        sorted.forEach(chat => {
            const item = document.createElement('div');
            item.className = `chat-item ${chat.id === this.state.currentChatId ? 'active' : ''}`;
            item.innerHTML = `
                <i class="far fa-comment-alt"></i>
                <span>${chat.title}</span>
                <div class="chat-actions">
                    <button onclick="event.stopPropagation(); App.deleteChat('${chat.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Better click handling for both mouse and touch
            item.addEventListener('click', () => this.loadChat(chat.id));
            item.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.loadChat(chat.id);
            });
            
            list.appendChild(item);
        });
        
        document.getElementById('sidebarUserName').textContent = this.state.userName;
        document.getElementById('userAvatar').textContent = this.state.userName[0].toUpperCase();
    },

    deleteChat(id) {
        if (confirm('Delete this mission?')) {
            delete this.state.chats[id];
            if (this.state.currentChatId === id) {
                this.state.currentChatId = null;
                document.getElementById('messagesList').innerHTML = '';
                document.getElementById('welcomeScreen').classList.remove('hidden');
                document.getElementById('messagesList').classList.add('hidden');
            }
            this.saveData();
            this.updateSidebar();
        }
    },

    updateUI() {
        this.updateSidebar();
        if (this.state.currentChatId) {
            this.loadChat(this.state.currentChatId);
        }
    },

    updateSendButton() {
        const btn = document.getElementById('sendBtn');
        btn.disabled = this.state.isTyping;
        btn.innerHTML = this.state.isTyping ? 
            '<i class="fas fa-spinner fa-spin"></i>' : 
            '<i class="fas fa-arrow-up"></i>';
    },

    updateMessageCount() {
        const chat = this.state.chats[this.state.currentChatId];
        const count = chat ? chat.messages.length : 0;
        document.getElementById('msgCount').textContent = `${count} messages`;
    },

    scrollToBottom() {
        const container = document.getElementById('messagesList');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    },

    openSettings() {
        document.getElementById('settingsName').value = this.state.userName;
        document.getElementById('notifToggle').checked = !this.state.notifMuted;
        document.getElementById('settingsModal').classList.add('active');
    },

    closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
    },

    saveSettings() {
        const newName = document.getElementById('settingsName').value.trim();
        if (newName) {
            this.state.userName = newName;
        }
        this.state.notifMuted = !document.getElementById('notifToggle').checked;
        this.saveData();
        this.updateUI();
        this.closeSettings();
    },

    async checkNotifications() {
        if (this.state.notifMuted) return;
        
        try {
            const response = await fetch('/notif.txt?t=' + Date.now());
            const text = await response.text();
            
            if (text.trim() && text !== this.state.lastNotif) {
                this.showNotification(text);
                this.state.lastNotif = text;
                this.saveData();
            }
        } catch (e) {
            console.log('No notifications');
        }
    },

    showNotification(text) {
        document.getElementById('notifText').textContent = text;
        document.getElementById('notification').style.display = 'block';
    },

    dismissNotif() {
        document.getElementById('notification').style.display = 'none';
    },

    muteNotif() {
        this.state.notifMuted = true;
        this.saveData();
        this.dismissNotif();
    },

    toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('open');
    },

    autoResize(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    },

    handleEnter(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    },

    setupEventListeners() {
        // Setup button - both click and touch
        const setupBtn = document.querySelector('#setupModal .save-btn');
        if (setupBtn) {
            setupBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.completeSetup();
            });
            setupBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.completeSetup();
            });
        }

        // Allow Enter key in setup input
        const setupInput = document.getElementById('setupName');
        if (setupInput) {
            setupInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.completeSetup();
                }
            });
        }

        // Global click handler for mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const toggle = document.querySelector('.menu-toggle');
            if (window.innerWidth < 768 && 
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) && 
                !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });

        // Send button
        const sendBtn = document.getElementById('sendBtn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
            sendBtn.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
        }

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const text = this.textContent.trim();
                App.quickStart(text);
            });
        });

        // Check notifications every 30 seconds
        setInterval(() => this.checkNotifications(), 30000);
    }
};

// Expose to global scope for inline onclick handlers
window.App = App;

// Also expose individual functions that are called inline
window.completeSetup = function() {
    App.completeSetup();
};

window.createNewChat = function() {
    App.createNewChat();
};

window.toggleSidebar = function() {
    App.toggleSidebar();
};

window.toggleDeepThink = function() {
    App.toggleDeepThink();
};

window.sendMessage = function() {
    App.sendMessage();
};

window.openSettings = function() {
    App.openSettings();
};

window.closeSettings = function() {
    App.closeSettings();
};

window.saveSettings = function() {
    App.saveSettings();
};

window.deleteChat = function(id, event) {
    if (event) event.stopPropagation();
    App.deleteChat(id);
};

window.dismissNotif = function() {
    App.dismissNotif();
};

window.muteNotif = function() {
    App.muteNotif();
};

window.quickStart = function(text) {
    App.quickStart(text);
};

window.autoResize = function(textarea) {
    App.autoResize(textarea);
};

window.handleEnter = function(event) {
    App.handleEnter(event);
};

window.copyCode = function(btn) {
    App.copyCode(btn);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => App.init());
