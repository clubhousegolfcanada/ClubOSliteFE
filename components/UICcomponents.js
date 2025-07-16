/**
 * ClubOS UI Components
 * Reusable components for modals, notifications, and error handling
 */

window.ClubOS = window.ClubOS || {};
window.ClubOS.UI = window.ClubOS.UI || {};

// Modal Component
window.ClubOS.UI.Modal = class Modal {
    constructor(options = {}) {
        this.options = {
            title: options.title || 'ClubOS',
            content: options.content || '',
            type: options.type || 'info', // info, success, error, warning, confirm
            confirmText: options.confirmText || 'OK',
            cancelText: options.cancelText || 'Cancel',
            onConfirm: options.onConfirm || (() => {}),
            onCancel: options.onCancel || (() => {}),
            closeOnOverlay: options.closeOnOverlay !== false
        };
        
        this.modal = null;
        this.isOpen = false;
        this.render();
    }
    
    render() {
        // Create modal structure
        this.modal = document.createElement('div');
        this.modal.className = 'clubos-modal-overlay';
        this.modal.innerHTML = `
            <div class="clubos-modal">
                <div class="clubos-modal-header">
                    <h3 class="clubos-modal-title">${this.options.title}</h3>
                    <button class="clubos-modal-close" aria-label="Close modal">&times;</button>
                </div>
                <div class="clubos-modal-content">
                    ${this.options.content}
                </div>
                <div class="clubos-modal-footer">
                    ${this.options.type === 'confirm' ? `
                        <button class="btn btn-secondary clubos-modal-cancel">
                            ${this.options.cancelText}
                        </button>
                    ` : ''}
                    <button class="btn btn-primary clubos-modal-confirm">
                        ${this.options.confirmText}
                    </button>
                </div>
            </div>
        `;
        
        // Add type-specific styling
        const modalEl = this.modal.querySelector('.clubos-modal');
        modalEl.classList.add(`clubos-modal-${this.options.type}`);
        
        // Bind events
        this.bindEvents();
    }
    
    bindEvents() {
        // Close button
        const closeBtn = this.modal.querySelector('.clubos-modal-close');
        closeBtn.addEventListener('click', () => this.close());
        
        // Confirm button
        const confirmBtn = this.modal.querySelector('.clubos-modal-confirm');
        confirmBtn.addEventListener('click', () => {
            this.options.onConfirm();
            this.close();
        });
        
        // Cancel button (if present)
        const cancelBtn = this.modal.querySelector('.clubos-modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.options.onCancel();
                this.close();
            });
        }
        
        // Overlay click
        if (this.options.closeOnOverlay) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }
        
        // Escape key
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
    }
    
    open() {
        if (this.isOpen) return;
        
        document.body.appendChild(this.modal);
        document.addEventListener('keydown', this.escapeHandler);
        
        // Force reflow for animation
        this.modal.offsetHeight;
        this.modal.classList.add('clubos-modal-open');
        
        // Focus management
        const firstButton = this.modal.querySelector('button');
        if (firstButton) firstButton.focus();
        
        this.isOpen = true;
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.modal.classList.remove('clubos-modal-open');
        document.removeEventListener('keydown', this.escapeHandler);
        
        // Wait for animation
        setTimeout(() => {
            if (this.modal.parentNode) {
                this.modal.parentNode.removeChild(this.modal);
            }
        }, 300);
        
        this.isOpen = false;
    }
    
    static confirm(message, onConfirm, onCancel) {
        const modal = new Modal({
            title: 'Confirm Action',
            content: message,
            type: 'confirm',
            onConfirm: onConfirm || (() => {}),
            onCancel: onCancel || (() => {})
        });
        modal.open();
        return modal;
    }
    
    static alert(message, title = 'Alert', type = 'info') {
        const modal = new Modal({
            title: title,
            content: message,
            type: type
        });
        modal.open();
        return modal;
    }
};

