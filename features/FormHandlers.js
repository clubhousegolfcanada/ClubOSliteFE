/**
 * ClubOS Feature Form Handlers
 * Connects each category form to the main app controller
 */

window.ClubOS = window.ClubOS || {};
window.ClubOS.Forms = window.ClubOS.Forms || {};

// Base Form Handler Class
class BaseFormHandler {
    constructor(formId, category) {
        this.formId = formId;
        this.category = category;
        this.form = null;
        this.validator = null;
        this.init();
    }
    
    init() {
        // This will be called when the form is actually rendered
        console.log(`Form handler ready for ${this.category}`);
    }
    
    mount(container) {
        this.render(container);
        this.bindEvents();
        this.setupValidation();
    }
    
    render(container) {
        // To be implemented by subclasses
    }
    
    bindEvents() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Add field-specific listeners
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('change', () => this.handleFieldChange(field));
        });
    }
    
    setupValidation() {
        // Setup form validation rules
        this.validator = new window.ClubOS.UI.FormValidator(this.form, this.getValidationRules());
    }
    
    getValidationRules() {
        // To be overridden by subclasses
        return {};
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate
        if (!this.validator.validateAll()) {
            window.ClubOS.UI.Notification.error('Please fix the errors before submitting');
            return;
        }
        
        // Gather data
        const formData = this.gatherFormData();
        
        // Build payload
        const payload = this.buildPayload(formData);
        
        // Send to app controller
        if (window.ClubOS.AppController) {
            await window.ClubOS.AppController.processLLMRequest(payload);
        }
    }
    
    handleFieldChange(field) {
        // Can be overridden for custom field handling
    }
    
    gatherFormData() {
        const data = {};
        const formData = new FormData(this.form);
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }
    
    buildPayload(formData) {
        // To be implemented by subclasses
        return {
            ...formData,
            category: this.category,
            timestamp: new Date().toISOString()
        };
    }
    
    reset() {
        if (this.form) {
            this.form.reset();
            this.validator.clearAllErrors();
        }
    }
}

// Booking Form Handler
window.ClubOS.Forms.BookingForm = class BookingForm extends BaseFormHandler {
    constructor() {
        super('bookingForm', 'booking');
    }
    
    render(container) {
        const html = `
            <form id="${this.formId}" class="clubos-feature-form">
                <h3 class="form-title">Booking Issue Report</h3>
                
                <div class="form-group">
                    <label class="form-label" for="booking-customer-name">Customer Name</label>
                    <input 
                        id="booking-customer-name" 
                        name="customerName" 
                        type="text" 
                        class="form-input" 
                        placeholder="John Doe"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="booking-reference">Booking Reference</label>
                    <input 
                        id="booking-reference" 
                        name="bookingReference" 
                        type="text" 
                        class="form-input" 
                        placeholder="BK123456"
                    >
                    <div class="form-helper">Optional - if customer has their booking code</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="booking-issue-type">Issue Type</label>
                    <select id="booking-issue-type" name="issueType" class="form-select" required>
                        <option value="">Select issue type...</option>
                        <option value="no_access">No Access Code</option>
                        <option value="wrong_time">Wrong Time Slot</option>
                        <option value="duplicate">Duplicate Booking</option>
                        <option value="cancellation">Cancellation Request</option>
                        <option value="modification">Modification Request</option>
                        <option value="other">Other Issue</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="booking-bay">Bay Number</label>
                    <input 
                        id="booking-bay" 
                        name="bayNumber" 
                        type="number" 
                        class="form-input" 
                        placeholder="1-10"
                        min="1"
                        max="10"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="booking-details">Issue Details</label>
                    <textarea 
                        id="booking-details" 
                        name="issueDetails" 
                        class="form-textarea" 
                        placeholder="Describe the booking issue in detail..."
                        rows="4"
                        required
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Contact Method</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="contactMethod" value="phone" checked>
                            <span>Phone</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="contactMethod" value="email">
                            <span>Email</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="contactMethod" value="in-person">
                            <span>In Person</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        Process Booking Issue
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">
                        Clear
                    </button>
                </div>
            </form>
        `;
        
        container.innerHTML = html;
        this.form = container.querySelector(`#${this.formId}`);
    }
    
    getValidationRules() {
        return {
            customerName: {
                required: true,
                minLength: 2,
                requiredMessage: 'Customer name is required',
                minLengthMessage: 'Name must be at least 2 characters'
            },
            issueType: {
                required: true,
                requiredMessage: 'Please select an issue type'
            },
            issueDetails: {
                required: true,
                minLength: 10,
                maxLength: 500,
                requiredMessage: 'Please describe the issue',
                minLengthMessage: 'Please provide more detail (minimum 10 characters)',
                maxLengthMessage: 'Description too long (maximum 500 characters)'
            },
            bayNumber: {
                custom: (value) => {
                    if (!value) return true; // Optional field
                    const num = parseInt(value);
                    return num >= 1 && num <= 10;
                },
                customMessage: 'Bay number must be between 1 and 10'
            }
        };
    }
    
    buildPayload(formData) {
        return {
            bookingId: `BKG-${Date.now()}`,
            userId: 'web-user',
            userName: formData.customerName,
            bookingReference: formData.bookingReference || null,
            bayNumber: formData.bayNumber ? parseInt(formData.bayNumber) : null,
            issueType: formData.issueType,
            issueDetails: formData.issueDetails,
            contactMethod: formData.contactMethod,
            status: 'pending',
            source: 'web',
            conversationHistory: [],
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString()
        };
    }
};

