/*!
 * Aris Resume Search v1.0.0
 * A powerful tool to help job seekers find real-world resume examples
 * MIT License | https://aristotle.me/resume-search
 */

// ==========================================================================
// Constants and Configuration
// ==========================================================================
const SHARE_API_URL = "https://share-count-api.aristotle.me"; // Share Counter API

// ==========================================================================
// DOM Elements
// ==========================================================================
const jobTitleInput = document.getElementById('jobTitle');
const excludeTemplatesCheckbox = document.getElementById('excludeTemplates');
const googleButton = document.querySelector('.btn-google');
const linkedinButton = document.querySelector('.btn-linkedin');
const githubButton = document.querySelector('.btn-github');

// Skills/Keywords elements
const skillsKeywordsInput = document.getElementById('skillsKeywords');
const chipsDisplay = document.getElementById('chipsDisplay');
const logicAndRadio = document.getElementById('logicAnd');
const logicOrRadio = document.getElementById('logicOr');

// ==========================================================================
// Skills/Keywords Management
// ==========================================================================
let keywords = [];

function addKeyword(keyword) {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword)) {
        keywords.push(trimmedKeyword);
        renderChips();
    }
}

function removeKeyword(keyword) {
    keywords = keywords.filter(k => k !== keyword);
    renderChips();
}