// Notification Component
window.ClubOS.UI.Notification = class Notification {
    constructor(options = {}) {
        this.options = {
            message: options.message || '',
            type: options.type || 'info', // success, error, warning, info
            duration: options.duration || 4000,
            position: options.position || 'top-right',
            dismissible: options.dismissible !== false
        };
        
        this.notification = null;
        this.timeoutId = null;
        this.render();
    }
    
    render() {
        this.notification = document.createElement('div');
        this.notification.className = `clubos-notification clubos-notification-${this.options.type}`;
        
        const icon = this.getIcon();
        
        this.notification.innerHTML = `
            <div class="clubos-notification-content">
                <span class="clubos-notification-icon">${icon}</span>
                <span class="clubos-notification-message">${this.options.message}</span>
                ${this.options.dismissible ? `
                    <button class="clubos-notification-close" aria-label="Dismiss">&times;</button>
                ` : ''}
            </div>
        `;
        
        if (this.options.dismissible) {
            const closeBtn = this.notification.querySelector('.clubos-notification-close');
            closeBtn.addEventListener('click', () => this.dismiss());
        }
    }
    
    getIcon() {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[this.options.type] || icons.info;
    }
    
    show() {
        // Get or create container
        let container = document.querySelector(`.clubos-notification-container-${this.options.position}`);
        if (!container) {
            container = document.createElement('div');
            container.className = `clubos-notification-container clubos-notification-container-${this.options.position}`;
            document.body.appendChild(container);
        }
        
        // Add notification
        container.appendChild(this.notification);
        
        // Trigger animation
        setTimeout(() => {
            this.notification.classList.add('clubos-notification-show');
        }, 10);
        
        // Auto dismiss
        if (this.options.duration > 0) {
            this.timeoutId = setTimeout(() => this.dismiss(), this.options.duration);
        }
    }
    
    dismiss() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        this.notification.classList.remove('clubos-notification-show');
        
        setTimeout(() => {
            if (this.notification.parentNode) {
                this.notification.parentNode.removeChild(this.notification);
                
                // Remove container if empty
                const container = this.notification.parentNode;
                if (container && container.children.length === 0) {
                    container.parentNode.removeChild(container);
                }
            }
        }, 300);
    }
    
    static show(message, type = 'info', duration = 4000) {
        const notification = new Notification({
            message: message,
            type: type,
            duration: duration
        });
        notification.show();
        return notification;
    }
    
    static success(message, duration) {
        return Notification.show(message, 'success', duration);
    }
    
    static error(message, duration) {
        return Notification.show(message, 'error', duration || 6000);
    }
    
    static warning(message, duration) {
        return Notification.show(message, 'warning', duration);
    }
    
    static info(message, duration) {
        return Notification.show(message, 'info', duration);
    }
};

// Loading Overlay Component
window.ClubOS.UI.LoadingOverlay = class LoadingOverlay {
    constructor(options = {}) {
        this.options = {
            message: options.message || 'Processing...',
            target: options.target || document.body,
            blur: options.blur !== false
        };
        
        this.overlay = null;
        this.render();
    }
    
    render() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'clubos-loading-overlay';
        
        if (this.options.blur) {
            this.overlay.classList.add('clubos-loading-blur');
        }
        
        this.overlay.innerHTML = `
            <div class="clubos-loading-content">
                <div class="clubos-loading-spinner">
                    <div class="clubos-loading-dot"></div>
                    <div class="clubos-loading-dot"></div>
                    <div class="clubos-loading-dot"></div>
                </div>
                <div class="clubos-loading-message">${this.options.message}</div>
            </div>
        `;
    }
    
    show() {
        const target = typeof this.options.target === 'string' 
            ? document.querySelector(this.options.target) 
            : this.options.target;
            
        if (!target) return;
        
        // Position relative to target
        const isBody = target === document.body;
        if (!isBody) {
            const position = window.getComputedStyle(target).position;
            if (position === 'static') {
                target.style.position = 'relative';
            }
        }
        
        target.appendChild(this.overlay);
        
        // Trigger animation
        setTimeout(() => {
            this.overlay.classList.add('clubos-loading-show');
        }, 10);
    }
    
    hide() {
        if (!this.overlay.parentNode) return;
        
        this.overlay.classList.remove('clubos-loading-show');
        
        setTimeout(() => {
            if (this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
        }, 300);
    }
    
    updateMessage(message) {
        const messageEl = this.overlay.querySelector('.clubos-loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
};

// Form Validator Component
window.ClubOS.UI.FormValidator = class FormValidator {
    constructor(form, rules = {}) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;
        this.rules = rules;
        this.errors = {};
        
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        // Add real-time validation
        Object.keys(this.rules).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => {
                    if (this.errors[fieldName]) {
                        this.validateField(fieldName);
                    }
                });
            }
        });
    }
    
    validateField(fieldName) {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return true;
        
        const rules = this.rules[fieldName];
        if (!rules) return true;
        
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Check each rule
        if (rules.required && !value) {
            isValid = false;
            errorMessage = rules.requiredMessage || `${fieldName} is required`;
        } else if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = rules.minLengthMessage || `Minimum ${rules.minLength} characters required`;
        } else if (rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = rules.maxLengthMessage || `Maximum ${rules.maxLength} characters allowed`;
        } else if (rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = rules.patternMessage || `Invalid format`;
        } else if (rules.custom && !rules.custom(value, this.form)) {
            isValid = false;
            errorMessage = rules.customMessage || `Invalid value`;
        }
        
        // Update UI
        if (isValid) {
            delete this.errors[fieldName];
            this.clearFieldError(field);
        } else {
            this.errors[fieldName] = errorMessage;
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }
    
    validateAll() {
        let isValid = true;
        
        Object.keys(this.rules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    showFieldError(field, message) {
        // Remove any existing error
        this.clearFieldError(field);
        
        // Add error class
        field.classList.add('clubos-field-error');
        
        // Create error message
        const errorEl = document.createElement('div');
        errorEl.className = 'clubos-field-error-message';
        errorEl.textContent = message;
        
        // Insert after field
        field.parentNode.insertBefore(errorEl, field.nextSibling);
    }
    
    clearFieldError(field) {
        field.classList.remove('clubos-field-error');
        
        const errorEl = field.parentNode.querySelector('.clubos-field-error-message');
        if (errorEl) {
            errorEl.remove();
        }
    }
    
    clearAllErrors() {
        Object.keys(this.errors).forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.clearFieldError(field);
            }
        });
        this.errors = {};
    }
    
    getErrors() {
        return this.errors;
    }
    
    hasErrors() {
        return Object.keys(this.errors).length > 0;
    }
};