// Emergency Form Handler
window.ClubOS.Forms.EmergencyForm = class EmergencyForm extends BaseFormHandler {
    constructor() {
        super('emergencyForm', 'emergency');
    }
    
    render(container) {
        const html = `
            <form id="${this.formId}" class="clubos-feature-form">
                <h3 class="form-title emergency-title">⚠️ Emergency Report</h3>
                
                <div class="alert alert-warning">
                    <strong>For immediate safety concerns, call 911</strong>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="emergency-type">Emergency Type</label>
                    <select id="emergency-type" name="emergencyType" class="form-select" required>
                        <option value="">Select emergency type...</option>
                        <option value="power_outage">Power Outage</option>
                        <option value="equipment_failure">Equipment Failure</option>
                        <option value="system_down">System Down</option>
                        <option value="safety_hazard">Safety Hazard</option>
                        <option value="water_damage">Water Damage</option>
                        <option value="hvac_failure">HVAC Failure</option>
                        <option value="security_issue">Security Issue</option>
                        <option value="other_critical">Other Critical Issue</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="emergency-location">Location</label>
                    <input 
                        id="emergency-location" 
                        name="location" 
                        type="text" 
                        class="form-input" 
                        placeholder="e.g., Halifax Bay 3, Bedford Lobby"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="emergency-affected-bays">Affected Bays</label>
                    <input 
                        id="emergency-affected-bays" 
                        name="affectedBays" 
                        type="text" 
                        class="form-input" 
                        placeholder="e.g., 1-3, 5, 7-10 or 'All'"
                    >
                    <div class="form-helper">Specify which bays are affected</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="emergency-description">Situation Description</label>
                    <textarea 
                        id="emergency-description" 
                        name="description" 
                        class="form-textarea emergency-textarea" 
                        placeholder="Describe the emergency situation and any immediate actions taken..."
                        rows="5"
                        required
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Severity Level</label>
                    <div class="radio-group severity-group">
                        <label class="radio-option severity-high">
                            <input type="radio" name="severity" value="high" checked>
                            <span>High - Immediate action needed</span>
                        </label>
                        <label class="radio-option severity-critical">
                            <input type="radio" name="severity" value="critical">
                            <span>Critical - Safety risk / Total system failure</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-option">
                        <input type="checkbox" name="customersPresent" value="true">
                        <span>Customers currently affected</span>
                    </label>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary btn-emergency">
                        Submit Emergency Report
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">
                        Clear
                    </button>
                </div>
            </form>
        `;
        
        container.innerHTML = html;
        this.form = container.querySelector(`#${this.formId}`);
        
        // Add emergency-specific styling
        this.form.classList.add('emergency-form');
    }
    
    getValidationRules() {
        return {
            emergencyType: {
                required: true,
                requiredMessage: 'Emergency type is required'
            },
            location: {
                required: true,
                minLength: 3,
                requiredMessage: 'Location is required',
                minLengthMessage: 'Please provide a specific location'
            },
            description: {
                required: true,
                minLength: 20,
                maxLength: 1000,
                requiredMessage: 'Please describe the emergency',
                minLengthMessage: 'Please provide more detail about the situation (minimum 20 characters)',
                maxLengthMessage: 'Description too long (maximum 1000 characters)'
            }
        };
    }
    
    buildPayload(formData) {
        return {
            emergencyId: `EMG-${Date.now()}`,
            emergencyType: formData.emergencyType,
            location: formData.location,
            affectedBays: this.parseBayNumbers(formData.affectedBays),
            issueDescription: formData.description,
            priority: formData.severity,
            customersPresent: formData.customersPresent === 'true',
            status: 'open',
            source: 'web',
            conversationHistory: [`Emergency reported via web form at ${new Date().toLocaleString()}`],
            reportedAt: new Date().toISOString(),
            resolvedAt: null,
            lastUpdated: new Date().toISOString()
        };
    }
    
    parseBayNumbers(input) {
        if (!input) return [];
        if (input.toLowerCase() === 'all') return 'all';
        
        const bays = [];
        const parts = input.split(',');
        
        parts.forEach(part => {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
                for (let i = start; i <= end; i++) {
                    if (i >= 1 && i <= 10) bays.push(i);
                }
            } else {
                const num = parseInt(trimmed);
                if (num >= 1 && num <= 10) bays.push(num);
            }
        });
        
        return [...new Set(bays)].sort((a, b) => a - b);
    }
};