function renderChips() {
    chipsDisplay.innerHTML = '';
    keywords.forEach(keyword => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            <span>${keyword}</span>
            <button type="button" class="chip-remove" onclick="removeKeyword('${keyword}')" aria-label="Remove ${keyword}">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        `;
        chipsDisplay.appendChild(chip);
    });
}

function generateKeywordsQuery(keywordsArray = keywords) {
    if (keywordsArray.length === 0) return '';
    
    const isAndLogic = logicAndRadio.checked;
    const keywordQueries = keywordsArray.map(keyword => `intext:"${keyword}"`);
    
    if (isAndLogic) {
        return keywordQueries.join(' ');
    } else {
        return keywordQueries.join(' OR ');
    }
}

// ==========================================================================
// URL Generation Functions
// ==========================================================================
function generateGoogleURL(jobTitle, excludeTemplates, keywords = []) {
    let query = '';
    
    // Add job title if provided
    if (jobTitle) {
        query = `"${jobTitle}" AND (resume OR CV) filetype:pdf OR filetype:docx OR filetype:doc`;
    }
    
    // Add keywords if provided
    if (keywords.length > 0) {
        const keywordsQuery = generateKeywordsQuery(keywords);
        if (query) {
            query += ` AND (${keywordsQuery})`;
        } else {
            query = `(${keywordsQuery}) AND (resume OR CV) filetype:pdf OR filetype:docx OR filetype:doc`;
        }
    }
    
    // If no job title or keywords, create a basic resume search
    if (!query) {
        query = '(resume OR CV) filetype:pdf OR filetype:docx OR filetype:doc';
    }
    
    // Add template exclusion if requested
    if (excludeTemplates) {
        query += ' -intitle:sample -intitle:template';
    }
    
    const encodedQuery = encodeURIComponent(query);
    return `https://www.google.com/search?q=${encodedQuery}`;
}

function generateLinkedInURL(jobTitle, keywords = []) {
    let query = '';
    
    // Add job title if provided
    if (jobTitle) {
        query = `site:linkedin.com/in "${jobTitle}" AND (intitle:resume OR intext:"view my resume" OR intext:"download my resume" OR intext:"resume attached" OR intext:"my resume")`;
    }
    
    // Add keywords if provided
    if (keywords.length > 0) {
        const keywordsQuery = generateKeywordsQuery(keywords);
        if (query) {
            query += ` AND (${keywordsQuery})`;
        } else {
            query = `site:linkedin.com/in (${keywordsQuery}) AND (intitle:resume OR intext:"view my resume" OR intext:"download my resume" OR intext:"resume attached" OR intext:"my resume")`;
        }
    }
    
    // If no job title or keywords, create a basic LinkedIn resume search
    if (!query) {
        query = 'site:linkedin.com/in (intitle:resume OR intext:"view my resume" OR intext:"download my resume" OR intext:"resume attached" OR intext:"my resume")';
    }
    
    const encodedQuery = encodeURIComponent(query);
    return `https://www.google.com/search?q=${encodedQuery}`;
}

function generateGitHubURL(jobTitle, keywords = []) {
    let query = '';
    
    // Add job title if provided
    if (jobTitle) {
        query = `site:github.com "${jobTitle}" AND (inurl:resume OR inurl:CV OR inurl:Portfolio OR intitle:Portfolio OR intitle:resume OR intitle:CV)`;
    }
    
    // Add keywords if provided
    if (keywords.length > 0) {
        const keywordsQuery = generateKeywordsQuery(keywords);
        if (query) {
            query += ` AND (${keywordsQuery})`;
        } else {
            query = `site:github.com (${keywordsQuery}) AND (inurl:resume OR inurl:CV OR inurl:Portfolio OR intitle:Portfolio OR intitle:resume OR intitle:CV)`;
        }
    }
    
    // If no job title or keywords, create a basic GitHub resume search
    if (!query) {
        query = 'site:github.com (inurl:resume OR inurl:CV OR inurl:Portfolio OR intitle:Portfolio OR intitle:resume OR intitle:CV)';
    }
    
    const encodedQuery = encodeURIComponent(query);
    return `https://www.google.com/search?q=${encodedQuery}`;
}

// Toggle logic function for compact toggle
function toggleLogic() {
    const andRadio = document.getElementById('logicAnd');
    const orRadio = document.getElementById('logicOr');
    
    if (andRadio.checked) {
        orRadio.checked = true;
        andRadio.checked = false;
    } else {
        andRadio.checked = true;
        orRadio.checked = false;
    }
}

// ==========================================================================
// Search Functionality
// ==========================================================================
function validateInput() {
    const jobTitle = jobTitleInput.value.trim();
    
    if (jobTitle === '' && keywords.length === 0) {
        alert('Please enter a job title or at least one keyword');
        return false;
    }
    
    return true;
}

function handleSearch(platform, buttonElement) {
    // Validate input first
    if (!validateInput()) {
        return;
    }

    // Get form values
    const jobTitle = jobTitleInput.value.trim();
    const excludeTemplates = excludeTemplatesCheckbox.checked;

    // Add loading state to button
    const originalText = buttonElement.textContent;
    buttonElement.textContent = `Searching ${platform}...`;
    buttonElement.disabled = true;

    // Generate URL based on platform
    let url;
    switch (platform) {
        case 'Google':
            url = generateGoogleURL(jobTitle, excludeTemplates, keywords);
            break;
        case 'LinkedIn':
            url = generateLinkedInURL(jobTitle, keywords);
            break;
        case 'GitHub':
            url = generateGitHubURL(jobTitle, keywords);
            break;
    }

    // Log to console for debugging
    console.log(`Search ${platform}:`);
    console.log('Job Title:', jobTitle);
    console.log('Keywords:', keywords);
    console.log('Exclude Templates:', excludeTemplates);
    console.log('Generated URL:', url);
    console.log('---');

    // Open URL in new tab
    window.open(url, '_blank');

    // Reset button state after short delay
    setTimeout(() => {
        buttonElement.textContent = originalText;
        buttonElement.disabled = false;
    }, 1000);
}

// ==========================================================================
// Share Counter Functionality
// ==========================================================================
let totalShares = 0;

async function loadShareCount() {
    try {
        console.log('Fetching share count from API...');
        const response = await fetch(SHARE_API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        console.log('API Response Status:', response.status);
        const responseText = await response.text();
        console.log('API Response Text:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
        }
        
        const data = JSON.parse(responseText);
        console.log('Parsed API Response:', data);
        totalShares = data.count || 0;
        console.log('Current total shares:', totalShares);
        updateShareCounts();
    } catch (error) {
        console.error('Failed to load share count:', error);
        // Fallback to localStorage if API fails
        const savedCount = localStorage.getItem('arisResumeShareCount');
        if (savedCount) {
            totalShares = parseInt(savedCount, 10);
            updateShareCounts();
        }
    }
}

async function saveShareCount() {
    try {
        console.log('Saving share to API...');
        const response = await fetch(SHARE_API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action: 'increment' })
        });

        console.log('Save Response Status:', response.status);
        const data = await response.json();
        console.log('Save Response Data:', data);

        if (!response.ok) {
            throw new Error(`Failed to save share count. Status: ${response.status}`);
        }

        // Update the total from the server response
        if (data.count !== undefined) {
            totalShares = data.count;
            // Backup to localStorage
            localStorage.setItem('arisResumeShareCount', totalShares.toString());
            console.log('Share count updated from API:', totalShares);
        }

        updateShareCounts();
    } catch (error) {
        console.error('Failed to save share count:', error);
        // Fallback to localStorage increment if API fails
        totalShares++;
        localStorage.setItem('arisResumeShareCount', totalShares.toString());
        updateShareCounts();
        console.log('Share count incremented locally as fallback');
    }
}

