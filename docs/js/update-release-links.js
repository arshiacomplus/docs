// docs/js/update-release-links.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("WarpScanner Link Updater: Script started.");
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
        if (element) {
            if (text !== null) {
                element.textContent = text;
            }
            if (element.tagName === 'A' && href !== null) {
                element.href = href;
                if (text === null && href !== '#') {
                    try {
                        const url = new URL(href);
                        element.textContent = url.pathname.split('/').pop() || "Download Link";
                    } catch (e) {
                        element.textContent = "Download Link";
                    }
                } else if (text === null && href === '#') {
                    if (!element.textContent) {
                         element.textContent = "لینک یافت نشد";
                    }
                }
            }
             else if (href === null && text === null) {
                 element.textContent = element.textContent || "خطا/یافت نشد";
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
            // Add cache-busting query parameter to try and avoid browser/network caching issues
            const timestamp = Date.now();
            const response = await fetch(`${GITHUB_API_BASE}${repo}/releases/latest?t=${timestamp}`);
            if (!response.ok) {
                if (response.status === 403) {
                     console.error(`GitHub API rate limit likely exceeded for ${repo}. Status: ${response.status}`);
                     throw new Error(`Rate limit exceeded (${response.status})`);
                } else if (response.status === 404) {
                     console.error(`Repository or latest release not found for ${repo}. Status: ${response.status}`);
                     throw new Error(`Not Found (${response.status})`);
                }
                console.error(`GitHub API error for ${repo}: ${response.status} ${response.statusText}`);
                throw new Error(`API Error (${response.status})`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Failed to fetch latest release for ${repo}:`, error);
            return null;
        }
    }


    // --- Update Main WarpScanner Repo Elements ---
    async function updateMainRepo() {
        const release = await fetchLatestRelease(MAIN_REPO);
        if (!release) {
            updateElement('main-latest-version-info', 'خطا در دریافت نسخه اصلی');
            updateElement('win7-portable-link', 'خطا در دریافت', '#');
            updateElement('win8-upper-portable-link', 'خطا در دریافت', '#');
            updateElement('win7-setup-link', 'خطا در دریافت', '#');
            updateElement('win8-upper-setup-link', 'خطا در دریافت', '#');
            // Handle Linux error case - maybe use fallback here too? Or show specific error?
            // For now, stick to the original error display for consistency if fetch fails.
            updateElement('linux-64bit-link', 'خطای دریافت', '#');
            updateElement('linux-64bit-version', '...');
            updateElement('linux-latest-version-note', '(خطا در بررسی آخرین نسخه)');
            return;
        }

        const latestVersion = release.tag_name;
        const assets = release.assets;
        console.log(`Main Repo Latest: ${latestVersion}`);

        updateElement('main-latest-version-info', `آخرین نسخه اصلی: ${latestVersion}`);
        updateElement('main-latest-version-warn', latestVersion);
        // Initial note update, might be overridden by Linux specific logic below
        updateElement('linux-latest-version-note', `(آخرین نسخه اصلی: ${latestVersion})`);

        // --- Windows Assets ---
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

        // --- Linux Asset ---
        const linuxPart = 'linux-64bit.tar.gz';
        const linuxUrl = findAssetUrl(assets, linuxPart); // Check in latest release assets

        if (linuxUrl) {
            // Linux asset FOUND in the latest release
            console.log(`Linux asset found in latest release (${latestVersion}): ${linuxUrl}`);
            updateElement('linux-64bit-link', null, linuxUrl); // Update link, text will be filename
            updateElement('linux-64bit-version', latestVersion); // Show latest version tag
            updateElement('linux-latest-version-note', `(فایل از آخرین نسخه ${latestVersion})`); // Update note accordingly
        } else {
            // Linux asset NOT FOUND in the latest release, use fallback
            console.log(`Linux asset not found in latest release (${latestVersion}). Falling back to ${LINUX_FALLBACK_VERSION}.`);
            updateElement('linux-64bit-link', LINUX_FALLBACK_FILENAME, LINUX_FALLBACK_URL); // Use fallback URL and specific filename text
            updateElement('linux-64bit-version', LINUX_FALLBACK_VERSION); // Show fallback version tag
            updateElement('linux-latest-version-note', `(آخرین نسخه ${latestVersion} فاقد فایل لینوکس بود، از نسخه ${LINUX_FALLBACK_VERSION} استفاده شد)`); // Update note for clarity
        }
    }

    // --- Update Android Repo Elements ---
    async function updateAndroidRepo() {
        const release = await fetchLatestRelease(ANDROID_REPO);
        if (!release) {
            updateElement('android-latest-version-info', 'خطا در دریافت نسخه اندروید');
            updateElement('android-latest-version-page', 'خطا در دریافت نسخه اندروید');
            updateElement('android-apk-link', 'خطا در دریافت', '#');
            updateElement('android-apk-version', '...');
            return;
        }

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
    }

    // --- Run the update functions ---
    updateMainRepo();
    updateAndroidRepo();

    console.log("WarpScanner Link Updater: Script finished.");
});
