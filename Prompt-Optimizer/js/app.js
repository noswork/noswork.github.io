// Translations
let translations = {};
let currentLang = 'en';
let originalPromptBackup = '';
let optimizedPromptData = null;
let historyData = [];
let currentOptimizerType = 'claude'; // 'claude' or 'gpt5'
let currentApiFormat = 'openai'; // 'openai' or 'anthropic'

// Templates
const templates = {
    technical: `You are a technical writing assistant. Please help me create clear, accurate, and well-structured technical documentation.

Requirements:
- Use precise technical terminology
- Include code examples where appropriate
- Follow industry best practices
- Maintain consistent formatting`,
    creative: `You are a creative content writer. Please help me generate engaging and original content.

Requirements:
- Be creative and imaginative
- Use vivid descriptions
- Maintain consistent tone
- Focus on audience engagement`,
    data: `You are a data analysis assistant. Please help me analyze and interpret data effectively.

Requirements:
- Use statistical methods appropriately
- Provide clear visualizations
- Explain findings in plain language
- Include actionable insights`,
    coding: `You are a coding assistant. Please help me write clean, efficient, and well-documented code.

Requirements:
- Follow coding best practices
- Include clear comments
- Handle edge cases
- Optimize for performance`
};

// Load translations from JSON
async function loadTranslation(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load translation: ${lang}`);
        }
        translations[lang] = await response.json();
        return true;
    } catch (error) {
        console.error(`Error loading translation ${lang}:`, error);
        return false;
    }
}

// Initialize translations
async function initializeTranslations() {
    // Load all available languages
    const languages = ['en', 'zh-CN', 'zh-TW', 'es', 'ja'];
    await Promise.all(languages.map(lang => loadTranslation(lang)));
    
    // Set current language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language') || 'en';
    currentLang = savedLang;
    document.getElementById('langSelect').value = currentLang;
    updateLanguage();
}

// Force English Output State
function saveForceEnglishState() {
    const forceEnglish = document.getElementById('forceEnglishOutput').checked;
    localStorage.setItem('forceEnglishOutput', forceEnglish);
}

function loadForceEnglishState() {
    const forceEnglish = localStorage.getItem('forceEnglishOutput') === 'true';
    document.getElementById('forceEnglishOutput').checked = forceEnglish;
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await initializeTranslations();
    loadSettings();
    loadHistory();
    updateCharCount('original');
    updateCharCount('optimized');
    detectSystemTheme();
    loadSectionStates();
    loadSidebarState();
    loadForceEnglishState();
});

// Theme Management
function detectSystemTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

// Language Management
function changeLanguage() {
    currentLang = document.getElementById('langSelect').value;
    updateLanguage();
    localStorage.setItem('language', currentLang);
}

function updateLanguage() {
    const t = translations[currentLang];
    Object.keys(t).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (key.includes('placeholder')) {
                    element.placeholder = t[key];
                } else {
                    element.textContent = t[key];
                }
            } else {
                element.textContent = t[key];
            }
        }
    });
    
    // Update dynamic hints that depend on current settings
    updateApiFormatHints();
}

// Section Toggle
function toggleSection(section) {
    const content = document.getElementById(section + 'Content');
    const toggle = document.getElementById(section + 'Toggle');
    content.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
    
    // Save state to localStorage
    saveSectionState(section, content.classList.contains('collapsed'));
}

// Save section state
function saveSectionState(section, isCollapsed) {
    const sectionStates = JSON.parse(localStorage.getItem('sectionStates') || '{}');
    sectionStates[section] = isCollapsed;
    localStorage.setItem('sectionStates', JSON.stringify(sectionStates));
}

// Load section states
function loadSectionStates() {
    const sectionStates = JSON.parse(localStorage.getItem('sectionStates') || '{}');
    const sections = ['settings', 'parameters', 'behavior', 'history'];
    
    sections.forEach(section => {
        const content = document.getElementById(section + 'Content');
        const toggle = document.getElementById(section + 'Toggle');
        
        if (content && toggle) {
            // If state is saved, apply it; otherwise keep default
            if (section in sectionStates) {
                if (sectionStates[section]) {
                    // Should be collapsed
                    content.classList.add('collapsed');
                    toggle.classList.add('collapsed');
                } else {
                    // Should be expanded
                    content.classList.remove('collapsed');
                    toggle.classList.remove('collapsed');
                }
            }
        }
    });
}

// Sidebar Toggle
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('sidebarOpenBtn');
    const isCollapsed = sidebar.classList.toggle('collapsed');
    
    // Show/hide the open button
    if (isCollapsed) {
        openBtn.style.display = 'flex';
    } else {
        openBtn.style.display = 'none';
    }
    
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Load sidebar state
function loadSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const openBtn = document.getElementById('sidebarOpenBtn');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        openBtn.style.display = 'flex';
    }
}

// Slider Update
function updateSlider(type) {
    const slider = document.getElementById(type + 'Slider');
    const valueDisplay = document.getElementById(type + 'Value');
    valueDisplay.textContent = slider.value;
}

// Optimizer Type Management
function updateOptimizerType() {
    const optimizerType = document.getElementById('optimizerType').value;
    currentOptimizerType = optimizerType;
    
    // Update logo text
    const logoText = document.getElementById('logoText');
    if (optimizerType === 'claude') {
        logoText.textContent = 'Claude';
    } else {
        logoText.textContent = 'GPT-5';
    }
    
    // Update model name hint
    updateApiFormatHints();
    
    saveSettings();
}

// API Format Management
function updateApiFormatHints() {
    const apiFormat = document.getElementById('apiFormat').value;
    currentApiFormat = apiFormat;
    
    const t = translations[currentLang] || translations['en'];
    const apiBaseInput = document.getElementById('apiBase');
    const apiBaseHint = document.getElementById('apiBaseHint');
    const autoCompleteHint = document.getElementById('autoCompleteHint');
    const modelNameHint = document.getElementById('modelNameHint');
    
    if (apiFormat === 'openai') {
        apiBaseInput.placeholder = 'https://api.openai.com/v1';
        if (apiBaseHint) {
            apiBaseHint.textContent = t.apiBaseHintOpenAI || 'OpenAI: https://api.openai.com/v1 | Compatible services';
        }
        if (autoCompleteHint) {
            autoCompleteHint.textContent = t.autoCompleteHintOpenAI || 'Automatically add /chat/completions to base URL';
        }
    } else {
        apiBaseInput.placeholder = 'https://api.anthropic.com';
        if (apiBaseHint) {
            apiBaseHint.textContent = t.apiBaseHintAnthropic || 'Anthropic: https://api.anthropic.com';
        }
        if (autoCompleteHint) {
            autoCompleteHint.textContent = t.autoCompleteHintAnthropic || 'Automatically add /v1/messages to base URL';
        }
    }
    
    // Update model name hint
    if (modelNameHint) {
        modelNameHint.textContent = t.modelNameHint || 'Claude: claude-3-5-sonnet-20240620 | GPT: gpt-4, gpt-3.5-turbo';
    }
}

// Settings Management
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('apiSettings') || '{}');
    
    // Load optimizer type
    currentOptimizerType = settings.optimizerType || 'claude';
    document.getElementById('optimizerType').value = currentOptimizerType;
    
    // Load API format
    currentApiFormat = settings.apiFormat || 'openai';
    document.getElementById('apiFormat').value = currentApiFormat;
    
    // Load auto-complete setting
    document.getElementById('autoCompleteUrl').checked = settings.autoCompleteUrl !== false; // default true
    
    document.getElementById('apiBase').value = settings.apiBase || 'https://api.openai.com/v1';
    document.getElementById('apiKey').value = settings.apiKey || '';
    document.getElementById('modelName').value = settings.modelName || 'claude-3-5-sonnet-20240620';
    
    // Update UI based on current settings
    updateOptimizerType();
    updateApiFormatHints();
    
    const lang = localStorage.getItem('language') || 'en';
    currentLang = lang;
    document.getElementById('langSelect').value = lang;
    updateLanguage();

    // Load parameter settings
    const params = JSON.parse(localStorage.getItem('optimizationParams') || '{}');
    if (params.accuracy) document.getElementById('accuracySlider').value = params.accuracy;
    if (params.speed) document.getElementById('speedSlider').value = params.speed;
    if (params.brevity) document.getElementById('brevitySlider').value = params.brevity;
    if (params.creativity) document.getElementById('creativitySlider').value = params.creativity;
    if (params.safety) document.getElementById('safetySlider').value = params.safety;
    
    ['accuracy', 'speed', 'brevity', 'creativity', 'safety'].forEach(type => {
        updateSlider(type);
    });

    // Load behavior settings
    const behavior = JSON.parse(localStorage.getItem('behaviorSettings') || '{}');
    document.getElementById('desiredBehavior').value = behavior.desired || '';
    document.getElementById('undesiredBehavior').value = behavior.undesired || '';
}

function saveSettings() {
    const settings = {
        optimizerType: document.getElementById('optimizerType').value,
        apiFormat: document.getElementById('apiFormat').value,
        autoCompleteUrl: document.getElementById('autoCompleteUrl').checked,
        apiBase: document.getElementById('apiBase').value,
        apiKey: document.getElementById('apiKey').value,
        modelName: document.getElementById('modelName').value
    };
    localStorage.setItem('apiSettings', JSON.stringify(settings));

    // Save parameters
    const params = {
        accuracy: document.getElementById('accuracySlider').value,
        speed: document.getElementById('speedSlider').value,
        brevity: document.getElementById('brevitySlider').value,
        creativity: document.getElementById('creativitySlider').value,
        safety: document.getElementById('safetySlider').value
    };
    localStorage.setItem('optimizationParams', JSON.stringify(params));

    // Save behavior
    const behavior = {
        desired: document.getElementById('desiredBehavior').value,
        undesired: document.getElementById('undesiredBehavior').value
    };
    localStorage.setItem('behaviorSettings', JSON.stringify(behavior));

    showToast(translations[currentLang].settingsSaved, 'success');
}

// Character Count
function updateCharCount(type) {
    const textarea = document.getElementById(type + 'Prompt');
    const countElement = document.getElementById(type + 'Count');
    const count = textarea.value.length;
    countElement.textContent = `${count} ${translations[currentLang].characters}`;
}

// Template Loading
function loadTemplate(type) {
    document.getElementById('originalPrompt').value = templates[type];
    updateCharCount('original');
    showToast('Template loaded', 'success');
}

// View Mode Switching
function switchViewMode(mode) {
    // Update button states
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (mode === 'raw') {
        document.getElementById('rawViewBtn').classList.add('active');
        document.getElementById('optimizedPrompt').classList.add('active');
        document.getElementById('structuredOutput').classList.remove('active');
        document.getElementById('comparisonViewInline').classList.remove('active');
    } else if (mode === 'structured') {
        document.getElementById('structuredViewBtn').classList.add('active');
        document.getElementById('optimizedPrompt').classList.remove('active');
        document.getElementById('structuredOutput').classList.add('active');
        document.getElementById('comparisonViewInline').classList.remove('active');
    } else if (mode === 'comparison') {
        document.getElementById('comparisonViewBtn').classList.add('active');
        document.getElementById('optimizedPrompt').classList.remove('active');
        document.getElementById('structuredOutput').classList.remove('active');
        document.getElementById('comparisonViewInline').classList.add('active');
        generateInlineComparison();
    }
}

// Clear Functions
function clearOriginal() {
    document.getElementById('originalPrompt').value = '';
    updateCharCount('original');
}

function clearAll() {
    document.getElementById('originalPrompt').value = '';
    document.getElementById('optimizedPrompt').value = '';
    document.getElementById('structuredOutput').innerHTML = '';
    document.getElementById('comparisonViewInline').innerHTML = '';
    updateCharCount('original');
    updateCharCount('optimized');
    hideOptimizedActions();
    showToast(translations[currentLang].cleared, 'success');
}

// Language Detection Function
function detectLanguage(text) {
    if (!text || text.trim().length === 0) return null;
    
    // Count different character types
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const japaneseChars = (text.match(/[\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
    const koreanChars = (text.match(/[\uac00-\ud7af]/g) || []).length;
    const cyrillicChars = (text.match(/[\u0400-\u04ff]/g) || []).length;
    const arabicChars = (text.match(/[\u0600-\u06ff]/g) || []).length;
    const totalChars = text.length;
    
    // Calculate percentages
    const chinesePercent = (chineseChars / totalChars) * 100;
    const japanesePercent = (japaneseChars / totalChars) * 100;
    const koreanPercent = (koreanChars / totalChars) * 100;
    const cyrillicPercent = (cyrillicChars / totalChars) * 100;
    const arabicPercent = (arabicChars / totalChars) * 100;
    
    // Detect based on character prevalence
    if (chinesePercent > 20) {
        return { code: 'zh', name: 'Chinese (中文)' };
    }
    if (japanesePercent > 10) {
        return { code: 'ja', name: 'Japanese (日本語)' };
    }
    if (koreanPercent > 20) {
        return { code: 'ko', name: 'Korean (한국어)' };
    }
    if (cyrillicPercent > 20) {
        return { code: 'ru', name: 'Russian (Русский)' };
    }
    if (arabicPercent > 20) {
        return { code: 'ar', name: 'Arabic (العربية)' };
    }
    
    // Check for common Spanish words
    const spanishWords = /\b(el|la|los|las|un|una|de|en|que|es|por|para|con|como|más|está)\b/gi;
    const spanishMatches = (text.match(spanishWords) || []).length;
    if (spanishMatches > 3) {
        return { code: 'es', name: 'Spanish (Español)' };
    }
    
    // Check for common French words
    const frenchWords = /\b(le|la|les|un|une|de|et|est|dans|pour|que|avec|ce|il|elle)\b/gi;
    const frenchMatches = (text.match(frenchWords) || []).length;
    if (frenchMatches > 3) {
        return { code: 'fr', name: 'French (Français)' };
    }
    
    // Check for common German words
    const germanWords = /\b(der|die|das|und|ist|in|den|von|zu|mit|auf|für|ein|eine)\b/gi;
    const germanMatches = (text.match(germanWords) || []).length;
    if (germanMatches > 3) {
        return { code: 'de', name: 'German (Deutsch)' };
    }
    
    // Check for common Portuguese words
    const portugueseWords = /\b(o|a|os|as|um|uma|de|em|que|é|por|para|com|não|se)\b/gi;
    const portugueseMatches = (text.match(portugueseWords) || []).length;
    if (portugueseMatches > 3) {
        return { code: 'pt', name: 'Portuguese (Português)' };
    }
    
    // Default to English
    return { code: 'en', name: 'English' };
}

// Metaprompt generators
function generateClaudeMetaprompt(originalPrompt, behaviorSection, params, languageInstruction) {
    return `Today you will be writing instructions to an eager, helpful, but inexperienced and unworldly AI assistant who needs careful instruction and examples to understand how best to behave. I will explain a task to you. You will write instructions that will direct the assistant on how best to accomplish the task consistently, accurately, and correctly.

Here's a prompt that needs optimization:

<Task>
${originalPrompt}
</Task>
${behaviorSection}

Optimization Parameters (1-10 scale):
- Accuracy: ${params.accuracy}/10 (Higher = more precise, detailed instructions)
- Speed: ${params.speed}/10 (Higher = optimize for faster execution)
- Brevity: ${params.brevity}/10 (Higher = more concise output)
- Creativity: ${params.creativity}/10 (Higher = more creative/flexible approaches)
- Safety: ${params.safety}/10 (Higher = stricter safety constraints)

To write your instructions, follow THESE instructions:

1. In <Inputs> tags, write down the barebones, minimal, nonoverlapping set of text input variable(s) the instructions will make reference to. (These are variable names, not specific instructions.) Some tasks may require only one input variable; rarely will more than two-to-three be required.

2. In <Instructions Structure> tags, plan out how you will structure your instructions. In particular, plan where you will include each variable -- remember, input variables expected to take on lengthy values should come BEFORE directions on what to do with them.

3. Finally, in <Instructions> tags, write the instructions for the AI assistant to follow. These instructions should be similarly structured as good prompt examples.

Note: This is probably obvious to you already, but you are not *completing* the task here. You are writing instructions for an AI to complete the task.
Note: Another name for what you are writing is a "prompt template". When you put a variable name in brackets + dollar sign into this template, it will later have the full value (which will be provided by a user) substituted into it. This only needs to happen once for each variable. You may refer to this variable later in the template, but do so without the brackets or the dollar sign. Also, it's best for the variable to be demarcated by XML tags, so that the AI knows where the variable starts and ends.
Note: When instructing the AI to provide an output (e.g. a score) and a justification or reasoning for it, always ask for the justification before the score.
Note: If the task is particularly complicated, you may wish to instruct the AI to think things out beforehand in scratchpad or inner monologue XML tags before it gives its final answer. For simple tasks, omit this.
Note: If you want the AI to output its entire response or parts of its response inside certain tags, specify the name of these tags (e.g. "write your answer inside <answer> tags") but do not include closing tags or unnecessary open-and-close tag sections.${languageInstruction}

After providing the structured <Inputs>, <Instructions Structure>, and <Instructions>, also provide a clean, plain version of the final instructions without the meta-level XML tags for easy copying.`;
}

function generateGPT5Metaprompt(originalPrompt, behaviorSection, params, languageInstruction) {
    return `When asked to optimize prompts, give answers from your own perspective - explain what specific phrases could be added to, or deleted from, this prompt to more consistently elicit the desired behavior or prevent the undesired behavior.

Here's a prompt that needs optimization:

${originalPrompt}
${behaviorSection}

Optimization Parameters (1-10 scale):
- Accuracy: ${params.accuracy}/10 (Higher = more precise, detailed instructions)
- Speed: ${params.speed}/10 (Higher = optimize for faster execution)
- Brevity: ${params.brevity}/10 (Higher = more concise output)
- Creativity: ${params.creativity}/10 (Higher = more creative/flexible approaches)
- Safety: ${params.safety}/10 (Higher = stricter safety constraints)

Please optimize this prompt following GPT-5 best practices from the prompting guide. Focus on:
1. Clear instruction hierarchy without contradictions
2. Proper context gathering guidelines
3. Structured output formatting
4. Ambiguity resolution
5. Tool calling behavior (if applicable)
6. Verbosity control
7. Reasoning effort considerations${languageInstruction}

Output the optimized prompt in this exact structure:

# ROLE
[Define the AI's role and expertise]

# TASK
[Clearly state what the AI needs to accomplish]

# RULES
[List specific rules and constraints]
- Rule 1
- Rule 2
- etc.

# OUTPUT FORMAT
[Specify the expected output structure]

After the structured prompt, provide the same prompt in a clean, plain format without the section headers for easy copying.`;
}

// Optimize Function
async function optimizePrompt() {
    const originalPrompt = document.getElementById('originalPrompt').value.trim();
    
    if (!originalPrompt) {
        showToast(translations[currentLang].enterPrompt, 'error');
        return;
    }

    const apiBase = document.getElementById('apiBase').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const modelName = document.getElementById('modelName').value.trim();

    if (!apiBase || !apiKey) {
        showToast(translations[currentLang].error, 'error');
        return;
    }

    // Get parameters
    const params = {
        accuracy: document.getElementById('accuracySlider').value,
        speed: document.getElementById('speedSlider').value,
        brevity: document.getElementById('brevitySlider').value,
        creativity: document.getElementById('creativitySlider').value,
        safety: document.getElementById('safetySlider').value
    };

    // Get behavior configuration
    const desired = document.getElementById('desiredBehavior').value.trim();
    const undesired = document.getElementById('undesiredBehavior').value.trim();

    originalPromptBackup = originalPrompt;
    
    const optimizeBtn = document.getElementById('optimizeButton');
    
    optimizeBtn.disabled = true;
    optimizeBtn.innerHTML = '<span class="spinner"></span><span id="optimizeBtnText">' + translations[currentLang].optimizing + '</span>';

    try {
        // Check if force English output is enabled
        const forceEnglish = document.getElementById('forceEnglishOutput').checked;
        
        // Detect the language of the original prompt (skip if forcing English)
        const detectedLanguage = forceEnglish ? null : detectLanguage(originalPrompt);
        
        // Check if user has specified language preference in behavior configuration
        const behaviorText = (desired + ' ' + undesired).toLowerCase();
        const hasLanguagePreference = 
            behaviorText.includes('language') ||
            behaviorText.includes('语言') ||
            behaviorText.includes('語言') ||
            behaviorText.includes('lingua') ||
            behaviorText.includes('言語') ||
            behaviorText.includes('english') ||
            behaviorText.includes('chinese') ||
            behaviorText.includes('中文') ||
            behaviorText.includes('español') ||
            behaviorText.includes('日本語');
        
        let behaviorSection = '';
        if (desired || undesired) {
            behaviorSection = `

Behavior Configuration:`;
            if (desired) {
                behaviorSection += `
- The desired behavior is for the agent to: ${desired}`;
            }
            if (undesired) {
                behaviorSection += `
- The agent should NOT: ${undesired}`;
            }
        }
        
        // Add language requirement if not specified by user and not forcing English
        if (!forceEnglish && !hasLanguagePreference && detectedLanguage) {
            if (!behaviorSection) {
                behaviorSection = `

Behavior Configuration:`;
            }
            behaviorSection += `
- IMPORTANT: The agent should respond in ${detectedLanguage.name} (the same language as the input prompt)`;
        }

        // Build language instruction (skip if forcing English)
        let languageInstruction = '';
        if (!forceEnglish && detectedLanguage && detectedLanguage.code !== 'en') {
            if (currentOptimizerType === 'claude') {
                languageInstruction = `\n\nIMPORTANT: Write the ENTIRE optimized prompt (including all sections: Inputs, Instructions Structure, Instructions, and the plain version) in ${detectedLanguage.name}. All content should be in the same language as the original prompt above.`;
            } else {
                languageInstruction = `\n\nIMPORTANT: Write the ENTIRE optimized prompt (including all sections: ROLE, TASK, RULES, OUTPUT FORMAT, and the plain version) in ${detectedLanguage.name}. All content should be in the same language as the original prompt above.`;
            }
        }

        // Generate metaprompt based on optimizer type
        const metaPrompt = currentOptimizerType === 'claude' 
            ? generateClaudeMetaprompt(originalPrompt, behaviorSection, params, languageInstruction)
            : generateGPT5Metaprompt(originalPrompt, behaviorSection, params, languageInstruction);

        // Construct API endpoint with auto-completion if enabled
        const autoCompleteUrl = document.getElementById('autoCompleteUrl').checked;
        let apiEndpoint = apiBase;
        
        if (autoCompleteUrl) {
            // Remove trailing slash
            apiEndpoint = apiBase.replace(/\/$/, '');
            
            if (currentApiFormat === 'openai') {
                // Add /chat/completions if not already present
                if (!apiEndpoint.endsWith('/chat/completions')) {
                    apiEndpoint = `${apiEndpoint}/chat/completions`;
                }
            } else {
                // Add /v1/messages if not already present
                if (!apiEndpoint.endsWith('/v1/messages')) {
                    apiEndpoint = `${apiEndpoint}/v1/messages`;
                }
            }
        }

        // Make API call based on format
        let response;
        let optimizedContent;
        
        if (currentApiFormat === 'openai') {
            response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [{
                        role: 'user',
                        content: metaPrompt
                    }],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            optimizedContent = data.choices[0].message.content.trim();
        } else {
            // Anthropic API format
            response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: modelName,
                    max_tokens: 4096,
                    messages: currentOptimizerType === 'claude' 
                        ? [
                            {
                                role: 'user',
                                content: metaPrompt
                            },
                            {
                                role: 'assistant',
                                content: '<Inputs>'
                            }
                        ]
                        : [{
                            role: 'user',
                            content: metaPrompt
                        }],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${errorData.error?.message || response.statusText}`);
            }

            const data = await response.json();
            optimizedContent = currentOptimizerType === 'claude' 
                ? '<Inputs>' + data.content[0].text.trim()
                : data.content[0].text.trim();
        }
        
        // Parse content based on optimizer type
        let plainPrompt;
        let structuredContent;
        
        if (currentOptimizerType === 'claude') {
            // Extract the <Instructions> section which contains the optimized prompt
            const instructionsMatch = optimizedContent.match(/<Instructions>([\s\S]*?)<\/Instructions>/);
            structuredContent = instructionsMatch ? instructionsMatch[1].trim() : '';
            
            // Try to extract plain version (content after </Instructions> tag)
            const afterInstructionsMatch = optimizedContent.match(/<\/Instructions>\s*([\s\S]+)/);
            plainPrompt = afterInstructionsMatch ? afterInstructionsMatch[1].trim() : structuredContent;
            
            // Clean up any remaining XML tags from plain version
            plainPrompt = plainPrompt.replace(/<\/?[^>]+(>|$)/g, '').trim();
            
            // If plain prompt is empty or too short, use instructions content
            if (!plainPrompt || plainPrompt.length < 50) {
                plainPrompt = structuredContent;
            }
        } else {
            // GPT-5 format: Extract plain version (after the structured version)
            const plainMatch = optimizedContent.match(/# OUTPUT FORMAT[\s\S]*?\n\n([\s\S]+)/);
            plainPrompt = plainMatch ? plainMatch[1].trim() : optimizedContent;
            structuredContent = optimizedContent;
        }
        
        // Parse structured output for display
        optimizedPromptData = parseStructuredPrompt(structuredContent);
        
        document.getElementById('optimizedPrompt').value = plainPrompt;
        updateCharCount('optimized');
        
        // Render structured view
        renderStructuredOutput(optimizedPromptData);
        
        showOptimizedActions();
        
        // Save to history (save both structured and plain versions)
        addToHistory(originalPrompt, plainPrompt, optimizedContent);
        
        showToast(translations[currentLang].optimizationComplete, 'success');

    } catch (error) {
        console.error('Optimization error:', error);
        showToast(translations[currentLang].error, 'error');
    } finally {
        optimizeBtn.disabled = false;
        optimizeBtn.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg><span id="optimizeBtnText">' + translations[currentLang].optimizeBtnText + '</span>';
    }
}