function updateShareCounts() {
    const shareCountElements = document.querySelectorAll('.share-count, .floating-share-count');
    const floatingShareLabel = document.querySelector('.floating-share-label');
    
    shareCountElements.forEach(element => {
        if (totalShares > 0) {
            element.style.display = 'block';
            if (element.classList.contains('floating-share-count')) {
                // For floating share count, split number and label
                element.innerHTML = `
                    <span class="number">${totalShares.toLocaleString()}</span>
                    <span class="label">${totalShares === 1 ? 'Share' : 'Shares'}</span>
                `;
            } else {
                // For main share count
                element.textContent = `${totalShares.toLocaleString()} ${totalShares === 1 ? 'Share' : 'Shares'}`;
            }
        }
    });

    // Hide the "Share" label when count is shown
    if (floatingShareLabel && totalShares > 0) {
        floatingShareLabel.style.display = 'none';
    }
}

async function incrementShareCount() {
    await saveShareCount();
}

// ==========================================================================
// Share Button Functionality
// ==========================================================================
async function shareOnTwitter() {
    const text = "Discover real resumes and connect with professionals using Aris Resume Search. Built by a job seeker, for job seekers! \n#jobsearch #resumetips #careertools";
    const url = 'https://aristotle.me/resume-search/?utm_source=twitter';
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
    await incrementShareCount();
}

async function shareOnLinkedIn() {
    const text = "Just found this awesome tool: Aris Resume Search. \nYou can instantly find real professional resumes, get inspired, and even connect with others in your field. Highly recommend for job seekers and recruiters!";
    const url = 'https://aristotle.me/resume-search/?utm_source=linkedin';
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(linkedinUrl, '_blank');
    await incrementShareCount();
}

async function copyPageUrl() {
    const url = window.location.href;
    try {
        await navigator.clipboard.writeText(url);
        await incrementShareCount();
        const buttons = document.querySelectorAll('.copy-link');
        buttons.forEach(button => {
            const originalText = button.textContent;
            const originalHtml = button.innerHTML;
            if (originalText) { // For the main share button
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            } else { // For the floating share button
                const checkmark = `<svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>`;
                button.innerHTML = checkmark;
                setTimeout(() => {
                    button.innerHTML = originalHtml;
                }, 2000);
            }
        });
    } catch (err) {
        console.error('Failed to copy URL:', err);
        alert('Failed to copy URL to clipboard');
    }
}

// ==========================================================================
// Floating Share Panel
// ==========================================================================
const shareSection = document.querySelector('.share-section');
const floatingShare = document.querySelector('.floating-share');
let shareSectionTop;
let shareSectionBottom;

function updateShareSectionPosition() {
    const rect = shareSection.getBoundingClientRect();
    shareSectionTop = rect.top + window.pageYOffset;
    shareSectionBottom = rect.bottom + window.pageYOffset;
}

function handleScroll() {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const rect = shareSection.getBoundingClientRect();
    
    // Check if share section is partially visible in viewport
    const isShareSectionVisible = (rect.top < windowHeight && rect.bottom > 0);
    
    // Show floating panel only when share section is not visible
    if (!isShareSectionVisible) {
        floatingShare.classList.add('visible');
    } else {
        floatingShare.classList.remove('visible');
    }
}

// ==========================================================================
// Event Listeners
// ==========================================================================
// Add event listeners to buttons
googleButton.addEventListener('click', function() {
    handleSearch('Google', googleButton);
});

linkedinButton.addEventListener('click', function() {
    handleSearch('LinkedIn', linkedinButton);
});

githubButton.addEventListener('click', function() {
    handleSearch('GitHub', githubButton);
});

// Skills/Keywords input event listeners
skillsKeywordsInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' || event.key === ',') {
        event.preventDefault();
        const keyword = skillsKeywordsInput.value.trim();
        if (keyword) {
            addKeyword(keyword);
            skillsKeywordsInput.value = '';
        }
    } else if (event.key === 'Backspace' && skillsKeywordsInput.value === '' && keywords.length > 0) {
        // Remove last keyword when backspace is pressed on empty input
        removeKeyword(keywords[keywords.length - 1]);
    }
});

skillsKeywordsInput.addEventListener('blur', function() {
    const keyword = skillsKeywordsInput.value.trim();
    if (keyword) {
        addKeyword(keyword);
        skillsKeywordsInput.value = '';
    }
});

// Logic toggle event listeners
logicAndRadio.addEventListener('change', function() {
    // Logic changed - no preview update needed
});
logicOrRadio.addEventListener('change', function() {
    // Logic changed - no preview update needed
});

// Optional: Add Enter key support for the job title input field
jobTitleInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        handleSearch('Google', googleButton); // Default to Google search on Enter
    }
});

// Initialize positions and add event listeners
window.addEventListener('load', () => {
    updateShareSectionPosition();
    handleScroll(); // Check initial position
    loadShareCount(); // Load initial share count
});

window.addEventListener('resize', () => {
    updateShareSectionPosition();
    handleScroll(); // Check position after resize
});

window.addEventListener('scroll', handleScroll);