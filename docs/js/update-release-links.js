// docs/js/update-release-links.js

// Wrap everything in a function to avoid polluting global scope immediately
(function() {
    // --- Configuration ---
    console.log("WarpScanner Link Updater: Script loaded.");
    const GITHUB_API_BASE = 'https://api.github.com/repos/';
    const MAIN_REPO = 'arshiacomplus/WarpScanner';
    const ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI';

    // --- Fallback Configuration for Linux ---
    const LINUX_FALLBACK_VERSION = 'v0.4.1';
    const LINUX_FALLBACK_FILENAME = `WarpScanner-${LINUX_FALLBACK_VERSION}-linux-64bit.tar.gz`;
    const LINUX_FALLBACK_URL = `https://github.com/arshiacomplus/WarpScanner/releases/download/${LINUX_FALLBACK_VERSION}/${LINUX_FALLBACK_FILENAME}`;

    // --- State Variables ---
    let isRunning = false; // Flag to prevent multiple simultaneous runs
    let runTimeout = null; // Timeout ID for debounce

    // --- Helper Function to Update Element ---
    // Updates text content and optionally the href attribute if it's an anchor tag.
    function updateElement(id, text, href = null) {
        const element = document.getElementById(id);
        if (element) {
            // Store original text if not already stored (useful for resetting errors)
            if (!element.dataset.originalText && element.textContent && !element.textContent.includes("...")) {
                 element.dataset.originalText = element.textContent;
            }

            // Update text content if provided
            if (text !== null) {
                element.textContent = text;
            }

            // If it's an anchor tag and href is provided, update it
            if (element.tagName === 'A' && href !== null) {
                element.href = href;
                // If text was not explicitly provided for the link, try to use the filename from href
                if (text === null && href !== '#') {
                    try {
                        const url = new URL(href);
                        // Decode URI component in case filename has encoded chars like %2B
                        element.textContent = decodeURIComponent(url.pathname.split('/').pop()) || "Download Link";
                    } catch (e) {
                        console.warn(`Could not parse URL for filename: ${href}`, e);
                        element.textContent = "Download Link"; // Fallback
                    }
                }
                // If href is '#' (error or not found) and no specific text, show generic error
                else if (text === null && href === '#') {
                     element.textContent = "لینک یافت نشد";
                }
                // If text was provided explicitly (like fallback filename), use it
                else if (text !== null){
                     element.textContent = text;
                }
            }
             // If it's not an anchor and no update provided, check if it's still a placeholder
             else if (href === null && text === null && element.textContent.includes("...")) {
                 element.textContent = "خطا/نامشخص";
             }
        }
         // Log if an essential element is missing (optional, can be noisy)
         // else { console.warn(`Element with ID "${id}" not found.`); }
    }

    // --- Helper Function to Find Asset URL by Filename Part ---
    function findAssetUrl(assets, filenamePart) {
        if (!assets || !Array.isArray(assets)) return null;
        // Try exact match first
        let asset = assets.find(a => a.name === filenamePart);
        // Then try includes (partial match)
        if (!asset) {
             asset = assets.find(a => a.name && a.name.includes(filenamePart));
        }
        return asset ? asset.browser_download_url : null;
    }

     // --- Fetch Latest Release Data ---
     async function fetchLatestRelease(repo) {
        console.log(`Fetching latest release for ${repo}...`);
        try {
            const timestamp = Date.now(); // Cache busting parameter
            // Use 'no-store' cache policy to be more aggressive against caching
            const response = await fetch(`${GITHUB_API_BASE}${repo}/releases/latest?t=${timestamp}`, { cache: "no-store" });
            if (!response.ok) {
                let errorMsg = `API Error (${response.status})`;
                if (response.status === 403) errorMsg = `Rate limit exceeded (${response.status})`;
                if (response.status === 404) errorMsg = `Not Found (${response.status})`;
                console.error(`GitHub API error for ${repo}: ${response.status} ${response.statusText}`);
                throw new Error(errorMsg); // Throw specific error message
            }
            const data = await response.json();
            console.log(`Successfully fetched release ${data.tag_name} for ${repo}.`);
            return data;
        } catch (error) {
            console.error(`Failed to fetch latest release for ${repo}:`, error);
            throw error; // Re-throw the error to be caught by Promise.allSettled
        }
    }

    // --- Main Update Logic ---
    async function updateLinks() {
         // Check if the necessary elements exist on the *current* page
         // We need at least one ID from each repo section to justify fetching
         const mainInfoElem = document.getElementById('main-latest-version-info');
         const androidInfoElem = document.getElementById('android-latest-version-info');
         const linuxLinkElem = document.getElementById('linux-64bit-link'); // Also check Linux

         // If none of the key target elements exist, assume we're not on the setup page
         if (!mainInfoElem && !androidInfoElem && !linuxLinkElem) {
             console.log("WarpScanner Link Updater: Target elements not found on this page. Skipping update.");
             return; // Exit early
         }

         console.log("WarpScanner Link Updater: Target elements found. Starting update process...");

         // Reset relevant elements to 'loading' state before fetching
         // Only reset elements that actually exist on the current page view
         if (mainInfoElem) {
              updateElement('main-latest-version-info', 'در حال دریافت آخرین نسخه اصلی...');
              updateElement('main-latest-version-warn', '...');
              updateElement('win7-portable-link', 'در حال بارگذاری لینک...', '#'); updateElement('win7-portable-version', '...');
              updateElement('win8-upper-portable-link', 'در حال بارگذاری لینک...', '#'); updateElement('win8-upper-portable-version', '...');
              updateElement('win7-setup-link', 'در حال بارگذاری لینک...', '#'); updateElement('win7-setup-version', '...');
              updateElement('win8-upper-setup-link', 'در حال بارگذاری لینک...', '#'); updateElement('win8-upper-setup-version', '...');
         }
          if (linuxLinkElem) { // Reset Linux separately as it might exist without mainInfoElem in some structures
             updateElement('linux-64bit-link', 'در حال بارگذاری لینک...', '#'); updateElement('linux-64bit-version', '...');
             updateElement('linux-latest-version-note', 'در حال بررسی...');
         }
         if (androidInfoElem) {
             updateElement('android-latest-version-info', '...');
             updateElement('android-latest-version-page', 'در حال دریافت آخرین نسخه اندروید...');
             updateElement('android-apk-link', 'در حال بارگذاری لینک...', '#'); updateElement('android-apk-version', '...');
         }


        // Fetch data in parallel using Promise.allSettled to handle individual errors
        const results = await Promise.allSettled([
            // Only fetch if the corresponding key element exists
            (mainInfoElem || linuxLinkElem) ? fetchLatestRelease(MAIN_REPO) : Promise.resolve(null), // Fetch if main OR linux exists
            androidInfoElem ? fetchLatestRelease(ANDROID_REPO) : Promise.resolve(null)
        ]);

        const mainResult = results[0];
        const androidResult = results[1];

        // --- Process Main Repo Result (Windows & Linux) ---
        if (mainInfoElem || linuxLinkElem) { // Check if we attempted to fetch for this repo
            if (mainResult.status === 'fulfilled' && mainResult.value) {
                const release = mainResult.value;
                const latestVersion = release.tag_name;
                const assets = release.assets;

                // Update elements only if they were intended to be updated (exist)
                if (mainInfoElem) {
                     updateElement('main-latest-version-info', `آخرین نسخه اصلی: ${latestVersion}`);
                     updateElement('main-latest-version-warn', latestVersion);

                     // Windows Assets
                     const win7PortablePart = 'win7-Portable.rar';
                     const win8PortablePart = 'win8-upper-Portable.rar';
                     const win7SetupPart = 'win7-Setup.exe';
                     const win8SetupPart = 'win8-upper-Setup.exe';
                     const win7PortableUrl = findAssetUrl(assets, win7PortablePart);
                     const win8PortableUrl = findAssetUrl(assets, win8PortablePart);
                     const win7SetupUrl = findAssetUrl(assets, win7SetupPart);
                     const win8SetupUrl = findAssetUrl(assets, win8SetupPart);

                     updateElement('win7-portable-link', null, win7PortableUrl || '#'); updateElement('win7-portable-version', win7PortableUrl ? latestVersion : 'یافت نشد');
                     updateElement('win8-upper-portable-link', null, win8PortableUrl || '#'); updateElement('win8-upper-portable-version', win8PortableUrl ? latestVersion : 'یافت نشد');
                     updateElement('win7-setup-link', null, win7SetupUrl || '#'); updateElement('win7-setup-version', win7SetupUrl ? latestVersion : 'یافت نشد');
                     updateElement('win8-upper-setup-link', null, win8SetupUrl || '#'); updateElement('win8-upper-setup-version', win8SetupUrl ? latestVersion : 'یافت نشد');
                }

                // Linux Asset with Fallback (only if linux element exists)
                if (linuxLinkElem) {
                     const linuxPart = 'linux-64bit.tar.gz';
                     const linuxUrl = findAssetUrl(assets, linuxPart);
                     if (linuxUrl) {
                         console.log(`Linux asset found in latest release (${latestVersion}): ${linuxUrl}`);
                         updateElement('linux-64bit-link', null, linuxUrl);
                         updateElement('linux-64bit-version', latestVersion);
                         updateElement('linux-latest-version-note', `(فایل از آخرین نسخه ${latestVersion})`);
                     } else {
                         console.log(`Linux asset not found in latest release (${latestVersion}). Falling back to ${LINUX_FALLBACK_VERSION}.`);
                         updateElement('linux-64bit-link', LINUX_FALLBACK_FILENAME, LINUX_FALLBACK_URL); // Explicitly set filename text
                         updateElement('linux-64bit-version', LINUX_FALLBACK_VERSION);
                         updateElement('linux-latest-version-note', `(نسخه ${latestVersion} فاقد فایل لینوکس بود، از ${LINUX_FALLBACK_VERSION} استفاده شد)`);
                     }
                }
            } else {
                // Handle fetch error for main repo
                const errorMsg = mainResult.reason?.message || 'خطای نامشخص';
                console.error('Error updating main repo:', mainResult.reason);
                // Update elements to show the error, only if they exist
                if (mainInfoElem) {
                    updateElement('main-latest-version-info', `خطا (${errorMsg})`);
                    updateElement('main-latest-version-warn', '!');
                    updateElement('win7-portable-link', 'خطا', '#'); updateElement('win7-portable-version', '!');
                    updateElement('win8-upper-portable-link', 'خطا', '#'); updateElement('win8-upper-portable-version', '!');
                    updateElement('win7-setup-link', 'خطا', '#'); updateElement('win7-setup-version', '!');
                    updateElement('win8-upper-setup-link', 'خطا', '#'); updateElement('win8-upper-setup-version', '!');
                }
                 if (linuxLinkElem) {
                    updateElement('linux-64bit-link', 'خطا', '#'); updateElement('linux-64bit-version', '!');
                    updateElement('linux-latest-version-note', `(خطا در بررسی: ${errorMsg})`);
                 }
            }
        }

        // --- Process Android Repo Result ---
         if (androidInfoElem) { // Check if we attempted to fetch for Android
            if (androidResult.status === 'fulfilled' && androidResult.value) {
                const release = androidResult.value;
                const latestVersion = release.tag_name;
                const assets = release.assets;
                console.log(`Android Repo Latest: ${latestVersion}`);

                updateElement('android-latest-version-info', latestVersion);
                updateElement('android-latest-version-page', `آخرین نسخه اندروید: ${latestVersion}`);

                const apkAsset = assets ? assets.find(a => a.name && a.name.endsWith('.apk')) : null;
                const apkUrl = apkAsset ? apkAsset.browser_download_url : null;

                updateElement('android-apk-link', null, apkUrl || '#');
                updateElement('android-apk-version', apkUrl ? latestVersion : 'یافت نشد');
                console.log(`Android asset URL: ${apkUrl}`);
            } else {
                // Handle fetch error for android repo
                const errorMsg = androidResult.reason?.message || 'خطای نامشخص';
                console.error('Error updating android repo:', androidResult.reason);
                updateElement('android-latest-version-info', 'خطا');
                updateElement('android-latest-version-page', `خطا (${errorMsg})`);
                updateElement('android-apk-link', 'خطا', '#');
                updateElement('android-apk-version', '!');
            }
        }
         console.log("WarpScanner Link Updater: Update process finished.");
    }

    // Debounced version of updateLinks to prevent rapid firing and ensure DOM readiness
    function debouncedUpdateLinks() {
        // Clear existing timeout if called again quickly
        if (runTimeout) {
            clearTimeout(runTimeout);
            // console.log("WarpScanner Link Updater: Debounce timer cleared.");
        }

        // If already running, just let it finish, don't queue another immediately unless forced
        if (isRunning) {
            console.log("WarpScanner Link Updater: Update already in progress. Call ignored/debounced.");
            return; // Or potentially queue it for later if needed, but simple ignore is often best
        }

        // Set a timeout to delay execution, allowing DOM to settle after navigation
        runTimeout = setTimeout(async () => {
            // Check if still running (shouldn't be if logic is correct, but as safeguard)
             if (isRunning) return;
             isRunning = true; // Set flag *before* starting async operation
             console.log("WarpScanner Link Updater: Debounce timeout finished. Calling updateLinks.");
             try {
                  await updateLinks(); // Perform the actual update
             } catch (error) {
                  console.error("WarpScanner Link Updater: Uncaught error during updateLinks:", error);
             } finally {
                  isRunning = false; // Reset flag *after* async operation completes or errors
                  runTimeout = null; // Clear the timeout ID
                 console.log("WarpScanner Link Updater: isRunning flag reset to false.");
             }
        }, 250); // 250ms delay - adjust if needed
        // console.log("WarpScanner Link Updater: Debounce timer set.");
    }


    // --- Initialization and Hook into MkDocs Material Theme ---
    function initializeUpdater() {
        console.log("WarpScanner Link Updater: Initializing...");
        let subscribed = false;

        // Try subscribing to Material theme's document observable
        if (typeof app !== 'undefined' && app.document$?.subscribe) {
             console.log("WarpScanner Link Updater: Subscribing to app.document$");
             app.document$.subscribe(() => {
                console.log("WarpScanner Link Updater: app.document$ event triggered.");
                debouncedUpdateLinks(); // Call debounced function on navigation
            });
            subscribed = true;
        } else if (window.material?.document$?.subscribe) { // Fallback check
             console.log("WarpScanner Link Updater: Subscribing to window.material.document$");
             window.material.document$.subscribe(() => {
                 console.log("WarpScanner Link Updater: window.material.document$ event triggered.");
                 debouncedUpdateLinks(); // Call debounced function on navigation
             });
             subscribed = true;
        }

        // If subscription failed, log it. Initial run still happens below.
        if (!subscribed) {
             console.log("WarpScanner Link Updater: Material theme hook not found. Relying on initial run only.");
        }

        // Perform the initial run regardless of subscription status
        console.log("WarpScanner Link Updater: Scheduling initial update check.");
        debouncedUpdateLinks();
    }

    // --- Start the process ---
    // Wait for the DOM to be ready before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeUpdater);
    } else {
        // DOMContentLoaded has already fired
        initializeUpdater();
    }

})(); // Immediately invoke the wrapper function
