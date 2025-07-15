/**
 * ClubOS TaskCard Component
 * Reusable component for displaying task responses
 */

window.ClubOS = window.ClubOS || {};
window.ClubOS.components = window.ClubOS.components || {};

window.ClubOS.components.TaskCard = class TaskCard {
    constructor(container) {
        this.container = container;
        this.elements = {};
        this.render();
        this.cacheElements();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="response-header">
                <div class="status-badge" data-element="statusBadge">
                    <span class="status-dot status-success" data-element="statusDot"></span>
                    <span data-element="statusText">Completed</span>
                </div>
                <div class="response-actions">
                    <div class="confidence-meter" data-element="confidenceMeter">
                        Confidence: <strong data-element="confidenceValue">0%</strong>
                    </div>
                    <button class="copy-btn" data-element="copyBtn" title="Copy response to clipboard">
                        Copy
                    </button>
                </div>
            </div>
            <div class="response-content" data-element="responseContent">
                <!-- Response will be inserted here -->
            </div>
        `;
        
        // Bind copy button
        this.container.querySelector('[data-element="copyBtn"]').addEventListener('click', () => this.copyContent());
    }
    
    cacheElements() {
        // Cache all elements with data-element attribute
        this.container.querySelectorAll('[data-element]').forEach(el => {
            const key = el.getAttribute('data-element');
            this.elements[key] = el;
        });
    }
    
    showLoading() {
        this.show();
        this.container.classList.add('loading');
        
        // Update status to processing
        this.elements.statusText.innerHTML = `Processing<span class="pulse-loader"><span class="pulse-dot"></span><span class="pulse-dot"></span><span class="pulse-dot"></span></span>`;
        this.elements.statusDot.className = 'status-dot status-processing';
        
        // Show confidence as loading
        this.elements.confidenceMeter.style.display = 'flex';
        this.elements.confidenceValue.textContent = '...';
        
        // Show skeleton loader
        this.elements.responseContent.innerHTML = `
            <div class="skeleton-loader">
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
                <div class="skeleton-line medium"></div>
            </div>
        `;
    }
    
    displayResponse(result, options = {}) {
        this.show();
        this.container.classList.remove('loading');
        
        // Clear any demo notices
        this.clearDemoNotices();
        
        // Update status
        const status = result.status || (options.isSlackSubmission ? 'sent' : 'completed');
        this.updateStatus(status);
        
        // Update confidence
        if (options.isSlackSubmission) {
            this.elements.confidenceMeter.style.display = 'none';
        } else {
            this.elements.confidenceMeter.style.display = 'flex';
            const confidence = result.confidence || 0;
            this.elements.confidenceValue.textContent = Math.round(confidence * 100) + '%';
        }
        
        // Update content
        this.updateContent(result, options);
        
        // Smooth scroll
        this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    updateStatus(status) {
        this.elements.statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        
        // Update status dot
        this.elements.statusDot.className = 'status-dot';
        if (status === 'completed' || status === 'success' || status === 'sent') {
            this.elements.statusDot.classList.add('status-success');
        } else if (status === 'error' || status === 'failed') {
            this.elements.statusDot.classList.add('status-error');
        } else {
            this.elements.statusDot.classList.add('status-processing');
        }
    }
    
    updateContent(result, options) {
        let content = '';
        
        if (options.isSlackSubmission) {
            content = this.renderSlackContent(result);
        } else if (result.recommendation) {
            content = this.renderRecommendation(result);
        } else if (result.response) {
            content = result.response;
        } else {
            content = '<em>No response data available</em>';
        }
        
        this.elements.responseContent.innerHTML = content;
    }
    
    renderSlackContent(result) {
        return `
            <strong>Sent to Slack</strong><br>
            Your question has been posted to the general Slack channel.
            ${result.slack_message_id ? `<br><small>Message ID: ${result.slack_message_id}</small>` : ''}
        `;
    }
    
    renderRecommendation(result) {
        let content = '<strong>Recommendation:</strong>';
        
        if (Array.isArray(result.recommendation)) {
            content += '<ul>' + result.recommendation.map(step => `<li>${step}</li>`).join('') + '</ul>';
        } else {
            content += `<br>${result.recommendation}`;
        }
        
        // Add metadata if available
        if (result.llm_route_used || result.processing_time) {
            content += this.renderMetadata(result);
        }
        
        return content;
    }
    
    renderMetadata(result) {
        let metadata = '<div class="response-metadata">';
        
        if (result.llm_route_used) {
            metadata += `<div>Route Used: <span class="metadata-value">${result.llm_route_used}</span></div>`;
        }
        if (result.processing_time) {
            metadata += `<div>Processing Time: <span class="metadata-value">${result.processing_time}</span></div>`;
        }
        
        metadata += '</div>';
        return metadata;
    }
    
    async copyContent() {
        const content = this.elements.responseContent.innerText;
        const btn = this.elements.copyBtn;
        
        try {
            await navigator.clipboard.writeText(content);
            this.showCopySuccess(btn);
        } catch (err) {
            console.error('Failed to copy:', err);
            this.copyFallback(content, btn);
        }
    }
    
    copyFallback(content, btn) {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopySuccess(btn);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }
    
    showCopySuccess(btn) {
        btn.classList.add('copied');
        btn.textContent = 'Copied';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.textContent = 'Copy';
        }, 2000);
    }
    
    addDemoNotice(message = 'This is a demo response. In production, this would be processed by your backend.') {
        const notice = document.createElement('div');
        notice.setAttribute('data-demo-notice', 'true');
        notice.className = 'demo-notice';
        notice.innerHTML = message;
        this.container.appendChild(notice);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notice.parentNode) {
                notice.style.opacity = '0';
                setTimeout(() => notice.remove(), 500);
            }
        }, 8000);
    }
    
    clearDemoNotices() {
        const notices = this.container.querySelectorAll('[data-demo-notice]');
        notices.forEach(notice => notice.remove());
    }
    
    show() {
        this.container.style.display = 'block';
    }
    
    hide() {
        this.container.style.display = 'none';
        this.clearDemoNotices();
    }
    
    reset() {
        this.hide();
        this.container.classList.remove('loading');
        this.elements.responseContent.innerHTML = '';
    }
};

// Create singleton instance for backward compatibility
window.ClubOS.ResponseManager = {
    taskCard: null,
    
    init() {
        const container = document.getElementById('responseArea');
        if (container) {
            this.taskCard = new window.ClubOS.components.TaskCard(container);
        }
    },
    
    showLoading() {
        if (this.taskCard) this.taskCard.showLoading();
    },
    
    display(result, isSlackSubmission = false) {
        if (this.taskCard) {
            this.taskCard.displayResponse(result, { isSlackSubmission });
        }
    },
    
    hide() {
        if (this.taskCard) this.taskCard.hide();
    },
    
    async copyResponse() {
        if (this.taskCard) await this.taskCard.copyContent();
    },
    
    addDemoNotice() {
        if (this.taskCard) {
            this.taskCard.addDemoNotice('This is a demo response showing TrackMan troubleshooting steps. In production, this would be processed by your backend.');
        }
    }
};