// Tech Support Form Handler
window.ClubOS.Forms.TechForm = class TechForm extends BaseFormHandler {
    constructor() {
        super('techForm', 'tech');
    }
    
    render(container) {
        const html = `
            <form id="${this.formId}" class="clubos-feature-form">
                <h3 class="form-title">Technical Support Request</h3>
                
                <div class="form-group">
                    <label class="form-label" for="tech-equipment">Equipment/System</label>
                    <select id="tech-equipment" name="equipment" class="form-select" required>
                        <option value="">Select equipment...</option>
                        <option value="trackman">TrackMan</option>
                        <option value="simulator">Simulator Screen</option>
                        <option value="computer">Computer/PC</option>
                        <option value="projector">Projector</option>
                        <option value="sound">Sound System</option>
                        <option value="network">Network/WiFi</option>
                        <option value="app">Mobile App</option>
                        <option value="other">Other Equipment</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tech-bay">Bay Number</label>
                    <input 
                        id="tech-bay" 
                        name="bayNumber" 
                        type="number" 
                        class="form-input" 
                        placeholder="1-10"
                        min="1"
                        max="10"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tech-issue">Issue Type</label>
                    <select id="tech-issue" name="issueType" class="form-select" required>
                        <option value="">Select issue...</option>
                        <option value="not_working">Not Working/No Power</option>
                        <option value="frozen">Frozen/Unresponsive</option>
                        <option value="error_message">Error Message</option>
                        <option value="performance">Slow Performance</option>
                        <option value="calibration">Calibration Issue</option>
                        <option value="display">Display Problem</option>
                        <option value="connectivity">Connection Issue</option>
                        <option value="other">Other Issue</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tech-description">Problem Description</label>
                    <textarea 
                        id="tech-description" 
                        name="description" 
                        class="form-textarea" 
                        placeholder="Describe what's happening, any error messages, and what you've tried..."
                        rows="4"
                        required
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Troubleshooting Attempted</label>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" name="tried_restart" value="true">
                            <span>Restarted equipment</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="tried_power_cycle" value="true">
                            <span>Power cycled (unplugged/replugged)</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="tried_different_bay" value="true">
                            <span>Tested in different bay</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="tried_nothing" value="true">
                            <span>No troubleshooting attempted</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Customer Impact</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="customerImpact" value="none" checked>
                            <span>No customer present</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="customerImpact" value="waiting">
                            <span>Customer waiting</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="customerImpact" value="relocated">
                            <span>Customer relocated</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        Submit Tech Request
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">
                        Clear
                    </button>
                </div>
            </form>
        `;
        
        container.innerHTML = html;
        this.form = container.querySelector(`#${this.formId}`);
    }
    
    getValidationRules() {
        return {
            equipment: {
                required: true,
                requiredMessage: 'Please select the affected equipment'
            },
            bayNumber: {
                required: true,
                custom: (value) => {
                    const num = parseInt(value);
                    return num >= 1 && num <= 10;
                },
                requiredMessage: 'Bay number is required',
                customMessage: 'Bay number must be between 1 and 10'
            },
            issueType: {
                required: true,
                requiredMessage: 'Please select the issue type'
            },
            description: {
                required: true,
                minLength: 15,
                maxLength: 1000,
                requiredMessage: 'Please describe the technical issue',
                minLengthMessage: 'Please provide more detail (minimum 15 characters)',
                maxLengthMessage: 'Description too long (maximum 1000 characters)'
            }
        };
    }
    
    buildPayload(formData) {
        const troubleshooting = [];
        if (formData.tried_restart === 'true') troubleshooting.push('restart');
        if (formData.tried_power_cycle === 'true') troubleshooting.push('power_cycle');
        if (formData.tried_different_bay === 'true') troubleshooting.push('different_bay');
        if (formData.tried_nothing === 'true') troubleshooting.push('none');
        
        return {
            techIssueId: `TCH-${Date.now()}`,
            equipment: formData.equipment,
            bayNumber: parseInt(formData.bayNumber),
            issueType: formData.issueType,
            issueDescription: formData.description,
            troubleshootingAttempted: troubleshooting,
            customerImpact: formData.customerImpact,
            priority: formData.customerImpact === 'waiting' ? 'high' : 'medium',
            status: 'open',
            source: 'web',
            conversationHistory: [],
            reportedAt: new Date().toISOString(),
            resolvedAt: null,
            lastUpdated: new Date().toISOString()
        };
    }
};

