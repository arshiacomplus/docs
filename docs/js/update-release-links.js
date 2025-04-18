// docs/js/update-release-links.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("WarpScanner Link Updater: Script started.");
    const GITHUB_API_BASE = 'https://api.github.com/repos/';
    const MAIN_REPO = 'arshiacomplus/WarpScanner';
    const ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI';

    // --- Helper Function to Update Element ---
    // Updates text content and optionally the href attribute if it's an anchor tag.
    function updateElement(id, text, href = null) {
        const element = document.getElementById(id);
        if (element) {
            // Always update text content if provided
            if (text !== null) {
                element.textContent = text;
            }

            // If it's an anchor tag and href is provided, update it
            if (element.tagName === 'A' && href !== null) {
                element.href = href;
                // If text was not explicitly provided for the link, use the filename from href
                if (text === null && href !== '#') {
                    try {
                        const url = new URL(href);
                        element.textContent = url.pathname.split('/').pop() || "Download Link"; // Fallback text
                    } catch (e) {
                        element.textContent = "Download Link"; // Fallback for invalid URL
                    }
                } else if (text === null && href === '#') {
                    // If href is '#' (error or not found) and no text, keep existing or set default
                    if (!element.textContent) {
                         element.textContent = "لینک یافت نشد";
                    }
                }
            }
             // If it's not an anchor but href was passed (e.g., updating a span based on a URL existence)
             else if (href === null && text === null) {
                 // Maybe set a default error text if nothing else worked
                 element.textContent = element.textContent || "خطا/یافت نشد";
             }

        } else {
            // Don't log errors for potentially optional elements, or log selectively
            // console.warn(`Element with ID "${id}" not found.`);
        }
    }

    // --- Helper Function to Find Asset URL by Filename Part ---
    function findAssetUrl(assets, filenamePart) {
        if (!assets || !Array.isArray(assets)) return null;
        // Prioritize exact match if possible, then partial match
        let asset = assets.find(a => a.name === filenamePart);
        if (!asset) {
             asset = assets.find(a => a.name.includes(filenamePart));
        }
        return asset ? asset.browser_download_url : null;
    }

     // --- Fetch Latest Release Data ---
     async function fetchLatestRelease(repo) {
        try {
            const response = await fetch(`${GITHUB_API_BASE}${repo}/releases/latest`);
            if (!response.ok) {
                // Handle rate limiting specifically if possible
                if (response.status === 403) {
                     console.error(`GitHub API rate limit likely exceeded for ${repo}. Status: ${response.status}`);
                     throw new Error(`Rate limit exceeded (${response.status})`);
                }
                console.error(`GitHub API error for ${repo}: ${response.status} ${response.statusText}`);
                throw new Error(`API Error (${response.status})`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch latest release for ${repo}:`, error);
            return null; // Return null to indicate failure
        }
    }


    // --- Update Main WarpScanner Repo Elements ---
    async function updateMainRepo() {
        const release = await fetchLatestRelease(MAIN_REPO);
        if (!release) {
            // Update relevant elements to show fetch error
            updateElement('main-latest-version-info', 'خطا در دریافت نسخه اصلی');
            // ... update other main repo elements with error messages ...
            updateElement('win7-portable-link', 'خطا در دریافت', '#');
            updateElement('win8-upper-portable-link', 'خطا در دریافت', '#');
            updateElement('win7-setup-link', 'خطا در دریافت', '#');
            updateElement('win8-upper-setup-link', 'خطا در دریافت', '#');
            updateElement('linux-64bit-link', 'خطا در دریافت', '#');
            return; // Stop processing for this repo
        }

        const latestVersion = release.tag_name;
        const assets = release.assets;
        console.log(`Main Repo Latest: ${latestVersion}`);

        // Update general version info spans
        updateElement('main-latest-version-info', `آخرین نسخه اصلی: ${latestVersion}`);
        updateElement('main-latest-version-warn', latestVersion);
        updateElement('linux-latest-version-note', `(مربوط به ${latestVersion} در صورت وجود)`); // Clarify Linux note

        // Define expected filename parts (adjust if naming changes)
        const win7PortablePart = 'win7-Portable.rar';
        const win8PortablePart = 'win8-upper-Portable.rar';
        const win7SetupPart = 'win7-Setup.exe';
        const win8SetupPart = 'win8-upper-Setup.exe';
        const linuxPart = 'linux-64bit.tar.gz'; // Be specific if possible

        // Find asset URLs
        const win7PortableUrl = findAssetUrl(assets, win7PortablePart);
        const win8PortableUrl = findAssetUrl(assets, win8PortablePart);
        const win7SetupUrl = findAssetUrl(assets, win7SetupPart);
        const win8SetupUrl = findAssetUrl(assets, win8SetupPart);
        const linuxUrl = findAssetUrl(assets, linuxPart);

        // Update Windows Links and Version Texts
        updateElement('win7-portable-link', null, win7PortableUrl || '#'); // Let helper set filename as text
        updateElement('win7-portable-version', win7PortableUrl ? latestVersion : 'یافت نشد');

        updateElement('win8-upper-portable-link', null, win8PortableUrl || '#');
        updateElement('win8-upper-portable-version', win8PortableUrl ? latestVersion : 'یافت نشد');

        updateElement('win7-setup-link', null, win7SetupUrl || '#');
        updateElement('win7-setup-version', win7SetupUrl ? latestVersion : 'یافت نشد');

        updateElement('win8-upper-setup-link', null, win8SetupUrl || '#');
        updateElement('win8-upper-setup-version', win8SetupUrl ? latestVersion : 'یافت نشد');

        // Update Linux Link and Version Text
        updateElement('linux-64bit-link', null, linuxUrl || '#');
        updateElement('linux-64bit-version', linuxUrl ? latestVersion : 'در آخرین نسخه یافت نشد');
         console.log(`Linux asset URL for ${linuxPart}: ${linuxUrl}`);
    }

    // --- Update Android Repo Elements ---
    async function updateAndroidRepo() {
        const release = await fetchLatestRelease(ANDROID_REPO);
        if (!release) {
            updateElement('android-latest-version-info', 'خطا در دریافت نسخه اندروید');
            updateElement('android-latest-version-page', 'خطا در دریافت نسخه اندروید');
            updateElement('android-apk-link', 'خطا در دریافت', '#');
            return; // Stop processing
        }

        const latestVersion = release.tag_name;
        const assets = release.assets;
        console.log(`Android Repo Latest: ${latestVersion}`);

        // Update general version info spans
        updateElement('android-latest-version-info', latestVersion);
        updateElement('android-latest-version-page', `آخرین نسخه اندروید: ${latestVersion}`);

        // Find asset URL (usually ends with .apk)
        const apkAsset = assets ? assets.find(a => a.name && a.name.endsWith('.apk')) : null;
        const apkUrl = apkAsset ? apkAsset.browser_download_url : null;

        // Update Android Link and Version Text
        updateElement('android-apk-link', null, apkUrl || '#'); // Let helper set filename as text
        updateElement('android-apk-version', apkUrl ? latestVersion : 'یافت نشد');
         console.log(`Android asset URL: ${apkUrl}`);
    }

    // --- Run the update functions ---
    // Run them sequentially or in parallel, depending on preference.
    // Running in parallel might be slightly faster but harder to debug logs.
    // await Promise.all([updateMainRepo(), updateAndroidRepo()]); // Parallel
    updateMainRepo(); // Sequential
    updateAndroidRepo(); // Sequential

    console.log("WarpScanner Link Updater: Script finished.");
});