// Parse Structured Prompt
function parseStructuredPrompt(content) {
    const sections = {
        role: '',
        task: '',
        rules: [],
        outputFormat: ''
    };

    // Try to parse with # headers (legacy format)
    const roleMatch = content.match(/# ROLE\s*\n([\s\S]*?)(?=\n# TASK|$)/);
    const taskMatch = content.match(/# TASK\s*\n([\s\S]*?)(?=\n# RULES|$)/);
    const rulesMatch = content.match(/# RULES\s*\n([\s\S]*?)(?=\n# OUTPUT FORMAT|$)/);
    const outputMatch = content.match(/# OUTPUT FORMAT\s*\n([\s\S]*?)(?=\n\n|$)/);

    if (roleMatch) sections.role = roleMatch[1].trim();
    if (taskMatch) sections.task = taskMatch[1].trim();
    if (rulesMatch) {
        const rulesText = rulesMatch[1].trim();
        sections.rules = rulesText.split('\n').filter(r => r.trim().startsWith('-')).map(r => r.trim());
    }
    if (outputMatch) sections.outputFormat = outputMatch[1].trim();

    // If no structured sections found, try to extract meaningful parts
    if (!sections.role && !sections.task) {
        // Split content into paragraphs
        const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
        
        if (paragraphs.length > 0) {
            sections.task = paragraphs[0].trim();
        }
        if (paragraphs.length > 1) {
            // Look for rules (lines starting with -)
            const rulesText = content.match(/(?:^|\n)((?:[-•]\s*.+\n?)+)/gm);
            if (rulesText) {
                sections.rules = rulesText.join('\n').split('\n')
                    .filter(r => r.trim().match(/^[-•]/))
                    .map(r => r.trim());
            }
            
            // Rest goes to output format
            const lastParagraphs = paragraphs.slice(Math.max(1, paragraphs.length - 2));
            sections.outputFormat = lastParagraphs.join('\n\n');
        }
    }

    return sections;
}

// Render Structured Output
function renderStructuredOutput(data) {
    const output = document.getElementById('structuredOutput');
    let html = '';

    if (data.role) {
        html += `
            <div class="structured-section">
                <div class="structured-header">ROLE</div>
                <div class="structured-content">${escapeHtml(data.role)}</div>
            </div>
        `;
    }

    if (data.task) {
        html += `
            <div class="structured-section">
                <div class="structured-header">TASK</div>
                <div class="structured-content">${escapeHtml(data.task)}</div>
            </div>
        `;
    }

    if (data.rules && data.rules.length > 0) {
        html += `
            <div class="structured-section">
                <div class="structured-header">RULES</div>
                <div class="structured-content">${data.rules.map(r => escapeHtml(r)).join('\n')}</div>
            </div>
        `;
    }

    if (data.outputFormat) {
        html += `
            <div class="structured-section">
                <div class="structured-header">OUTPUT FORMAT</div>
                <div class="structured-content">${escapeHtml(data.outputFormat)}</div>
            </div>
        `;
    }

    output.innerHTML = html;
}

// Generate Inline Comparison
function generateInlineComparison() {
    const original = document.getElementById('originalPrompt').value;
    
    if (!original) {
        document.getElementById('comparisonViewInline').innerHTML = '<div class="diff-context">No comparison available</div>';
        return;
    }

    // Use structured format for comparison
    let structuredText = '';
    if (optimizedPromptData) {
        structuredText = formatStructuredPrompt(optimizedPromptData);
    }
    
    if (!structuredText) {
        const optimized = document.getElementById('optimizedPrompt').value;
        structuredText = optimized;
    }

    const diff = generateDiff(original, structuredText);
    document.getElementById('comparisonViewInline').innerHTML = diff;
}

// Format structured prompt data into readable text
function formatStructuredPrompt(data) {
    let text = '';
    
    if (data.role) {
        text += '# ROLE\n\n';
        text += data.role + '\n\n';
    }
    
    if (data.task) {
        text += '# TASK\n\n';
        text += data.task + '\n\n';
    }
    
    if (data.rules && data.rules.length > 0) {
        text += '# RULES\n\n';
        text += data.rules.join('\n') + '\n\n';
    }
    
    if (data.outputFormat) {
        text += '# OUTPUT FORMAT\n\n';
        text += data.outputFormat;
    }
    
    return text.trim();
}

// Generate Diff (simple word-based diff)
function generateDiff(original, optimized) {
    const originalLines = original.split('\n');
    const optimizedLines = optimized.split('\n');
    
    let html = '<div class="diff-section"><div class="diff-section-title">原始提示词 / Original Prompt</div>';
    
    // Show original prompt
    originalLines.forEach(line => {
        if (line.trim()) {
            html += `<div class="diff-line diff-remove">${escapeHtml(line)}</div>`;
        } else {
            html += `<div class="diff-line diff-empty"></div>`;
        }
    });
    
    html += '</div><div class="diff-section"><div class="diff-section-title">优化后的提示词 / Optimized Prompt (Structured)</div>';
    
    // Show optimized prompt with special formatting for headers
    optimizedLines.forEach(line => {
        if (line.trim()) {
            if (line.trim().startsWith('# ')) {
                html += `<div class="diff-line diff-header">${escapeHtml(line)}</div>`;
            } else {
                html += `<div class="diff-line diff-add">${escapeHtml(line)}</div>`;
            }
        } else {
            html += `<div class="diff-line diff-empty"></div>`;
        }
    });
    
    html += '</div>';
    
    return html;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Optimized Actions
function showOptimizedActions() {
    document.getElementById('reuseBtn').style.display = 'flex';
    document.getElementById('restoreBtn').style.display = 'flex';
    document.getElementById('copyBtn').style.display = 'flex';
}

function hideOptimizedActions() {
    document.getElementById('reuseBtn').style.display = 'none';
    document.getElementById('restoreBtn').style.display = 'none';
    document.getElementById('copyBtn').style.display = 'none';
}

function restoreOriginal() {
    document.getElementById('originalPrompt').value = originalPromptBackup;
    document.getElementById('optimizedPrompt').value = '';
    document.getElementById('structuredOutput').innerHTML = '';
    document.getElementById('comparisonViewInline').innerHTML = '';
    updateCharCount('original');
    updateCharCount('optimized');
    hideOptimizedActions();
    switchViewMode('raw');
    showToast(translations[currentLang].restored, 'success');
}

function copyOptimized() {
    const optimizedPrompt = document.getElementById('optimizedPrompt').value;
    navigator.clipboard.writeText(optimizedPrompt).then(() => {
        showToast(translations[currentLang].copied, 'success');
    });
}

function reuseOptimized() {
    const optimizedPrompt = document.getElementById('optimizedPrompt').value;
    
    if (!optimizedPrompt) {
        return;
    }
    
    // Move optimized prompt to original prompt input
    document.getElementById('originalPrompt').value = optimizedPrompt;
    updateCharCount('original');
    
    // Clear optimized output
    document.getElementById('optimizedPrompt').value = '';
    document.getElementById('structuredOutput').innerHTML = '';
    document.getElementById('comparisonViewInline').innerHTML = '';
    updateCharCount('optimized');
    
    // Hide action buttons
    hideOptimizedActions();
    
    // Reset to raw view
    switchViewMode('raw');
    
    // Clear data
    originalPromptBackup = '';
    optimizedPromptData = null;
    
    // Show success message
    showToast(translations[currentLang].reused, 'success');
}

// History Management
function loadHistory() {
    historyData = JSON.parse(localStorage.getItem('promptHistory') || '[]');
    renderHistory();
}

function addToHistory(original, optimized, structuredContent) {
    const historyItem = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        original: original,
        optimized: optimized,
        structuredContent: structuredContent || optimized // Save structured version for parsing
    };
    
    historyData.unshift(historyItem);
    if (historyData.length > 20) {
        historyData = historyData.slice(0, 20);
    }
    
    localStorage.setItem('promptHistory', JSON.stringify(historyData));
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (historyData.length === 0) {
        historyList.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-tertiary); font-size: 13px;">${translations[currentLang].noHistoryText}</div>`;
        return;
    }
    
    historyList.innerHTML = historyData.map(item => {
        const date = new Date(item.timestamp);
        const timeStr = date.toLocaleString(currentLang);
        const preview = item.original.substring(0, 50) + (item.original.length > 50 ? '...' : '');
        
        return `
            <div class="history-item">
                <div class="history-content" onclick="loadHistoryItem(${item.id})">
                    <div class="history-time">${timeStr}</div>
                    <div class="history-preview">${escapeHtml(preview)}</div>
                </div>
                <button class="history-delete-btn" onclick="event.stopPropagation(); deleteHistoryItem(${item.id})" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                    </svg>
                </button>
            </div>
        `;
    }).join('');
}

function loadHistoryItem(id) {
    const item = historyData.find(h => h.id === id);
    if (item) {
        document.getElementById('originalPrompt').value = item.original;
        document.getElementById('optimizedPrompt').value = item.optimized;
        updateCharCount('original');
        updateCharCount('optimized');
        showOptimizedActions();
        originalPromptBackup = item.original;
        
        // Parse and render structured view from structured content
        const contentToParse = item.structuredContent || item.optimized;
        optimizedPromptData = parseStructuredPrompt(contentToParse);
        renderStructuredOutput(optimizedPromptData);
    }
}

function deleteHistoryItem(id) {
    // Find and remove the item
    historyData = historyData.filter(h => h.id !== id);
    
    // Save updated history
    localStorage.setItem('promptHistory', JSON.stringify(historyData));
    
    // Re-render history list
    renderHistory();
    
    // Show toast notification
    showToast(translations[currentLang].historyDeleted || 'History item deleted', 'success');
}

// Toast Notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to optimize
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        optimizePrompt();
    }
    // Ctrl/Cmd + S to save settings
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSettings();
    }
});