// Tone/Response Form Handler
window.ClubOS.Forms.ToneForm = class ToneForm extends BaseFormHandler {
    constructor() {
        super('toneForm', 'tone');
    }
    
    render(container) {
        const html = `
            <form id="${this.formId}" class="clubos-feature-form">
                <h3 class="form-title">Response Tone Customizer</h3>
                
                <div class="form-group">
                    <label class="form-label" for="tone-scenario">Scenario</label>
                    <input 
                        id="tone-scenario" 
                        name="scenario" 
                        type="text" 
                        class="form-input" 
                        placeholder="e.g., Angry customer, VIP guest, Technical explanation"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tone-style">Response Style</label>
                    <select id="tone-style" name="toneStyle" class="form-select" required>
                        <option value="">Select tone style...</option>
                        <option value="professional">Professional & Courteous</option>
                        <option value="friendly">Friendly & Casual</option>
                        <option value="empathetic">Empathetic & Understanding</option>
                        <option value="technical">Technical & Detailed</option>
                        <option value="concise">Brief & Direct</option>
                        <option value="apologetic">Apologetic & Reassuring</option>
                        <option value="authoritative">Firm & Authoritative</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tone-message">Message to Rephrase</label>
                    <textarea 
                        id="tone-message" 
                        name="message" 
                        class="form-textarea" 
                        placeholder="Enter the message you want to rephrase with the selected tone..."
                        rows="5"
                        required
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Additional Preferences</label>
                    <div class="checkbox-group">
                        <label class="checkbox-option">
                            <input type="checkbox" name="include_greeting" value="true" checked>
                            <span>Include greeting</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="include_closing" value="true" checked>
                            <span>Include closing</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="offer_help" value="true">
                            <span>Offer additional help</span>
                        </label>
                        <label class="checkbox-option">
                            <input type="checkbox" name="include_empathy" value="true">
                            <span>Express empathy</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="tone-context">Context (Optional)</label>
                    <textarea 
                        id="tone-context" 
                        name="context" 
                        class="form-textarea" 
                        placeholder="Any additional context about the situation..."
                        rows="3"
                    ></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        Generate Response
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">
                        Clear
                    </button>
                </div>
            </form>
        `;
        
        container.innerHTML = html;
        this.form = container.querySelector(`#${this.formId}`);
    }
    
    getValidationRules() {
        return {
            scenario: {
                required: true,
                minLength: 3,
                requiredMessage: 'Please describe the scenario',
                minLengthMessage: 'Scenario description too short'
            },
            toneStyle: {
                required: true,
                requiredMessage: 'Please select a tone style'
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 2000,
                requiredMessage: 'Please enter the message to rephrase',
                minLengthMessage: 'Message too short (minimum 10 characters)',
                maxLengthMessage: 'Message too long (maximum 2000 characters)'
            }
        };
    }
    
    buildPayload(formData) {
        return {
            toneId: `TON-${Date.now()}`,
            scenario: formData.scenario,
            toneStyle: formData.toneStyle,
            originalMessage: formData.message,
            context: formData.context || null,
            preferences: {
                includeGreeting: formData.include_greeting === 'true',
                includeClosing: formData.include_closing === 'true',
                offerHelp: formData.offer_help === 'true',
                includeEmpathy: formData.include_empathy === 'true'
            },
            source: 'web',
            timestamp: new Date().toISOString()
        };
    }
};

