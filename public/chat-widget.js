/**
 * AG Chat Widget SDK
 * Embeddable chat widget for external websites
 * 
 * Usage:
 * <script src="https://meetanggroup.com/chat-widget.js"></script>
 * <script>
 *   AGChat.init({
 *     widgetKey: 'your-widget-key',
 *     apiUrl: 'https://meetanggroup.com',
 *     customer: {
 *       customerId: 'user-123',
 *       name: 'John Doe',
 *       email: 'john@example.com'
 *     }
 *   })
 * </script>
 */

(function(window) {
  'use strict';

  // Widget state
  const state = {
    initialized: false,
    open: false,
    minimized: true,
    config: null,
    token: null,
    customerId: null,
    conversationId: null,
    socket: null,
    unreadCount: 0,
    isAuthenticated: false,
    user: null,
    showAuthModal: false
  };

  // API Client
  const api = {
    async init(widgetKey, customerInfo, apiUrl) {
      const response = await fetch(`${apiUrl}/api/widget/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          widgetKey,
          customerInfo
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize widget');
      }

      return await response.json();
    },

    async getConversation(token, apiUrl) {
      console.log('[AGChat] Getting conversation with token:', token);
      const response = await fetch(`${apiUrl}/api/widget/conversation`, {
        method: 'GET',
        headers: {
          'X-Widget-Token': token
        }
      });

      if (!response.ok) {
        console.error('[AGChat] Conversation API error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('[AGChat] Error response:', errorText);
        throw new Error('Failed to get conversation');
      }

      return await response.json();
    },

    async createConversation(token, apiUrl, subject) {
      const response = await fetch(`${apiUrl}/api/widget/conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-Token': token
        },
        body: JSON.stringify({ subject })
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      return await response.json();
    },

    async sendMessage(token, apiUrl, conversationId, content, messageType = 'text') {
      const response = await fetch(`${apiUrl}/api/widget/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-Token': token
        },
        body: JSON.stringify({
          conversationId,
          content,
          messageType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    },

    async getMessages(token, apiUrl, conversationId) {
      const response = await fetch(`${apiUrl}/api/widget/messages?conversationId=${conversationId}`, {
        method: 'GET',
        headers: {
          'X-Widget-Token': token
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get messages');
      }

      return await response.json();
    },

    async login(email, password, apiUrl) {
      const response = await fetch(`${apiUrl}/api/widget/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw error with message from API
        throw new Error(data.error || 'Login failed');
      }

      return data;
    },

    async register(userData, apiUrl) {
      const response = await fetch(`${apiUrl}/api/widget/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw error with message from API
        throw new Error(data.error || 'Registration failed');
      }

      return data;
    },

    async logout(token, apiUrl) {
      const response = await fetch(`${apiUrl}/api/widget/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Widget-Token': token
        }
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      return await response.json();
    }
  };

  // Socket.io connection
  const socket = {
    instance: null,

    connect(apiUrl, customerId) {
      if (!window.io) {
        console.warn('Socket.io not loaded. Real-time updates disabled.');
        return;
      }

      this.instance = window.io(apiUrl, {
        transports: ['websocket', 'polling']
      });

      this.instance.on('connect', () => {
        console.log('[AGChat] Socket connected');
        
        // Authenticate after connection
        this.instance.emit('authenticate', {
          userId: customerId,
          userType: 'customer',
          username: 'Customer'
        });
      });

      this.instance.on('message:new', (payload) => {
        if (payload.conversationId === state.conversationId) {
          // Don't show customer's own messages (they're already shown in sendMessage)
          if (payload.message.senderType !== 'customer') {
            ui.addMessage(payload.message);
            if (!state.open) {
              state.unreadCount++;
              ui.updateUnreadBadge();
            }
          }
        }
      });

      this.instance.on('disconnect', () => {
        console.log('[AGChat] Socket disconnected');
      });
    },

    disconnect() {
      if (this.instance) {
        this.instance.disconnect();
        this.instance = null;
      }
    },

    emit(event, data) {
      if (this.instance) {
        this.instance.emit(event, data);
      }
    }
  };

  // UI Management
  const ui = {
    container: null,

    create() {
      // Inject CSS
      this.injectStyles();

      // Create widget container
      const container = document.createElement('div');
      container.id = 'ag-chat-widget';
      container.className = 'ag-chat-widget';
      container.innerHTML = this.getTemplate();
      document.body.appendChild(container);

      this.container = container;
      this.attachEventListeners();
      this.updateColors();
    },

    injectStyles() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `${state.config.apiUrl}/chat-widget.css`;
      document.head.appendChild(link);
    },

    getTemplate() {
      const settings = state.config.settings;
      
      return `
        <div class="ag-chat-button" id="ag-chat-button">
          <svg class="ag-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="ag-chat-badge" id="ag-chat-badge" style="display: none;">0</span>
        </div>

        <div class="ag-chat-window" id="ag-chat-window" style="display: none;">
          <div class="ag-chat-header">
            <div class="ag-chat-header-content">
              <h3 class="ag-chat-title">${settings.headerTitle}</h3>
              <p class="ag-chat-subtitle">${settings.headerSubtitle}</p>
            </div>
            <button class="ag-chat-close" id="ag-chat-close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="ag-chat-messages" id="ag-chat-messages">
            ${settings.welcomeMessage ? `
              <div class="ag-chat-message ag-chat-message-system">
                <div class="ag-chat-message-content">
                  <p>${settings.welcomeMessage}</p>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="ag-chat-input-container">
            <textarea 
              class="ag-chat-input" 
              id="ag-chat-input" 
              placeholder="${settings.placeholderText}"
              rows="1"
            ></textarea>
            <button class="ag-chat-send" id="ag-chat-send">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          <div class="ag-chat-powered">
            Powered by AG Chat
          </div>
        </div>

        <!-- Auth Modal -->
        <div class="ag-chat-auth-modal" id="ag-chat-auth-modal" style="display: none;">
          <div class="ag-chat-auth-overlay"></div>
          <div class="ag-chat-auth-container">
            <div class="ag-chat-auth-header">
              <h3>เข้าสู่ระบบ</h3>
              <button class="ag-chat-auth-close" id="ag-chat-auth-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            <div class="ag-chat-auth-tabs">
              <button class="ag-chat-auth-tab active" data-tab="login">เข้าสู่ระบบ</button>
              <button class="ag-chat-auth-tab" data-tab="register">สมัครสมาชิก</button>
            </div>

            <!-- Login Form -->
            <div class="ag-chat-auth-form" id="ag-chat-login-form">
              <div class="ag-chat-auth-field">
                <label>อีเมล</label>
                <input type="email" id="ag-chat-login-email" placeholder="your@email.com">
              </div>
              <div class="ag-chat-auth-field">
                <label>รหัสผ่าน</label>
                <input type="password" id="ag-chat-login-password" placeholder="รหัสผ่าน">
              </div>
              <button class="ag-chat-auth-submit" id="ag-chat-login-submit">เข้าสู่ระบบ</button>
            </div>

            <!-- Register Form -->
            <div class="ag-chat-auth-form" id="ag-chat-register-form" style="display: none;">
              <div class="ag-chat-auth-field">
                <label>ชื่อ</label>
                <input type="text" id="ag-chat-register-name" placeholder="ชื่อของคุณ">
              </div>
              <div class="ag-chat-auth-field">
                <label>อีเมล</label>
                <input type="email" id="ag-chat-register-email" placeholder="your@email.com">
              </div>
              <div class="ag-chat-auth-field">
                <label>เบอร์โทรศัพท์</label>
                <input type="tel" id="ag-chat-register-phone" placeholder="0812345678">
              </div>
              <div class="ag-chat-auth-field">
                <label>รหัสผ่าน</label>
                <input type="password" id="ag-chat-register-password" placeholder="รหัสผ่าน">
              </div>
              <button class="ag-chat-auth-submit" id="ag-chat-register-submit">สมัครสมาชิก</button>
            </div>
          </div>
        </div>
      `;
    },

    attachEventListeners() {
      const button = document.getElementById('ag-chat-button');
      const close = document.getElementById('ag-chat-close');
      const input = document.getElementById('ag-chat-input');
      const send = document.getElementById('ag-chat-send');

      button.addEventListener('click', () => this.toggleWindow());
      close.addEventListener('click', () => this.toggleWindow());
      send.addEventListener('click', () => this.sendMessage());
      
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });

      // Auto-resize textarea
      input.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
      });

      // Auth modal event listeners
      this.attachAuthEventListeners();
    },

    attachAuthEventListeners() {
      const authModal = document.getElementById('ag-chat-auth-modal');
      const authClose = document.getElementById('ag-chat-auth-close');
      const authTabs = document.querySelectorAll('.ag-chat-auth-tab');
      const loginForm = document.getElementById('ag-chat-login-form');
      const registerForm = document.getElementById('ag-chat-register-form');
      const loginSubmit = document.getElementById('ag-chat-login-submit');
      const registerSubmit = document.getElementById('ag-chat-register-submit');

      // Close modal
      authClose.addEventListener('click', () => this.hideAuthModal());
      authModal.addEventListener('click', (e) => {
        if (e.target === authModal) this.hideAuthModal();
      });

      // Tab switching
      authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const tabType = tab.dataset.tab;
          this.switchAuthTab(tabType);
        });
      });

      // Form submissions
      loginSubmit.addEventListener('click', () => this.handleLogin());
      registerSubmit.addEventListener('click', () => this.handleRegister());

      // Enter key for forms
      document.getElementById('ag-chat-login-email').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
      document.getElementById('ag-chat-login-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
    },

    updateColors() {
      const settings = state.config.settings;
      const root = document.documentElement;
      root.style.setProperty('--ag-chat-primary', settings.primaryColor);
      root.style.setProperty('--ag-chat-accent', settings.accentColor);
    },

    toggleWindow() {
      state.open = !state.open;
      const window = document.getElementById('ag-chat-window');
      const button = document.getElementById('ag-chat-button');

      if (state.open) {
        // Check if user is authenticated
        if (!state.isAuthenticated) {
          this.showAuthModal();
          state.open = false; // Reset state since we're showing auth modal
          return;
        }

        window.style.display = 'flex';
        button.classList.add('ag-chat-button-open');
        this.scrollToBottom();
        state.unreadCount = 0;
        this.updateUnreadBadge();
        
        // Load conversation if not loaded and user is authenticated
        if (!state.conversationId && state.isAuthenticated && state.token) {
          this.loadConversation();
        }
      } else {
        window.style.display = 'none';
        button.classList.remove('ag-chat-button-open');
      }
    },

    async loadConversation() {
      try {
        // Check if user is authenticated
        if (!state.isAuthenticated || !state.token) {
          console.log('[AGChat] User not authenticated, skipping conversation load');
          return;
        }

        this.showLoading();

        // Try to get existing conversation
        let result = await api.getConversation(state.token, state.config.apiUrl);
        
        if (result.success && result.data) {
          // Existing conversation found
          state.conversationId = result.data.id;
          this.renderMessages(result.data.messages || []);
        } else {
          // Create new conversation
          result = await api.createConversation(state.token, state.config.apiUrl);
          if (result.success && result.data) {
            state.conversationId = result.data.id;
          }
        }

        this.hideLoading();
      } catch (error) {
        console.error('[AGChat] Failed to load conversation:', error);
        this.showError('Failed to load conversation');
      }
    },

    async sendMessage() {
      const input = document.getElementById('ag-chat-input');
      const content = input.value.trim();

      if (!content) return;

      if (!state.conversationId) {
        console.error('[AGChat] No active conversation');
        return;
      }

      try {
        // Clear input
        input.value = '';
        input.style.height = 'auto';

        // Add message to UI immediately
        this.addMessage({
          id: 'temp-' + Date.now(),
          content,
          senderType: 'customer',
          createdAt: new Date().toISOString(),
          customer: {
            name: state.config.customerInfo?.name || 'You'
          }
        });

        // Send to server
        const result = await api.sendMessage(
          state.token,
          state.config.apiUrl,
          state.conversationId,
          content
        );

        if (!result.success) {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('[AGChat] Failed to send message:', error);
        this.showError('Failed to send message');
      }
    },

    renderMessages(messages) {
      const container = document.getElementById('ag-chat-messages');
      const welcomeMsg = container.querySelector('.ag-chat-message-system');
      
      // Clear existing messages (except welcome message)
      const existingMessages = container.querySelectorAll('.ag-chat-message:not(.ag-chat-message-system)');
      existingMessages.forEach(msg => msg.remove());

      // Add messages
      messages.forEach(message => {
        this.addMessage(message, false);
      });

      this.scrollToBottom();
    },

    addMessage(message, shouldScroll = true) {
      const container = document.getElementById('ag-chat-messages');
      const isCustomer = message.senderType === 'customer';
      const time = new Date(message.createdAt).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit'
      });

      const messageEl = document.createElement('div');
      messageEl.className = `ag-chat-message ${isCustomer ? 'ag-chat-message-customer' : 'ag-chat-message-agent'}`;
      messageEl.innerHTML = `
        <div class="ag-chat-message-content">
          ${!isCustomer ? `<div class="ag-chat-message-sender">${message.senderName || 'Agent'}</div>` : ''}
          <p>${this.escapeHtml(message.content)}</p>
          <div class="ag-chat-message-time">${time}</div>
        </div>
      `;

      container.appendChild(messageEl);

      if (shouldScroll) {
        this.scrollToBottom();
      }
    },

    scrollToBottom() {
      const container = document.getElementById('ag-chat-messages');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    },

    updateUnreadBadge() {
      const badge = document.getElementById('ag-chat-badge');
      if (state.unreadCount > 0) {
        badge.textContent = state.unreadCount > 9 ? '9+' : state.unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    },

    showLoading() {
      const container = document.getElementById('ag-chat-messages');
      const loader = document.createElement('div');
      loader.className = 'ag-chat-loading';
      loader.id = 'ag-chat-loading';
      loader.innerHTML = '<div class="ag-chat-spinner"></div>';
      container.appendChild(loader);
    },

    hideLoading() {
      const loader = document.getElementById('ag-chat-loading');
      if (loader) {
        loader.remove();
      }
    },

    showError(message, containerId = 'ag-chat-messages') {
      const container = document.getElementById(containerId);
      console.log('[AGChat] showError - containerId:', containerId, 'container:', container);
      
      if (!container) {
        console.error('[AGChat] Container not found:', containerId);
        // Fallback: try to show error in main chat window
        const fallbackContainer = document.getElementById('ag-chat-messages');
        if (fallbackContainer) {
          console.log('[AGChat] Using fallback container');
          const error = document.createElement('div');
          error.className = 'ag-chat-error';
          error.textContent = message;
          fallbackContainer.insertBefore(error, fallbackContainer.firstChild);
          setTimeout(() => error.remove(), 5000);
        }
        return;
      }
      
      // Remove existing error messages
      const existingErrors = container.querySelectorAll('.ag-chat-error');
      existingErrors.forEach(err => err.remove());
      
      const error = document.createElement('div');
      error.className = 'ag-chat-error';
      error.textContent = message;
      container.insertBefore(error, container.firstChild);
      
      console.log('[AGChat] Error message displayed:', message);
      setTimeout(() => error.remove(), 5000);
    },

    escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    },

    // Auth modal functions
    showAuthModal() {
      const modal = document.getElementById('ag-chat-auth-modal');
      modal.style.display = 'flex';
      state.showAuthModal = true;
    },

    hideAuthModal() {
      const modal = document.getElementById('ag-chat-auth-modal');
      modal.style.display = 'none';
      state.showAuthModal = false;
    },

    switchAuthTab(tabType) {
      const tabs = document.querySelectorAll('.ag-chat-auth-tab');
      const loginForm = document.getElementById('ag-chat-login-form');
      const registerForm = document.getElementById('ag-chat-register-form');
      const header = document.querySelector('.ag-chat-auth-header h3');

      tabs.forEach(tab => tab.classList.remove('active'));

      if (tabType === 'login') {
        document.querySelector('[data-tab="login"]').classList.add('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        header.textContent = 'เข้าสู่ระบบ';
      } else {
        document.querySelector('[data-tab="register"]').classList.add('active');
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        header.textContent = 'สมัครสมาชิก';
      }
    },

    async handleLogin() {
      const email = document.getElementById('ag-chat-login-email').value.trim();
      const password = document.getElementById('ag-chat-login-password').value.trim();

      if (!email || !password) {
        this.showError('กรุณากรอกอีเมลและรหัสผ่าน', 'ag-chat-login-form');
        return;
      }

      try {
        const result = await api.login(email, password, state.config.apiUrl);
        
        if (result.success) {
          state.isAuthenticated = true;
          state.user = result.data.user;
          state.token = result.data.token;
          state.customerId = result.data.user.id;
          
          console.log('[AGChat] Login successful, user:', state.user);
          console.log('[AGChat] Token:', state.token);
          
          // Connect socket after authentication
          if (window.io && state.config) {
            socket.connect(state.config.apiUrl, state.customerId);
          }
          
          this.hideAuthModal();
          this.updateUserInfo();
          this.loadConversation();
          
          // Show success message
          this.addMessage({
            id: 'system-' + Date.now(),
            content: 'เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับ ' + state.user.name,
            senderType: 'system',
            createdAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.log('[AGChat] Login error caught:', error.message);
        this.showError('เข้าสู่ระบบล้มเหลว: ' + error.message, 'ag-chat-login-form');
      }
    },

    async handleRegister() {
      const name = document.getElementById('ag-chat-register-name').value.trim();
      const email = document.getElementById('ag-chat-register-email').value.trim();
      const phone = document.getElementById('ag-chat-register-phone').value.trim();
      const password = document.getElementById('ag-chat-register-password').value.trim();

      if (!name || !email || !password) {
        this.showError('กรุณากรอกข้อมูลให้ครบถ้วน', 'ag-chat-register-form');
        return;
      }

      try {
        const result = await api.register({
          name,
          email,
          phone,
          password
        }, state.config.apiUrl);
        
        if (result.success) {
          state.isAuthenticated = true;
          state.user = result.data.user;
          state.token = result.data.token;
          state.customerId = result.data.user.id;
          
          console.log('[AGChat] Registration successful, user:', state.user);
          console.log('[AGChat] Token:', state.token);
          
          // Connect socket after authentication
          if (window.io && state.config) {
            socket.connect(state.config.apiUrl, state.customerId);
          }
          
          this.hideAuthModal();
          this.updateUserInfo();
          this.loadConversation();
          
          // Show success message
          this.addMessage({
            id: 'system-' + Date.now(),
            content: 'สมัครสมาชิกสำเร็จ! ยินดีต้อนรับ ' + state.user.name,
            senderType: 'system',
            createdAt: new Date().toISOString()
          });
        }
        } catch (error) {
        console.log('[AGChat] Register error caught:', error.message);
        this.showError('สมัครสมาชิกล้มเหลว: ' + error.message, 'ag-chat-register-form');
      }
    },

    updateUserInfo() {
      if (state.isAuthenticated && state.user) {
        // Update welcome message with user info
        const messagesContainer = document.getElementById('ag-chat-messages');
        const systemMessage = messagesContainer.querySelector('.ag-chat-message-system');
        if (systemMessage) {
          systemMessage.innerHTML = `
            <div class="ag-chat-message-content">
              <p>สวัสดี ${state.user.name}! ยินดีต้อนรับสู่ระบบแชท</p>
              <div class="ag-chat-user-info">
                <small>อีเมล: ${state.user.email}</small>
                ${state.user.phone ? `<small>โทร: ${state.user.phone}</small>` : ''}
              </div>
            </div>
          `;
        }
      }
    },

    destroy() {
      if (this.container) {
        this.container.remove();
        this.container = null;
      }
    }
  };

  // Main AGChat object
  const AGChat = {
    async init(config) {
      if (state.initialized) {
        console.warn('[AGChat] Already initialized');
        return;
      }

      try {
        // Validate config
        if (!config.widgetKey) {
          throw new Error('widgetKey is required');
        }

        if (!config.apiUrl) {
          throw new Error('apiUrl is required');
        }

        // Initialize widget (without customer info - will authenticate later)
        console.log('[AGChat] Initializing widget with config:', config);
        const result = await api.init(
          config.widgetKey,
          {}, // No customer info on init - user must login
          config.apiUrl
        );

        if (!result.success) {
          console.error('[AGChat] Widget init failed:', result.error);
          throw new Error(result.error || 'Failed to initialize widget');
        }

        console.log('[AGChat] Widget init successful:', result.data);

        // Store state
        state.config = {
          ...config,
          settings: result.data.settings,
          customerInfo: null // No customer info yet
        };
        // Don't store token/customerId on init - will be set after login
        state.initialized = true;
        
        console.log('[AGChat] State updated:', {
          initialized: state.initialized,
          needsAuth: true
        });

        // Create UI
        ui.create();

        // Socket will connect after user authenticates
        // Connect socket for real-time updates
        // if (window.io) {
        //   socket.connect(config.apiUrl, state.customerId);
        // }

        // Auto-open if configured
        if (state.config.settings.autoOpen) {
          setTimeout(() => ui.toggleWindow(), 1000);
        }

        console.log('[AGChat] Initialized successfully');
      } catch (error) {
        console.error('[AGChat] Initialization failed:', error);
        throw error;
      }
    },

    open() {
      if (!state.initialized) {
        console.warn('[AGChat] Not initialized');
        return;
      }
      if (!state.open) {
        ui.toggleWindow();
      }
    },

    close() {
      if (!state.initialized) {
        console.warn('[AGChat] Not initialized');
        return;
      }
      if (state.open) {
        ui.toggleWindow();
      }
    },

    destroy() {
      socket.disconnect();
      ui.destroy();
      state.initialized = false;
      state.open = false;
      console.log('[AGChat] Destroyed');
    }
  };

  // Expose to window
  window.AGChat = AGChat;

  // Auto-init if config is provided in window
  if (window.AGChatConfig) {
    AGChat.init(window.AGChatConfig);
  }

})(window);

