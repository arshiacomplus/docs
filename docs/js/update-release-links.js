// docs/js/update-release-links.js

// Wrap everything in a function to avoid polluting global scope immediately
(function() {
    console.log("[Updater] Script loaded.");
    const GITHUB_API_BASE = 'https://api.github.com/repos/';
    const MAIN_REPO = 'arshiacomplus/WarpScanner';
    const ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI';

    // --- Fallback Configuration for Linux ---
    const LINUX_FALLBACK_VERSION = 'v0.4.1';
    const LINUX_FALLBACK_FILENAME = `WarpScanner-${LINUX_FALLBACK_VERSION}-linux-64bit.tar.gz`;
    const LINUX_FALLBACK_URL = `https://github.com/arshiacomplus/WarpScanner/releases/download/${LINUX_FALLBACK_VERSION}/${LINUX_FALLBACK_FILENAME}`;

    // --- Helper Function to Update Element ---
    function updateElement(id, text, href = null) {
        const element = document.getElementById(id);
        // *** مهم: بررسی وجود عنصر قبل از هر کاری ***
        if (!element) {
            // Log only if needed, can be noisy: console.log(`[Updater] Element not found, skipping update: ${id}`);
            return; // Exit if element doesn't exist
        }

        try {
            if (text !== null) {
                element.textContent = text;
            }
            if (element.tagName === 'A' && href !== null) {
                element.href = href;
                if (text === null && href !== '#') {
                    // Auto-set text from filename
                     try {
                         const url = new URL(href);
                         element.textContent = decodeURIComponent(url.pathname.split('/').pop()) || "Download";
                    } catch (e) { element.textContent = "Download"; }
                } else if (text === null && href === '#') {
                    // Handle 'not found' case for links
                    element.textContent = "یافت نشد";
                }
                 // Ensure link opens in new tab for external GitHub links
                 if (href.startsWith('http')) {
                     element.target = '_blank';
                     element.rel = 'noopener noreferrer';
                 }
            }
        } catch (e) {
            console.error(`[Updater] Error updating element ${id}:`, e);
        }
    }

    // --- Helper Function to Find Asset URL by Filename Part ---
    function findAssetUrl(assets, filenamePart) {
        if (!assets || !Array.isArray(assets)) return null;
        let asset = assets.find(a => a.name === filenamePart);
        if (!asset) {
             asset = assets.find(a => a.name.includes(filenamePart));
        }
        return asset ? asset.browser_download_url : null;
    }

     // --- Fetch Latest Release Data ---
     async function fetchLatestRelease(repo) {
         console.log(`[Updater] Fetching latest release for ${repo}`);
         const timestamp = Date.now();
         try {
             const response = await fetch(`${GITHUB_API_BASE}${repo}/releases/latest?t=${timestamp}`, { cache: "no-store" });
             if (!response.ok) {
                 let errorMsg = `API Error (${response.status})`;
                 if (response.status === 403) errorMsg = `Rate limit exceeded`;
                 if (response.status === 404) errorMsg = `Repo/Release not found`;
                 console.error(`[Updater] GitHub API error for ${repo}: ${response.status} ${response.statusText}`);
                 // Throw an error object with a user-friendly message
                 const error = new Error(errorMsg);
                 error.status = response.status;
                 throw error;
             }
             const data = await response.json();
             console.log(`[Updater] Successfully fetched release for ${repo}: ${data.tag_name}`);
             return data;
         } catch (error) {
             console.error(`[Updater] Failed to fetch or parse release for ${repo}:`, error);
             // Re-throw the error so Promise.allSettled catches it with the message
             throw error;
         }
     }

    // --- Reset Elements to Loading State ---
    function resetElementsToLoading() {
        console.log("[Updater] Resetting elements to loading state.");
        // Reset Main Repo Elements
        updateElement('main-latest-version-info', 'در حال دریافت نسخه اصلی...');
        updateElement('main-latest-version-warn', '...');
        updateElement('win7-portable-link', 'در حال بارگذاری لینک...', '#');
        updateElement('win7-portable-version', '...');
        updateElement('win8-upper-portable-link', 'در حال بارگذاری لینک...', '#');
        updateElement('win8-upper-portable-version', '...');
        updateElement('win7-setup-link', 'در حال بارگذاری لینک...', '#');
        updateElement('win7-setup-version', '...');
        updateElement('win8-upper-setup-link', 'در حال بارگذاری لینک...', '#');
        updateElement('win8-upper-setup-version', '...');
        updateElement('linux-64bit-link', 'در حال بارگذاری لینک...', '#');
        updateElement('linux-64bit-version', '...');
        updateElement('linux-latest-version-note', '...');
        // Reset Android Repo Elements
        updateElement('android-latest-version-info', '...');
        updateElement('android-latest-version-page', 'در حال دریافت نسخه اندروید...');
        updateElement('android-apk-link', 'در حال بارگذاری لینک...', '#');
        updateElement('android-apk-version', '...');
    }

    // --- Main Update Logic ---
    async function runUpdateProcess() {
        console.log("[Updater] Starting update process...");

        // **Step 1: Check if target elements exist on this page**
        const mainInfoElem = document.getElementById('main-latest-version-info');
        const androidInfoElem = document.getElementById('android-latest-version-info');

        if (!mainInfoElem && !androidInfoElem) {
            console.log("[Updater] Target elements not found on this page. Skipping.");
            return;
        }

        // **Step 2: Reset elements to loading state**
        resetElementsToLoading();

        // **Step 3: Fetch data (conditionally)**
        const promisesToFetch = [];
        if (mainInfoElem) {
            promisesToFetch.push(fetchLatestRelease(MAIN_REPO));
        } else {
            promisesToFetch.push(Promise.resolve(null)); // Placeholder if main elements aren't present
        }
        if (androidInfoElem) {
            promisesToFetch.push(fetchLatestRelease(ANDROID_REPO));
        } else {
            promisesToFetch.push(Promise.resolve(null)); // Placeholder if android elements aren't present
        }

        const results = await Promise.allSettled(promisesToFetch);
        const mainResult = results[0];
        const androidResult = results[1];

        // **Step 4: Process Main Repo Result**
        if (mainInfoElem) { // Check element existence again before updating
            if (mainResult.status === 'fulfilled' && mainResult.value) {
                const release = mainResult.value;
                const latestVersion = release.tag_name;
                const assets = release.assets;
                console.log(`[Updater] Processing Main Repo: ${latestVersion}`);

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

                updateElement('win7-portable-link', null, win7PortableUrl || '#');
                updateElement('win7-portable-version', win7PortableUrl ? latestVersion : 'یافت نشد');
                updateElement('win8-upper-portable-link', null, win8PortableUrl || '#');
                updateElement('win8-upper-portable-version', win8PortableUrl ? latestVersion : 'یافت نشد');
                updateElement('win7-setup-link', null, win7SetupUrl || '#');
                updateElement('win7-setup-version', win7SetupUrl ? latestVersion : 'یافت نشد');
                updateElement('win8-upper-setup-link', null, win8SetupUrl || '#');
                updateElement('win8-upper-setup-version', win8SetupUrl ? latestVersion : 'یافت نشد');

                // Linux Asset with Fallback
                const linuxPart = 'linux-64bit.tar.gz';
                const linuxUrl = findAssetUrl(assets, linuxPart);
                if (linuxUrl) {
                    updateElement('linux-64bit-link', null, linuxUrl);
                    updateElement('linux-64bit-version', latestVersion);
                    updateElement('linux-latest-version-note', `(فایل از آخرین نسخه ${latestVersion})`);
                } else {
                    updateElement('linux-64bit-link', LINUX_FALLBACK_FILENAME, LINUX_FALLBACK_URL);
                    updateElement('linux-64bit-version', LINUX_FALLBACK_VERSION);
                    updateElement('linux-latest-version-note', `(نسخه ${latestVersion} فاقد لینوکس بود، از ${LINUX_FALLBACK_VERSION} استفاده شد)`);
                }
            } else {
                // Handle fetch error for main repo
                const errorMsg = mainResult.reason?.message || 'خطای دریافت';
                console.error('[Updater] Error processing main repo:', mainResult.reason);
                updateElement('main-latest-version-info', `خطا (${errorMsg})`);
                // Update other elements to show error state
                 updateElement('win7-portable-link', 'خطا', '#'); updateElement('win7-portable-version', '!');
                 updateElement('win8-upper-portable-link', 'خطا', '#'); updateElement('win8-upper-portable-version', '!');
                 updateElement('win7-setup-link', 'خطا', '#'); updateElement('win7-setup-version', '!');
                 updateElement('win8-upper-setup-link', 'خطا', '#'); updateElement('win8-upper-setup-version', '!');
                 updateElement('linux-64bit-link', 'خطا', '#'); updateElement('linux-64bit-version', '!');
                 updateElement('linux-latest-version-note', `(خطا: ${errorMsg})`);
            }
        }

        // **Step 5: Process Android Repo Result**
         if (androidInfoElem) { // Check element existence again
            if (androidResult.status === 'fulfilled' && androidResult.value) {
                const release = androidResult.value;
                const latestVersion = release.tag_name;
                const assets = release.assets;
                console.log(`[Updater] Processing Android Repo: ${latestVersion}`);

                updateElement('android-latest-version-info', latestVersion);
                updateElement('android-latest-version-page', `آخرین نسخه اندروید: ${latestVersion}`);

                const apkAsset = assets ? assets.find(a => a.name && a.name.endsWith('.apk')) : null;
                const apkUrl = apkAsset ? apkAsset.browser_download_url : null;

                updateElement('android-apk-link', null, apkUrl || '#');
                updateElement('android-apk-version', apkUrl ? latestVersion : 'یافت نشد');
            } else {
                // Handle fetch error for android repo
                const errorMsg = androidResult.reason?.message || 'خطای دریافت';
                console.error('[Updater] Error processing android repo:', androidResult.reason);
                updateElement('android-latest-version-info', 'خطا');
                updateElement('android-latest-version-page', `خطا (${errorMsg})`);
                updateElement('android-apk-link', 'خطا', '#');
                updateElement('android-apk-version', '!');
            }
        }
        console.log("[Updater] Update process finished.");
    }


    // --- Function to be called on page load/navigation ---
    function handlePageLoad() {
         // *** افزودن تاخیر قبل از اجرا ***
         console.log("[Updater] Page load/navigation detected. Scheduling update...");
         setTimeout(() => {
             console.log("[Updater] Timeout finished. Running update process.");
             runUpdateProcess().catch(err => {
                 // Catch any unexpected error from runUpdateProcess itself
                 console.error("[Updater] Unexpected error during runUpdateProcess:", err);
             });
         }, 300); // افزایش تاخیر به 300 میلی‌ثانیه - با این عدد بازی کنید
     }

    // --- Hook into MkDocs Material Theme ---
    function initializeUpdater() {
        console.log("[Updater] Initializing hooks.");
        let subscribed = false;
        if (typeof app !== 'undefined' && app.document$?.subscribe) {
             console.log("[Updater] Subscribing to app.document$");
             app.document$.subscribe(() => {
                 console.log("[Updater] app.document$ event received.");
                 handlePageLoad(); // Call the handler function
             });
             subscribed = true;
        } else if (window.material?.document$?.subscribe) {
             console.log("[Updater] Subscribing to window.material.document$");
             window.material.document$.subscribe(() => {
                 console.log("[Updater] window.material.document$ event received.");
                 handlePageLoad(); // Call the handler function
             });
             subscribed = true;
        }

        // Fallback / Initial Load: If hooks aren't available or for the very first load
        if (!subscribed) {
            console.log("[Updater] Material hooks not found or already loaded. Using DOMContentLoaded.");
             if (document.readyState === 'loading') {
                 document.addEventListener('DOMContentLoaded', handlePageLoad);
             } else {
                 // DOMContentLoaded has already fired, run directly
                 console.log("[Updater] DOM already loaded, running initial update.");
                 handlePageLoad();
             }
        } else {
            // If we subscribed, we might still need an initial run
            // if the script loaded *after* the initial document$ event fired.
             console.log("[Updater] Hooks subscribed. Running initial check/update.");
             handlePageLoad();
        }
    }

    // Start the initialization process
    initializeUpdater();

})(); // Immediately invoke the wrapper function
