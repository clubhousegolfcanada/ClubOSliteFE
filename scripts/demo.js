
/**
 * ClubOS Demo Management
 * Handles demo functionality for showcasing the system
 */

window.ClubOS = window.ClubOS || {};

window.ClubOS.Demo = {
    isDemo: false,
    demoTimeout: null,
    
    init() {
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.run());
            console.log('Demo button initialized');
        }
    },
    
    isRunning() {
        return this.isDemo;
    },
    
    async run() {
        console.log('Starting TrackMan demo...');
        this.isDemo = true;
        
        // Clear any existing timeout
        if (this.demoTimeout) {
            clearTimeout(this.demoTimeout);
        }
        
        // Set failsafe timeout
        this.demoTimeout = setTimeout(() => {
            if (this.isDemo) {
                console.error('Demo timed out, resetting state');
                this.cancel();
                alert('Demo timed out. Please try again.');
            }
        }, window.ClubOS.CONFIG.DEMO_TIMEOUT);
        
        // Get form elements directly from DOM
        const form = {
            form: document.getElementById('taskForm'),
            taskInput: document.getElementById('taskInput'),
            locationInput: document.getElementById('locationInput'),
            responseArea: document.getElementById('responseArea'),
            resetBtn: document.getElementById('resetBtn'),
            useLLM: document.getElementById('useLLM')
        };
        
        // Validate elements exist
        if (!form.taskInput || !form.form) {
            console.error('Demo: Required form elements not found');
            this.cancel();
            alert('Demo initialization failed. Please refresh the page.');
            return;
        }
        
        // Clear any existing responses
        form.responseArea.style.display = 'none';
        // Hide any errors
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) errorEl.style.display = 'none';
        
        // Clear demo notices
        const existingNotices = form.responseArea.querySelectorAll('[data-demo-notice]');
        existingNotices.forEach(notice => notice.remove());
        
        // Reset form
        form.taskInput.value = '';
        form.locationInput.value = '';
        form.taskInput.focus();
        
        // Typing animation
        const demoText = "Customer says TrackMan is frozen";
        for (let i = 0; i <= demoText.length; i++) {
            form.taskInput.value = demoText.substring(0, i);
            await new Promise(resolve => setTimeout(resolve, window.ClubOS.CONFIG.DEMO_TYPING_SPEED));
        }
        
        // Add location
        await new Promise(resolve => setTimeout(resolve, 200));
        form.locationInput.value = 'Halifax';
        
        // Select TrackMan route
        await new Promise(resolve => setTimeout(resolve, 200));
        const trackmanRadio = document.getElementById('route-trackman');
        if (trackmanRadio) {
            trackmanRadio.checked = true;
            const trackmanLabel = document.querySelector('label[for="route-trackman"]');
            if (trackmanLabel) {
                trackmanLabel.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    trackmanLabel.style.transform = '';
                }, 300);
            }
        }
        
        // Set high priority
        const priorityHigh = document.getElementById('priority-high');
        if (priorityHigh) {
            priorityHigh.checked = true;
        }
        
        // Ensure LLM is enabled
        if (!form.useLLM.checked) {
            form.useLLM.click();
        }
        
        // Visual feedback
        const card = document.querySelector('.card');
        card.style.boxShadow = '0 0 20px rgba(21, 47, 47, 0.4)';
        
        // Log demo payload
        console.log('Demo Payload:', {
            task: "Customer says TrackMan is frozen",
            priority: "high",
            location: "Halifax",
            use_llm: true,
            llm_route: "TrackManLLM"
        });
        
        // Wait then submit
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Submit form
        console.log('Submitting demo form...');
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.click();
        } else {
            form.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
        
        // Backup submit
        setTimeout(() => {
            if (this.isDemo) {
                console.log('Demo submission might have failed, triggering form submit directly');
                form.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
        }, 100);
    },
    
    handleDemoSubmit() {
        console.log('Processing demo request for TrackMan issue...');
        
        // Get form elements directly
        const form = {
            responseArea: document.getElementById('responseArea'),
            resetBtn: document.getElementById('resetBtn')
        };
        
        // Show loading state
        if (window.ClubOS.AppController) {
            window.ClubOS.AppController.setProcessingState(true);
        }
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        document.body.appendChild(progressBar);
        requestAnimationFrame(() => {
            progressBar.style.width = '80%';
        });
        
        // Let loading animation show for a moment
        setTimeout(() => {
            // Simulate response after delay
            setTimeout(() => {
                // Safety check
                if (!this.isDemo) {
                    console.warn('Demo mode was cancelled');
                    if (progressBar) progressBar.remove();
                    return;
                }
            
            // Complete progress
            progressBar.style.width = '100%';
            setTimeout(() => {
                progressBar.style.opacity = '0';
                setTimeout(() => progressBar.remove(), 300);
            }, 200);
            
            // Reset state
            if (window.ClubOS.AppController) {
                window.ClubOS.AppController.setProcessingState(false);
            }
            
            // Reset card shadow
            document.querySelector('.card').style.boxShadow = '';
            
            // Demo response data
            const demoResponse = {
                status: 'completed',
                confidence: 0.94,
                recommendation: [
                    "Tell customer: 'I'll reset the system for you. You'll be able to restart from the My Activities button. This should only take about 2 minutes.'",
                    "Confirm the specific location and bay number with the customer (e.g., Halifax Bay 3)",
                    "Open Splashtop and connect to the specific bay PC (e.g., HAL-BAY3-PC for Halifax Bay 3)",
                    "Press the Windows key to open the Start menu",
                    "Close the TrackMan application by clicking the X on the TrackMan icon in the taskbar",
                    "Relaunch the TrackMan software from the desktop shortcut",
                    "Wait for the software to fully initialize (approximately 30-45 seconds)",
                    "Notify customer: 'The system has been reset and should be good to go. You can now restart your session from My Activities.'",
                    "Offer compensation: Extend their current booking by 30 minutes OR provide a complimentary hour for their next visit",
                    "Check customer history - if this is a recurring issue with this customer, note it in their profile and consider alternative troubleshooting or escalation to technical support"
                ],
                llm_route_used: "TrackManLLM",
                processing_time: "1.4s"
            };
            
            console.log('Demo Response:', demoResponse);
            if (window.ClubOS.ResponseManager) {
                window.ClubOS.ResponseManager.display(demoResponse);
            }
            
            // Add demo notice
            const demoNotice = document.createElement('div');
            demoNotice.setAttribute('data-demo-notice', 'true');
            demoNotice.style.cssText = 'background: var(--accent); color: white; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.75rem; text-align: center; margin-top: 1rem; animation: slideIn 0.3s ease-out;';
            demoNotice.innerHTML = 'This is a demo response showing TrackMan troubleshooting steps. In production, this would be processed by your backend.';
            form.responseArea.appendChild(demoNotice);
            
            // Remove notice after time
            setTimeout(() => {
                if (demoNotice.parentNode) {
                    demoNotice.style.opacity = '0';
                    demoNotice.style.transition = 'opacity 0.5s';
                    setTimeout(() => demoNotice.remove(), 500);
                }
            }, 8000);
            
            // Reset demo state
            this.isDemo = false;
            
            // Re-enable reset button
            form.resetBtn.disabled = false;
            
            // Clear timeout
            if (this.demoTimeout) {
                clearTimeout(this.demoTimeout);
                this.demoTimeout = null;
            }
            
            console.log('Demo completed successfully');
        }, 2000);
        }, 500); // Show loading state for 500ms before response
    },
    
    cancel() {
        this.isDemo = false;
        if (this.demoTimeout) {
            clearTimeout(this.demoTimeout);
            this.demoTimeout = null;
        }
    }
};

// Ensure ClubOS.Demo initializes after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (window.ClubOS && window.ClubOS.Demo && typeof window.ClubOS.Demo.init === 'function') {
      window.ClubOS.Demo.init()
    }
  })
} else {
  if (window.ClubOS && window.ClubOS.Demo && typeof window.ClubOS.Demo.init === 'function') {
    window.ClubOS.Demo.init()
  }
}