// General/Info Form Handler
window.ClubOS.Forms.GeneralForm = class GeneralForm extends BaseFormHandler {
    constructor() {
        super('generalForm', 'general');
    }
    
    render(container) {
        const html = `
            <form id="${this.formId}" class="clubos-feature-form">
                <h3 class="form-title">General Inquiry</h3>
                
                <div class="form-group">
                    <label class="form-label" for="general-category">Category</label>
                    <select id="general-category" name="category" class="form-select" required>
                        <option value="">Select category...</option>
                        <option value="hours">Hours & Availability</option>
                        <option value="pricing">Pricing & Packages</option>
                        <option value="membership">Membership Info</option>
                        <option value="events">Events & Tournaments</option>
                        <option value="lessons">Lessons & Coaching</option>
                        <option value="facilities">Facilities & Amenities</option>
                        <option value="policies">Policies & Rules</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="lost_found">Lost & Found</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="general-subject">Subject</label>
                    <input 
                        id="general-subject" 
                        name="subject" 
                        type="text" 
                        class="form-input" 
                        placeholder="Brief subject of your inquiry"
                        required
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="general-message">Message</label>
                    <textarea 
                        id="general-message" 
                        name="message" 
                        class="form-textarea" 
                        placeholder="How can we help you today?"
                        rows="6"
                        required
                    ></textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="general-name">Your Name (Optional)</label>
                    <input 
                        id="general-name" 
                        name="customerName" 
                        type="text" 
                        class="form-input" 
                        placeholder="John Doe"
                    >
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="general-email">Email (Optional)</label>
                    <input 
                        id="general-email" 
                        name="email" 
                        type="email" 
                        class="form-input" 
                        placeholder="john@example.com"
                    >
                    <div class="form-helper">Provide email if you'd like a follow-up response</div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Response Preference</label>
                    <div class="radio-group">
                        <label class="radio-option">
                            <input type="radio" name="responsePreference" value="immediate" checked>
                            <span>Immediate AI response</span>
                        </label>
                        <label class="radio-option">
                            <input type="radio" name="responsePreference" value="human">
                            <span>Human follow-up preferred</span>
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        Submit Inquiry
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="this.closest('form').reset()">
                        Clear
                    </button>
                </div>
            </form>
        `;
        
        container.innerHTML = html;
        this.form = container.querySelector(`#${this.formId}`);
    }
    
    getValidationRules() {
        return {
            category: {
                required: true,
                requiredMessage: 'Please select a category'
            },
            subject: {
                required: true,
                minLength: 3,
                maxLength: 100,
                requiredMessage: 'Subject is required',
                minLengthMessage: 'Subject too short',
                maxLengthMessage: 'Subject too long (max 100 characters)'
            },
            message: {
                required: true,
                minLength: 10,
                maxLength: 2000,
                requiredMessage: 'Please enter your message',
                minLengthMessage: 'Message too short (minimum 10 characters)',
                maxLengthMessage: 'Message too long (maximum 2000 characters)'
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                patternMessage: 'Please enter a valid email address'
            }
        };
    }
    
    buildPayload(formData) {
        return {
            generalId: `GEN-${Date.now()}`,
            category: formData.category,
            subject: formData.subject,
            message: formData.message,
            customerName: formData.customerName || 'Anonymous',
            email: formData.email || null,
            responsePreference: formData.responsePreference,
            handled: false,
            source: 'web',
            conversationHistory: [],
            submittedAt: new Date().toISOString(),
            handledAt: null,
            lastUpdated: new Date().toISOString()
        };
    }
};

