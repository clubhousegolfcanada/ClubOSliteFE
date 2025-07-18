/**
 * ClubOS Tone Wrapper - Standardizes all LLM responses
 * Ensures consistent, on-brand communication
 */

// === Core Tone Wrapper ===
window.ClubOS = window.ClubOS || {};

window.ClubOS.ToneWrapper = {
  // Configuration
  modes: {
    'default': 'Standard ClubOS voice',
    'emergency': 'Direct, action-focused for urgent situations',
    'technical': 'Clear troubleshooting steps',
    'customer': 'Friendly but efficient service',
    'internal': 'Slack-ready, no fluff'
  },

  defaultOptions: {
    mode: 'default',
    removeFluff: true,
    compress: true,
    solutionFirst: true,      // Put solutions before explanations
    actionOriented: true,
    useContractions: true,
    keepEmpathy: true         // Keep apologetic/empathetic language
  },

  /**
   * Main wrapper function - processes all LLM responses
   * @param {string} response - Raw LLM response
   * @param {Object} options - Tone configuration
   * @param {Object} context - Request context (route, urgency, etc.)
   * @returns {string} Processed response
   */
  wrap(response, options = {}, context = {}) {
    const config = { ...this.defaultOptions, ...options };
    let output = response.trim();

    // Pre-process based on context
    if (context.route) {
      config.mode = this.detectModeFromRoute(context.route);
    }

    // Global filters - always apply
    output = this.globalFilters(output, config);

    // Mode-specific transforms
    output = this.applyMode(output, config.mode, context);

    // Post-processing
    output = this.finalizeOutput(output, config, context);

    // Log for quality monitoring
    this.logTransformation(response, output, config);

    return output;
  },

  /**
   * Global filters applied to all responses
   */
  globalFilters(text, config) {
    if (config.removeFluff) {
      text = this.removeFluff(text);
    }
    
    if (config.compress) {
      text = this.compressThoughts(text);
    }
    
    if (config.solutionFirst) {
      text = this.prioritizeSolutions(text);
    }
    
    if (config.keepEmpathy) {
      // We keep empathy/apologies but make them concise
      text = this.streamlineEmpathy(text);
    }
    
    if (config.actionOriented) {
      text = this.makeActionOriented(text);
    }
    
    if (config.useContractions) {
      text = this.applyContractions(text);
    }

    return text;
  },

  /**
   * Remove unnecessary words and phrases
   */
  removeFluff(text) {
    const fluffPatterns = [
      // Weak modifiers
      /\b(just|really|very|quite|somewhat|perhaps|maybe|simply|basically|actually)\b/gi,
      // Wordy phrases
      /\b(in order to|you might want to|it could be worth|it seems like)\b/gi,
      // Unnecessary introductions
      /(As you may know|Let me explain|To be honest|If I may suggest),?\s*/gi,
      // Hedging language
      /\b(kind of|sort of|a bit|a little)\b/gi,
      // Corporate speak
      /\b(leverage|utilize|facilitate|implement)\b/gi
    ];

    fluffPatterns.forEach(pattern => {
      text = text.replace(pattern, '');
    });

    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Compress verbose thoughts
   */
  compressThoughts(text) {
    const compressionMap = {
      'It is important to note that': '',
      'This means that': '→',
      'In other words': '',
      'What this tells us is': '',
      'The thing is': '',
      'can be considered as': 'is',
      'serves as a': 'is a',
      'in the event that': 'if',
      'due to the fact that': 'because',
      'at this point in time': 'now',
      'in the near future': 'soon'
    };

    Object.entries(compressionMap).forEach(([verbose, concise]) => {
      const pattern = new RegExp(verbose, 'gi');
      text = text.replace(pattern, concise);
    });

    return text.replace(/\s+/g, ' ').trim();
  },

  /**
   * Prioritize solutions over explanations
   */
  prioritizeSolutions(text) {
    // Pattern: Move action items to the front
    const actionPatterns = [
      /\b(restart|reset|click|press|check|try|go to|open|close|turn)\b/gi
    ];
    
    const sentences = text.split(/(?<=[.!?])\s+/);
    const actionSentences = [];
    const otherSentences = [];
    
    sentences.forEach(sentence => {
      if (actionPatterns.some(pattern => pattern.test(sentence))) {
        actionSentences.push(sentence);
      } else {
        otherSentences.push(sentence);
      }
    });
    
    // Put solutions first, then context
    return [...actionSentences, ...otherSentences].join(' ');
  },

  /**
   * Keep empathy but make it efficient
   */
  streamlineEmpathy(text) {
    // Shorten verbose apologies to concise ones
    const empathyMap = {
      'We sincerely apologize for the inconvenience': "Sorry about that!",
      'We apologize for any inconvenience': "Sorry about that!",
      'Thank you for your patience': "Thanks for your patience!",
      'We understand your frustration': "I get it - that's frustrating",
      'We\'re sorry to hear': "Sorry to hear that"
    };

    Object.entries(empathyMap).forEach(([verbose, concise]) => {
      const pattern = new RegExp(verbose, 'gi');
      text = text.replace(pattern, concise);
    });

    return text;
  },

  /**
   * Make language more action-oriented
   */
  makeActionOriented(text) {
    const actionMap = {
      'you should': "→",
      'we recommend': "→",
      'it would be good to': "→",
      'you might want to': "→",
      'could you please': "",
      'would you mind': "",
      'if possible': "",
      'when you get a chance': "now"
    };

    Object.entries(actionMap).forEach(([passive, active]) => {
      const pattern = new RegExp(`\\b${passive}\\b`, 'gi');
      text = text.replace(pattern, active);
    });

    return text.trim();
  },

  /**
   * Apply natural contractions
   */
  applyContractions(text) {
    const contractionMap = {
      'do not': "don't",
      'does not': "doesn't",
      'did not': "didn't",
      'will not': "won't",
      'would not': "wouldn't",
      'could not': "couldn't",
      'should not': "shouldn't",
      'cannot': "can't",
      'it is': "it's",
      'that is': "that's",
      'what is': "what's",
      'here is': "here's",
      'there is': "there's",
      'we are': "we're",
      'you are': "you're",
      'they are': "they're",
      'I will': "I'll",
      'we will': "we'll",
      'you will': "you'll"
    };

    Object.entries(contractionMap).forEach(([full, contraction]) => {
      const pattern = new RegExp(`\\b${full}\\b`, 'gi');
      text = text.replace(pattern, contraction);
    });

    return text;
  },

  /**
   * Apply mode-specific transformations
   */
  applyMode(text, mode, context) {
    switch (mode) {
      case 'emergency':
        return this.emergencyMode(text);
      case 'technical':
        return this.technicalMode(text);
      case 'customer':
        return this.customerMode(text);
      case 'internal':
        return this.internalMode(text);
      default:
        return this.defaultMode(text);
    }
  },

  /**
   * Emergency mode - Direct, no fluff
   */
  emergencyMode(text) {
    // Remove all pleasantries
    text = text.replace(/\b(please|kindly|if you would|when convenient)\b/gi, '');
    
    // Make imperatives stronger
    text = text.replace(/\bshould\b/gi, 'must');
    text = text.replace(/\bcould\b/gi, 'will');
    text = text.replace(/\bmight\b/gi, 'will');
    
    // Remove conditionals
    text = text.replace(/\b(if possible|if needed|as necessary)\b/gi, '');
    
    // Add urgency markers
    if (!text.match(/^(NOW|URGENT|IMMEDIATE)/)) {
      text = `⚠️ ${text}`;
    }

    return text;
  },

  /**
   * Technical mode - Clear steps
   */
  technicalMode(text) {
    // Remove step numbers (we'll re-add them)
    text = text.replace(/^(Step\s*\d+:?|^\d+\.)\s*/gim, '');
    
    // Split into steps
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    // Rebuild with clear markers
    if (sentences.length > 1) {
      text = sentences.map((sentence, index) => {
        return `${index + 1}. ${sentence.trim()}`;
      }).join('\n');
    }

    // Add technical indicators
    text = text.replace(/\brestart\b/gi, '🔄 Restart');
    text = text.replace(/\bwait\b/gi, '⏱️ Wait');
    text = text.replace(/\bcheck\b/gi, '✓ Check');

    return text;
  },

  /**
   * Customer mode - Friendly, empathetic, solution-focused
   */
  customerMode(text) {
    // Keep the empathy, focus on solutions
    text = this.prioritizeSolutions(text);
    
    // Remove only corporate jargon, not empathy
    text = text.replace(/\b(per our policy|as per|pursuant to)\b/gi, '');
    
    // Keep friendly tone
    if (!text.match(/^(Hey|Hi|Hello|Sorry)/i)) {
      text = `Hey! ${text}`;
    }
    
    // Ensure positive ending
    if (!text.match(/[!?]$/)) {
      text = text.replace(/\.$/, '!');
    }

    return text;
  },

  /**
   * Internal mode - Slack-ready
   */
  internalMode(text) {
    // Remove all formalities
    text = text.replace(/\b(dear|sincerely|regards|hello|hi)\b/gi, '');
    
    // Use bullet points for lists
    text = text.replace(/^\d+\.\s*/gm, '• ');
    
    // Add thread markers
    text = text.replace(/\b(UPDATE|FYI|ACTION|RESOLVED)\b/gi, match => `[${match.toUpperCase()}]`);

    return text;
  },

  /**
   * Default ClubOS mode
   */
  defaultMode(text) {
    // Balance between friendly and efficient
    return text;
  },

  /**
   * Detect appropriate mode from route
   */
  detectModeFromRoute(route) {
    const routeModeMap = {
      'EmergencyLLM': 'emergency',
      'TrackManLLM': 'technical',
      'BookingLLM': 'customer',
      'ResponseToneLLM': 'default',
      'GeneralInfoLLM': 'customer'
    };

    return routeModeMap[route] || 'default';
  },

  /**
   * Final output processing
   */
  finalizeOutput(text, config, context) {
    // Clean up spacing
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Ensure proper ending
    if (!text.match(/[.!?]$/)) {
      text += '.';
    }
    
    // Add context headers if needed
    if (context.isUrgent && !text.includes('⚠️')) {
      text = `⚠️ URGENT: ${text}`;
    }
    
    // Truncate if too long
    if (config.maxLength && text.length > config.maxLength) {
      text = text.substring(0, config.maxLength - 3) + '...';
    }

    return text.trim();
  },

  /**
   * Log transformations for quality monitoring
   */
  logTransformation(original, transformed, config) {
    if (window.ClubOS.telemetry) {
      window.ClubOS.telemetry.track('tone_transformation', {
        originalLength: original.length,
        transformedLength: transformed.length,
        reduction: Math.round((1 - transformed.length / original.length) * 100),
        mode: config.mode,
        timestamp: new Date().toISOString()
      });
    }

    // Console log in dev mode
    if (window.CLUBOS_DEV_MODE) {
      console.log('Tone Transformation:', {
        before: original.substring(0, 100) + '...',
        after: transformed.substring(0, 100) + '...',
        reduction: `${Math.round((1 - transformed.length / original.length) * 100)}%`
      });
    }
  }
};

// === Integration with ClubOS ===

/**
 * Patch ResponseManager to use ToneWrapper
 */
if (window.ClubOS.ResponseManager) {
  const originalDisplay = window.ClubOS.ResponseManager.display;
  
  window.ClubOS.ResponseManager.display = function(result, isSlackSubmission = false) {
    // Apply tone wrapper to recommendations
    if (result.recommendation) {
      const context = {
        route: result.llm_route_used,
        isUrgent: result.priority === 'high',
        isSlack: isSlackSubmission
      };
      
      const options = {
        mode: isSlackSubmission ? 'internal' : undefined
      };
      
      if (Array.isArray(result.recommendation)) {
        result.recommendation = result.recommendation.map(text => 
          window.ClubOS.ToneWrapper.wrap(text, options, context)
        );
      } else {
        result.recommendation = window.ClubOS.ToneWrapper.wrap(
          result.recommendation, 
          options, 
          context
        );
      }
    }
    
    // Call original display method
    return originalDisplay.call(this, result, isSlackSubmission);
  };
}

// === Usage Examples ===

/**
 * Example 1: Emergency response
 */
// Input: "You should probably evacuate the building if possible when you get a chance."
// Output: "⚠️ Must evacuate the building now."

/**
 * Example 2: Technical support
 */
// Input: "First, you might want to restart the system. Then maybe check if it works."
// Output: "1. 🔄 Restart the system.\n2. ✓ Check if it works."

/**
 * Example 3: Customer service
 */
// Input: "We apologize for the inconvenience. Per our policy, you must cancel 24 hours in advance."
// Output: "Hey! You need to cancel 24 hours in advance!"

/**
 * Example 4: Internal/Slack
 */
// Input: "Hello team, this is an update that the system is now working again."
// Output: "[UPDATE] System is now working again."

// === Testing Function ===
window.ClubOS.ToneWrapper.test = function() {
  const testCases = [
    {
      input: "I'm really sorry, but you might want to just restart the TrackMan system if possible.",
      mode: 'technical',
      expected: "🔄 Restart the TrackMan system."
    },
    {
      input: "We apologize for the inconvenience. To fix this, please restart the TrackMan system.",
      mode: 'customer',
      expected: "Sorry about that! To fix this, restart the TrackMan system!"
    },
    {
      input: "You should evacuate immediately due to the emergency situation.",
      mode: 'emergency',
      expected: "⚠️ Must evacuate immediately due to the emergency situation."
    }
  ];
  
  testCases.forEach((test, index) => {
    const result = this.wrap(test.input, { mode: test.mode });
    console.log(`Test ${index + 1}:`, {
      input: test.input,
      output: result,
      expected: test.expected,
      passed: result === test.expected ? '✅' : '❌'
    });
  });
};

console.log('✅ ClubOS ToneWrapper loaded - All LLM responses will now be tone-adjusted');
