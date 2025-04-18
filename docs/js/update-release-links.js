// docs/js/update-release-links.js

// Wrap everything in a function to avoid polluting global scope immediately
(function() {
    console.log("WarpScanner Link Updater: Script loaded.");
    const GITHUB_API_BASE = 'https://api.github.com/repos/';
    const MAIN_REPO = 'arshiacomplus/WarpScanner';
    const ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI';

    // --- Fallback Configuration for Linux ---
    const LINUX_FALLBACK_VERSION = 'v0.4.1';
    const LINUX_FALLBACK_FILENAME = `WarpScanner-${LINUX_FALLBACK_VERSION}-linux-64bit.tar.gz`;
    const LINUX_FALLBACK_URL = `https://github.com/arshiacomplus/WarpScanner/releases/download/${LINUX_FALLBACK_VERSION}/${LINUX_FALLBACK_FILENAME}`;

    // Flag to prevent multiple simultaneous runs triggered close together
    let isRunning = false;
    let runTimeout = null;

    // --- Helper Function to Update Element ---
    function updateElement(id, text, href = null) {
        const element = document.getElementById(id);
        if (element) {
            if (text !== null) {
                element.textContent = text;
            }
            if (element.tagName === 'A' && href !== null) {
                element.href = href;
                if (text === null && href !== '#') {
                    try {
                        const url = new URL(href);
                        // Ensure the filename is decoded if it contains URL-encoded chars
                        element.textContent = decodeURIComponent(url.pathname.split('/').pop()) || "Download Link";
                    } catch (e) {
                        element.textContent = "Download Link";
                    }
                } else if (text === null && href === '#') {
                     // Reset text if link becomes invalid/not found and no specific text provided
                     if (!element.dataset.originalText) { // Store original text if needed
                        element.dataset.originalText = element.textContent;
                     }
                     element.textContent = "لینک یافت نشد";

                } else if (text !== null && href !== '#') {
                     // If text is explicitly provided, use it (like for fallback filename)
                     element.textContent = text;
                }
            }
             else if (href === null && text === null && element.textContent.includes("...")) {
                 // If no update provided and still on placeholder, show generic error
                 element.textContent = element.textContent.replace(/.*?/g, "خطا/یافت نشد");
             }

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
        try {
            const timestamp = Date.now();
            const response = await fetch(`${GITHUB_API_BASE}${repo}/releases/latest?t=${timestamp}`, { cache: "no-store" }); // Explicitly disable cache
            if (!response.ok) {
                let errorMsg = `API Error (${response.status})`;
                if (response.status === 403) errorMsg = `Rate limit exceeded (${response.status})`;
                if (response.status === 404) errorMsg = `Not Found (${response.status})`;
                console.error(`GitHub API error for ${repo}: ${response.status} ${response.statusText}`);
                throw new Error(errorMsg);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch latest release for ${repo}:`, error);
            // Propagate the error message for specific handling later
            throw error; // Re-throw the error after logging
        }
    }

    // --- Main Update Logic ---
    async function updateLinks() {

         // Check if the necessary elements exist on the *current* page
         const mainInfoElem = document.getElementById('main-latest-version-info');
         const androidInfoElem = document.getElementById('android-latest-version-info');

         // If neither set of target elements exist, do nothing
         if (!mainInfoElem && !androidInfoElem) {
             console.log("WarpScanner Link Updater: Target elements not found on this page. Skipping update.");
             return;
         }

         console.log("WarpScanner Link Updater: Target elements found. Starting update process...");

         // Reset status to 'loading' before fetching, but only for visible elements
         // This handles the case where the user navigates back *while* it was loading before
         if (mainInfoElem) {
              updateElement('main-latest-version-info', 'در حال دریافت آخرین نسخه اصلی...');
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
         }
         if (androidInfoElem) {
             updateElement('android-latest-version-info', '...');
             updateElement('android-latest-version-page', 'در حال دریافت آخرین نسخه اندروید...');
             updateElement('android-apk-link', 'در حال بارگذاری لینک...', '#');
             updateElement('android-apk-version', '...');
         }


        // Fetch data in parallel
        const results = await Promise.allSettled([
            mainInfoElem ? fetchLatestRelease(MAIN_REPO) : Promise.resolve(null), // Only fetch if elements exist
            androidInfoElem ? fetchLatestRelease(ANDROID_REPO) : Promise.resolve(null) // Only fetch if elements exist
        ]);

        const mainResult = results[0];
        const androidResult = results[1];

        // --- Process Main Repo Result ---
        if (mainInfoElem) { // Check again, just in case DOM changed unexpectedly
            if (mainResult.status === 'fulfilled' && mainResult.value) {
                const release = mainResult.value;
                const latestVersion = release.tag_name;
                const assets = release.assets;
                console.log(`Main Repo Latest: ${latestVersion}`);

                updateElement('main-latest-version-info', `آخرین نسخه اصلی: ${latestVersion}`);
                updateElement('main-latest-version-warn', latestVersion);
                updateElement('linux-latest-version-note', `(آخرین نسخه اصلی: ${latestVersion})`);

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
                    console.log(`Linux asset found in latest release (${latestVersion}): ${linuxUrl}`);
                    updateElement('linux-64bit-link', null, linuxUrl);
                    updateElement('linux-64bit-version', latestVersion);
                    updateElement('linux-latest-version-note', `(فایل از آخرین نسخه ${latestVersion})`);
                } else {
                    console.log(`Linux asset not found in latest release (${latestVersion}). Falling back to ${LINUX_FALLBACK_VERSION}.`);
                    updateElement('linux-64bit-link', LINUX_FALLBACK_FILENAME, LINUX_FALLBACK_URL);
                    updateElement('linux-64bit-version', LINUX_FALLBACK_VERSION);
                    updateElement('linux-latest-version-note', `(نسخه ${latestVersion} فاقد فایل لینوکس بود، از ${LINUX_FALLBACK_VERSION} استفاده شد)`);
                }
            } else {
                // Handle fetch error for main repo
                const errorMsg = mainResult.reason?.message || 'خطای نامشخص';
                console.error('Error updating main repo:', mainResult.reason);
                updateElement('main-latest-version-info', `خطا (${errorMsg})`);
                updateElement('win7-portable-link', 'خطا', '#'); updateElement('win7-portable-version', '!');
                updateElement('win8-upper-portable-link', 'خطا', '#'); updateElement('win8-upper-portable-version', '!');
                updateElement('win7-setup-link', 'خطا', '#'); updateElement('win7-setup-version', '!');
                updateElement('win8-upper-setup-link', 'خطا', '#'); updateElement('win8-upper-setup-version', '!');
                updateElement('linux-64bit-link', 'خطا', '#'); updateElement('linux-64bit-version', '!');
                updateElement('linux-latest-version-note', `(خطا در بررسی: ${errorMsg})`);
            }
        }

        // --- Process Android Repo Result ---
         if (androidInfoElem) { // Check again
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

    // Debounced version of updateLinks to prevent rapid firing during navigation
    function debouncedUpdateLinks() {
        if (isRunning) {
            console.log("WarpScanner Link Updater: Update already in progress. Debouncing.");
            // Clear existing timeout if called again quickly
            if (runTimeout) clearTimeout(runTimeout);
        }
        isRunning = true;
         // Set a short timeout to allow DOM updates to settle
        runTimeout = setTimeout(async () => {
            try {
                 await updateLinks();
            } finally {
                 isRunning = false; // Reset flag when finished or on error
                 runTimeout = null;
            }
        }, 100); // 100ms delay
    }


    // --- Hook into MkDocs Material Theme ---
    // Check if the Material theme's JS object is available
    if (typeof app !== 'undefined' && app.document$?.subscribe) {
         console.log("WarpScanner Link Updater: Subscribing to app.document$");
         app.document$.subscribe(() => {
            console.log("WarpScanner Link Updater: app.document$ event triggered.");
            debouncedUpdateLinks();
        });
    } else if (window.material?.document$?.subscribe) {
        // Fallback for older versions or different theme structure
         console.log("WarpScanner Link Updater: Subscribing to window.material.document$");
         window.material.document$.subscribe(() => {
             console.log("WarpScanner Link Updater: window.material.document$ event triggered.");
             debouncedUpdateLinks();
         });
    } else {
        // Standard fallback if Material theme hooks aren't found
        console.log("WarpScanner Link Updater: Material theme hook not found. Using DOMContentLoaded fallback.");
        // Ensure it runs on initial load too, even if hooks are present
        document.addEventListener('DOMContentLoaded', debouncedUpdateLinks);
    }

})(); // Immediately invoke the wrapper function