// Form Manager to coordinate all forms
window.ClubOS.FormManager = {
    forms: {},
    activeForm: null,
    
    init() {
        // Initialize all form handlers
        this.forms.booking = new window.ClubOS.Forms.BookingForm();
        this.forms.emergency = new window.ClubOS.Forms.EmergencyForm();
        this.forms.tech = new window.ClubOS.Forms.TechForm();
        this.forms.tone = new window.ClubOS.Forms.ToneForm();
        this.forms.general = new window.ClubOS.Forms.GeneralForm();
        
        console.log('Form Manager initialized with all handlers');
    },
    
    showForm(formType, container) {
        // Hide current form if any
        if (this.activeForm) {
            this.activeForm.reset();
        }
        
        // Show requested form
        const form = this.forms[formType];
        if (form) {
            form.mount(container);
            this.activeForm = form;
            
            // Animate in
            requestAnimationFrame(() => {
                container.style.opacity = '0';
                container.style.transform = 'translateY(10px)';
                requestAnimationFrame(() => {
                    container.style.transition = 'all 0.3s ease';
                    container.style.opacity = '1';
                    container.style.transform = 'translateY(0)';
                });
            });
        }
    },
    
    hideAllForms() {
        if (this.activeForm) {
            this.activeForm.reset();
            this.activeForm = null;
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.ClubOS.FormManager.init();
});

// Add form-specific styles
const formStyles = `
/* Feature Form Styles */
.clubos-feature-form {
    max-width: 600px;
    margin: 0 auto;
}

.form-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
}

.emergency-title {
    color: var(--status-error);
}

.radio-group, .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.radio-option, .checkbox-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: background 0.2s;
}

.radio-option:hover, .checkbox-option:hover {
    background: var(--bg-tertiary);
}

.radio-option input[type="radio"],
.checkbox-option input[type="checkbox"] {
    margin: 0;
}

.form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 2rem;
}

.form-actions .btn-primary {
    flex: 1;
}

.form-actions .btn-secondary {
    flex: 0.3;
    min-width: 100px;
}

/* Emergency Form Specific */
.emergency-form {
    border: 2px solid var(--status-error);
    border-radius: 12px;
    padding: 2rem;
    background: rgba(239, 68, 68, 0.05);
}

.emergency-textarea {
    min-height: 120px;
}

.severity-group .severity-critical {
    color: var(--status-error);
    font-weight: 600;
}

.btn-emergency {
    background: var(--status-error);
}

.btn-emergency:hover {
    background: #dc2626;
}

/* Alert Styles */
.alert {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.alert-warning {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid var(--status-warning);
    color: var(--status-warning);
}

.alert strong {
    font-weight: 600;
}

/* Responsive */
@media (max-width: 640px) {
    .radio-group, .checkbox-group {
        gap: 0.5rem;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .form-actions .btn-secondary {
        width: 100%;
    }
}
`;

// Inject form styles
if (!document.querySelector('#clubos-form-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'clubos-form-styles';
    styleEl.textContent = formStyles;
    document.head.appendChild(styleEl);
}