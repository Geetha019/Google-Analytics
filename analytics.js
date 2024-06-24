// Function to set a cookie
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Function to get a cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to fetch IP data using ipapi.co
async function fetchIPData() {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
        throw new Error(`Failed to fetch IP data: ${response.status} ${response.statusText}`);
    }
    return await response.json();
}

// Function to collect and post analytics data
async function collectAndPostAnalytics() {
    const ipInfo = await fetchIPData()
        .catch(error => console.error('Error fetching IP data:', error));

    const sessionID = generateSessionID();
    const userID = getUserId();

    const analyticsData = {
        SESSIONID: sessionID,
        USERID: userID,
        SITEID: 'my_website_id', // Replace with your site ID
        ENAME: 'pageview', // Event name (e.g., pageview, click, etc.)
        EVENT: 'pageview', // Event type (e.g., pageview, click, etc.)
        URL: window.location.href,
        USERIDENTIFIER: userID, // Example implementation for User ID
        ECAT: 'navigation', // Event category
        EACTION: 'view', // Event action
        ELABEL: document.title, // Event label (e.g., page title)
        EVAL: 1, // Event value (if applicable)
        DEVICE: getDeviceDetails().device, // Device details
        DEVICETYPE: getDeviceDetails().type, // Device type (e.g., desktop, mobile)
        DEVICEVENDOR: getDeviceDetails().vendor, // Device vendor
        CPU: getDeviceDetails().cpu, // CPU details
        RESOLUTION: `${window.screen.width}x${window.screen.height}`, // Screen resolution
        LANGUAGE: navigator.language, // Browser language
        BROWSER: getBrowserDetails().name, // Browser name
        OS: getBrowserDetails().os, // Operating system
        USERAGENT: navigator.userAgent, // User agent
        OSVER: getBrowserDetails().version, // OS version
        BTIME: new Date().toISOString(), // Event timestamp
        CREATEDTIME: new Date().toISOString(), // Creation timestamp (example)
        PAGETITLE: document.title, // Page title
        FINGERPRINT: generateFingerprint(), // User fingerprint (optional, for tracking)
        CITY: ipInfo.city,
        REGION: ipInfo.region,
        COUNTRY_NAME: ipInfo.country_name,
        ZIP: ipInfo.postal,
        TIMEZONE: ipInfo.timezone,
        IP: ipInfo.ip,
        ISP: ipInfo.org,
        REGIONCODE: ipInfo.region_code,
        COUNTRYCODE: ipInfo.country_code,
        CURRENCY: ipInfo.currency,
        ASN: ipInfo.asn,
        ASNNAME: ipInfo.asn_org,
        ASNTYPE: ipInfo.asn_type,
        TIME_SPENT: 0 // Initial time spent
    };

    // Post data to the Pipedream endpoint
    fetch('https://eogm9h7v36sjnmw.m.pipedream.net', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(analyticsData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        console.log('Analytics data sent successfully:', analyticsData);
    })
    .catch(error => {
        console.error('Error sending analytics data:', error);
    });

    // Update time spent on page every 30 seconds
    setInterval(() => {
        analyticsData.TIME_SPENT += 30; // Increase time spent by 30 seconds
        analyticsData.EVENT = 'time_update';
        analyticsData.BTIME = new Date().toISOString();
        
        fetch('https://eokl4fk1qkn8627.m.pipedream.net', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(analyticsData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            console.log('Time spent data updated:', analyticsData);
        })
        .catch(error => {
            console.error('Error updating time spent data:', error);
        });
    }, 30000);
}

// Function to generate a unique session ID (example implementation)
function generateSessionID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Function to get or create a user ID
function getUserId() {
    let userID = getCookie('USERID');
    if (!userID) {
        userID = 'USER_' + generateSessionID();
        setCookie('USERID', userID, 365); // Cookie expires in 1 year
    }
    return userID;
}

// Function to get device details
function getDeviceDetails() {
    // Implement logic to detect device details (device type, vendor, CPU)
    return {
        device: 'Desktop',
        type: 'desktop',
        vendor: 'Unknown',
        cpu: 'Intel Core i7',
    };
}

// Function to get browser details
function getBrowserDetails() {
    // Implement logic to detect browser details (name, OS, version)
    return {
        name: 'Chrome',
        os: 'Windows',
        version: '94.0.4606.81',
    };
}

// Function to generate a user fingerprint (example implementation)
function generateFingerprint() {
    // Implement logic to generate a unique fingerprint for the user (optional)
    return 'unique_fingerprint_example';
}

// Call the function to collect and post analytics data on page load or as needed
collectAndPostAnalytics();
