/**
 * ClubOS Response Manager
 * Handles displaying API responses in the UI
 */

window.ClubOS = window.ClubOS || {};

window.ClubOS.ResponseManager = {
    elements: {},
    
    init() {
        this.cacheElements();
        console.log('ResponseManager initialized');
    },
    
    cacheElements() {
        this.elements = {
            responseArea: document.getElementById('responseArea'),
            statusBadge: document.getElementById('statusBadge'),
            statusText: document.getElementById('statusText'),
            statusDot: document.getElementById('statusDot'),
            confidenceValue: document.getElementById('confidenceValue'),
            confidenceMeter: document.getElementById('confidenceMeter'),
            responseContent: document.getElementById('responseContent')
        };
    },
    
    showLoading() {
        if (!this.elements.responseArea) return;
        
        this.elements.responseArea.style.display = 'block';
        
        // Update status to processing
        if (this.elements.statusText) {
            this.elements.statusText.textContent = 'Processing';
        }
        
        if (this.elements.statusDot) {
            this.elements.statusDot.className = 'status-dot status-processing';
        }
        
        // Show loading skeleton
        if (this.elements.responseContent) {
            this.elements.responseContent.innerHTML = `
                <div class="skeleton-loader">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line short"></div>
                </div>
            `;
        }
        
        // Scroll into view
        this.elements.responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },
    
    display(result, isSlackSubmission = false) {
        if (!this.elements.responseArea) return;
        
        this.elements.responseArea.style.display = 'block';
        
        // Clear any existing demo notices
        const existingNotices = this.elements.responseArea.querySelectorAll('[data-demo-notice]');
        existingNotices.forEach(notice => notice.remove());
        
        // Update status
        const status = result.status || (isSlackSubmission ? 'sent' : 'completed');
        if (this.elements.statusText) {
            this.elements.statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
        
        // Update status dot
        if (this.elements.statusDot) {
            this.elements.statusDot.className = 'status-dot';
            if (status === 'completed' || status === 'success' || status === 'sent') {
                this.elements.statusDot.classList.add('status-success');
            } else if (status === 'error' || status === 'failed') {
                this.elements.statusDot.classList.add('status-error');
            } else {
                this.elements.statusDot.classList.add('status-processing');
            }
        }
        
        // Update confidence (hide for Slack submissions)
        if (this.elements.confidenceMeter) {
            if (isSlackSubmission || result.confidence === undefined) {
                this.elements.confidenceMeter.style.display = 'none';
            } else {
                this.elements.confidenceMeter.style.display = 'flex';
                if (this.elements.confidenceValue) {
                    this.elements.confidenceValue.textContent = Math.round((result.confidence || 0) * 100) + '%';
                }
            }
        }
        
        // Update response content
        if (this.elements.responseContent) {
            if (isSlackSubmission) {
                this.elements.responseContent.innerHTML = `
                    <strong>Sent to Slack</strong><br>
                    Your question has been posted to the general Slack channel.
                    ${result.slack_message_id ? `<br><small>Message ID: ${result.slack_message_id}</small>` : ''}
                `;
            } else if (result.recommendation) {
                let content = '<strong>Recommendation:</strong>';
                if (Array.isArray(result.recommendation)) {
                    content += '<ul>' + result.recommendation.map(step => `<li>${step}</li>`).join('') + '</ul>';
                } else {
                    content += `<br>${result.recommendation}`;
                }
                
                // Add metadata if available
                if (result.llm_route_used || result.processing_time) {
                    content += '<div class="response-metadata">';
                    if (result.llm_route_used) {
                        content += `<div>Route Used: <span class="text-secondary">${result.llm_route_used}</span></div>`;
                    }
                    if (result.processing_time) {
                        content += `<div>Processing Time: <span class="text-secondary">${result.processing_time}</span></div>`;
                    }
                    content += '</div>';
                }
                
                this.elements.responseContent.innerHTML = content;
            } else if (result.response) {
                this.elements.responseContent.innerHTML = result.response;
            } else {
                this.elements.responseContent.innerHTML = '<em>No response data available</em>';
            }
        }
        
        // Smooth scroll to response with RAF
        if (window.ClubOS.RAF) {
            window.ClubOS.RAF.add(() => {
                this.elements.responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        } else {
            this.elements.responseArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    },
    
    hide() {
        if (this.elements.responseArea) {
            this.elements.responseArea.style.display = 'none';
        }
    },
    
    showError(message) {
        if (!this.elements.responseArea) return;
        
        this.elements.responseArea.style.display = 'block';
        
        // Update status to error
        if (this.elements.statusText) {
            this.elements.statusText.textContent = 'Error';
        }
        
        if (this.elements.statusDot) {
            this.elements.statusDot.className = 'status-dot status-error';
        }
        
        // Hide confidence
        if (this.elements.confidenceMeter) {
            this.elements.confidenceMeter.style.display = 'none';
        }
        
        // Show error message
        if (this.elements.responseContent) {
            this.elements.responseContent.innerHTML = `
                <div class="error-response">
                    <strong>Error:</strong> ${message}
                </div>
            `;
        }
    }
};

// Add required styles
const responseStyles = `
/* Response Manager Styles */
.response-metadata {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-secondary);
    font-size: 0.75rem;
    color: var(--text-muted);
}

.text-secondary {
    color: var(--text-secondary);
}

.skeleton-loader {
    padding: 1rem 0;
}

.skeleton-line {
    height: 16px;
    background: linear-gradient(
        90deg,
        var(--bg-tertiary) 25%,
        var(--border-primary) 50%,
        var(--bg-tertiary) 75%
    );
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    margin-bottom: 0.75rem;
}

.skeleton-line.short {
    width: 60%;
}

.skeleton-line.medium {
    width: 80%;
}

@keyframes loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.error-response {
    color: var(--status-error);
}

/* Status animations */
.status-processing {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}
`;

// Inject styles if not already present
if (!document.querySelector('#clubos-response-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'clubos-response-styles';
    styleEl.textContent = responseStyles;
    document.head.appendChild(styleEl);
}