// Utility function for creating styled alerts
window.ClubOS.UI.createAlert = function(options) {
    const defaults = {
        title: 'Alert',
        message: '',
        type: 'info',
        showIcon: true,
        dismissible: true,
        autoClose: 0
    };
    
    const config = { ...defaults, ...options };
    
    const alertEl = document.createElement('div');
    alertEl.className = `clubos-alert clubos-alert-${config.type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    alertEl.innerHTML = `
        ${config.showIcon ? `<span class="clubos-alert-icon">${icons[config.type] || icons.info}</span>` : ''}
        <div class="clubos-alert-content">
            ${config.title ? `<div class="clubos-alert-title">${config.title}</div>` : ''}
            <div class="clubos-alert-message">${config.message}</div>
        </div>
        ${config.dismissible ? `<button class="clubos-alert-close">&times;</button>` : ''}
    `;
    
    if (config.dismissible) {
        const closeBtn = alertEl.querySelector('.clubos-alert-close');
        closeBtn.addEventListener('click', () => {
            alertEl.style.opacity = '0';
            setTimeout(() => alertEl.remove(), 300);
        });
    }
    
    if (config.autoClose > 0) {
        setTimeout(() => {
            if (alertEl.parentNode) {
                alertEl.style.opacity = '0';
                setTimeout(() => alertEl.remove(), 300);
            }
        }, config.autoClose);
    }
    
    return alertEl;
};

// CSS Styles for components (to be added to main.css)
const componentStyles = `
/* Modal Styles */
.clubos-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.clubos-modal-overlay.clubos-modal-open {
    opacity: 1;
}

.clubos-modal {
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow: hidden;
    transform: scale(0.9);
    transition: transform 0.3s ease;
}

.clubos-modal-overlay.clubos-modal-open .clubos-modal {
    transform: scale(1);
}

.clubos-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-secondary);
}

.clubos-modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.clubos-modal-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.clubos-modal-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

.clubos-modal-content {
    padding: 1.5rem;
    max-height: 60vh;
    overflow-y: auto;
}

.clubos-modal-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-secondary);
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

/* Modal Type Variations */
.clubos-modal-error .clubos-modal-header {
    border-bottom-color: var(--status-error);
}

.clubos-modal-success .clubos-modal-header {
    border-bottom-color: var(--status-success);
}

.clubos-modal-warning .clubos-modal-header {
    border-bottom-color: var(--status-warning);
}

/* Notification Styles */
.clubos-notification-container {
    position: fixed;
    z-index: 1001;
    pointer-events: none;
}

.clubos-notification-container-top-right {
    top: 1rem;
    right: 1rem;
}

.clubos-notification-container-top-left {
    top: 1rem;
    left: 1rem;
}

.clubos-notification-container-bottom-right {
    bottom: 1rem;
    right: 1rem;
}

.clubos-notification-container-bottom-left {
    bottom: 1rem;
    left: 1rem;
}

.clubos-notification {
    background: var(--bg-secondary);
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 0.75rem;
    min-width: 300px;
    max-width: 400px;
    pointer-events: all;
    transform: translateX(100%);
    opacity: 0;
    transition: all 0.3s ease;
}

.clubos-notification-container-top-left .clubos-notification,
.clubos-notification-container-bottom-left .clubos-notification {
    transform: translateX(-100%);
}

.clubos-notification.clubos-notification-show {
    transform: translateX(0);
    opacity: 1;
}

.clubos-notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.clubos-notification-icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
}

.clubos-notification-message {
    flex: 1;
    font-size: 0.875rem;
}

.clubos-notification-close {
    flex-shrink: 0;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.clubos-notification-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

/* Notification Type Styles */
.clubos-notification-success {
    border-color: var(--status-success);
}

.clubos-notification-success .clubos-notification-icon {
    background: var(--status-success);
    color: white;
}

.clubos-notification-error {
    border-color: var(--status-error);
}

.clubos-notification-error .clubos-notification-icon {
    background: var(--status-error);
    color: white;
}

.clubos-notification-warning {
    border-color: var(--status-warning);
}

.clubos-notification-warning .clubos-notification-icon {
    background: var(--status-warning);
    color: white;
}

.clubos-notification-info {
    border-color: var(--status-info);
}

.clubos-notification-info .clubos-notification-icon {
    background: var(--status-info);
    color: white;
}

/* Loading Overlay Styles */
.clubos-loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.clubos-loading-overlay.clubos-loading-blur {
    backdrop-filter: blur(4px);
}

.clubos-loading-overlay.clubos-loading-show {
    opacity: 1;
}

.clubos-loading-content {
    text-align: center;
}

.clubos-loading-spinner {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 1rem;
}

.clubos-loading-dot {
    width: 12px;
    height: 12px;
    background: var(--accent);
    border-radius: 50%;
    animation: clubos-loading-pulse 1.4s infinite ease-in-out both;
}

.clubos-loading-dot:nth-child(1) {
    animation-delay: -0.32s;
}

.clubos-loading-dot:nth-child(2) {
    animation-delay: -0.16s;
}

@keyframes clubos-loading-pulse {
    0%, 80%, 100% {
        transform: scale(0);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.clubos-loading-message {
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
}

/* Form Validation Styles */
.clubos-field-error {
    border-color: var(--status-error) !important;
}

.clubos-field-error-message {
    color: var(--status-error);
    font-size: 0.75rem;
    margin-top: 0.25rem;
}

/* Alert Styles */
.clubos-alert {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid var(--border-secondary);
    border-radius: 8px;
    margin-bottom: 1rem;
    background: var(--bg-secondary);
    transition: opacity 0.3s ease;
}

.clubos-alert-icon {
    flex-shrink: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-weight: bold;
}

.clubos-alert-content {
    flex: 1;
}

.clubos-alert-title {
    font-weight: 600;
    margin-bottom: 0.25rem;
}

.clubos-alert-message {
    font-size: 0.875rem;
    color: var(--text-secondary);
}

.clubos-alert-close {
    flex-shrink: 0;
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 0;
    width: 1.5rem;
    height: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
}

.clubos-alert-close:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
}

/* Alert Type Styles */
.clubos-alert-success {
    border-color: var(--status-success);
    background: rgba(16, 185, 129, 0.1);
}

.clubos-alert-success .clubos-alert-icon {
    background: var(--status-success);
    color: white;
}

.clubos-alert-error {
    border-color: var(--status-error);
    background: rgba(239, 68, 68, 0.1);
}

.clubos-alert-error .clubos-alert-icon {
    background: var(--status-error);
    color: white;
}

.clubos-alert-warning {
    border-color: var(--status-warning);
    background: rgba(245, 158, 11, 0.1);
}

.clubos-alert-warning .clubos-alert-icon {
    background: var(--status-warning);
    color: white;
}

.clubos-alert-info {
    border-color: var(--status-info);
    background: rgba(59, 130, 246, 0.1);
}

.clubos-alert-info .clubos-alert-icon {
    background: var(--status-info);
    color: white;
}
`;

// Inject styles if not already present
if (!document.querySelector('#clubos-component-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'clubos-component-styles';
    styleEl.textContent = componentStyles;
    document.head.appendChild(styleEl);
}