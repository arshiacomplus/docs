// docs/js/update-release-links.js
(function() {
    console.log("[Updater] Script loaded (this should appear once per full page load).");
    // ... (بقیه ثابت‌ها و توابع کمکی مثل قبل) ...
    const GITHUB_API_BASE = 'https://api.github.com/repos/';
    const MAIN_REPO = 'arshiacomplus/WarpScanner';
    const ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI';
    const LINUX_FALLBACK_VERSION = 'v0.4.1';
    const LINUX_FALLBACK_FILENAME = `WarpScanner-${LINUX_FALLBACK_VERSION}-linux-64bit.tar.gz`;
    const LINUX_FALLBACK_URL = `https://github.com/arshiacomplus/WarpScanner/releases/download/${LINUX_FALLBACK_VERSION}/${LINUX_FALLBACK_FILENAME}`;

    function updateElement(id, text, href = null) { /* ... کد تابع مثل قبل ... */
        const element = document.getElementById(id);
        if (!element) { return; }
        try {
            if (text !== null) element.textContent = text;
            if (element.tagName === 'A' && href !== null) {
                element.href = href;
                if (text === null && href !== '#') {
                    try { const url = new URL(href); element.textContent = decodeURIComponent(url.pathname.split('/').pop()) || "Download"; } catch (e) { element.textContent = "Download"; }
                } else if (text === null && href === '#') { element.textContent = "یافت نشد"; }
                if (href.startsWith('http')) { element.target = '_blank'; element.rel = 'noopener noreferrer'; }
            }
        } catch (e) { console.error(`[Updater] Error updating element ${id}:`, e); }
    }
    function findAssetUrl(assets, filenamePart) { /* ... کد تابع مثل قبل ... */
        if (!assets || !Array.isArray(assets)) return null;
        let asset = assets.find(a => a.name === filenamePart);
        if (!asset) asset = assets.find(a => a.name.includes(filenamePart));
        return asset ? asset.browser_download_url : null;
    }
    async function fetchLatestRelease(repo) { /* ... کد تابع مثل قبل با fetch و error handling ... */
        console.log(`[Updater] Fetching latest release for ${repo}`);
        const timestamp = Date.now();
        try {
            const response = await fetch(`${GITHUB_API_BASE}${repo}/releases/latest?t=${timestamp}`, { cache: "no-store" });
            if (!response.ok) {
                let errorMsg = `API Error (${response.status})`;
                if (response.status === 403) errorMsg = `Rate limit exceeded`;
                if (response.status === 404) errorMsg = `Repo/Release not found`;
                const error = new Error(errorMsg); error.status = response.status; throw error;
            }
            const data = await response.json();
            console.log(`[Updater] Success fetch ${repo}: ${data.tag_name}`);
            return data;
        } catch (error) { console.error(`[Updater] Fetch failed for ${repo}:`, error); throw error; }
     }
    function resetElementsToLoading() { /* ... کد تابع مثل قبل ... */
        console.log("[Updater] Resetting elements to loading state.");
        updateElement('main-latest-version-info', 'در حال دریافت نسخه اصلی...');
        updateElement('main-latest-version-warn', '...');
        updateElement('win7-portable-link', 'در حال بارگذاری لینک...', '#'); updateElement('win7-portable-version', '...');
        updateElement('win8-upper-portable-link', 'در حال بارگذاری لینک...', '#'); updateElement('win8-upper-portable-version', '...');
        updateElement('win7-setup-link', 'در حال بارگذاری لینک...', '#'); updateElement('win7-setup-version', '...');
        updateElement('win8-upper-setup-link', 'در حال بارگذاری لینک...', '#'); updateElement('win8-upper-setup-version', '...');
        updateElement('linux-64bit-link', 'در حال بارگذاری لینک...', '#'); updateElement('linux-64bit-version', '...'); updateElement('linux-latest-version-note', '...');
        updateElement('android-latest-version-info', '...'); updateElement('android-latest-version-page', 'در حال دریافت نسخه اندروید...');
        updateElement('android-apk-link', 'در حال بارگذاری لینک...', '#'); updateElement('android-apk-version', '...');
    }
    async function runUpdateProcess() { /* ... کد اصلی پردازش و آپدیت DOM مثل قبل ... */
        console.log("[Updater] Starting runUpdateProcess...");
        const mainInfoElem = document.getElementById('main-latest-version-info');
        const androidInfoElem = document.getElementById('android-latest-version-info');
        if (!mainInfoElem && !androidInfoElem) { console.log("[Updater] Target elements not found. Exiting runUpdateProcess."); return; }
        resetElementsToLoading();
        const promisesToFetch = [];
        if (mainInfoElem) promisesToFetch.push(fetchLatestRelease(MAIN_REPO)); else promisesToFetch.push(Promise.resolve(null));
        if (androidInfoElem) promisesToFetch.push(fetchLatestRelease(ANDROID_REPO)); else promisesToFetch.push(Promise.resolve(null));
        const results = await Promise.allSettled(promisesToFetch);
        const mainResult = results[0]; const androidResult = results[1];
        // Process Main Repo Result
        if (mainInfoElem) {
            if (mainResult.status === 'fulfilled' && mainResult.value) {
                 const release = mainResult.value; const latestVersion = release.tag_name; const assets = release.assets; console.log(`[Updater] Processing Main Repo Success: ${latestVersion}`);
                 updateElement('main-latest-version-info', `آخرین نسخه اصلی: ${latestVersion}`); updateElement('main-latest-version-warn', latestVersion);
                 const win7PortablePart = 'win7-Portable.rar'; /*...*/ const win8PortablePart = 'win8-upper-Portable.rar'; const win7SetupPart = 'win7-Setup.exe'; const win8SetupPart = 'win8-upper-Setup.exe'; const linuxPart = 'linux-64bit.tar.gz';
                 const win7PortableUrl = findAssetUrl(assets, win7PortablePart); const win8PortableUrl = findAssetUrl(assets, win8PortablePart); const win7SetupUrl = findAssetUrl(assets, win7SetupPart); const win8SetupUrl = findAssetUrl(assets, win8SetupPart); const linuxUrl = findAssetUrl(assets, linuxPart);
                 updateElement('win7-portable-link', null, win7PortableUrl || '#'); updateElement('win7-portable-version', win7PortableUrl ? latestVersion : 'یافت نشد');
                 updateElement('win8-upper-portable-link', null, win8PortableUrl || '#'); updateElement('win8-upper-portable-version', win8PortableUrl ? latestVersion : 'یافت نشد');
                 updateElement('win7-setup-link', null, win7SetupUrl || '#'); updateElement('win7-setup-version', win7SetupUrl ? latestVersion : 'یافت نشد');
                 updateElement('win8-upper-setup-link', null, win8SetupUrl || '#'); updateElement('win8-upper-setup-version', win8SetupUrl ? latestVersion : 'یافت نشد');
                 if (linuxUrl) { updateElement('linux-64bit-link', null, linuxUrl); updateElement('linux-64bit-version', latestVersion); updateElement('linux-latest-version-note', `(فایل از آخرین نسخه ${latestVersion})`);
                 } else { updateElement('linux-64bit-link', LINUX_FALLBACK_FILENAME, LINUX_FALLBACK_URL); updateElement('linux-64bit-version', LINUX_FALLBACK_VERSION); updateElement('linux-latest-version-note', `(نسخه ${latestVersion} فاقد لینوکس بود، از ${LINUX_FALLBACK_VERSION} استفاده شد)`); }
            } else { const errorMsg = mainResult.reason?.message || 'خطای دریافت'; console.error('[Updater] Error processing main repo:', mainResult.reason); updateElement('main-latest-version-info', `خطا (${errorMsg})`); /*...*/ }
        }
        // Process Android Repo Result
        if (androidInfoElem) {
            if (androidResult.status === 'fulfilled' && androidResult.value) {
                 const release = androidResult.value; const latestVersion = release.tag_name; const assets = release.assets; console.log(`[Updater] Processing Android Repo Success: ${latestVersion}`);
                 updateElement('android-latest-version-info', latestVersion); updateElement('android-latest-version-page', `آخرین نسخه اندروید: ${latestVersion}`);
                 const apkAsset = assets ? assets.find(a => a.name && a.name.endsWith('.apk')) : null; const apkUrl = apkAsset ? apkAsset.browser_download_url : null;
                 updateElement('android-apk-link', null, apkUrl || '#'); updateElement('android-apk-version', apkUrl ? latestVersion : 'یافت نشد');
            } else { const errorMsg = androidResult.reason?.message || 'خطای دریافت'; console.error('[Updater] Error processing android repo:', androidResult.reason); updateElement('android-latest-version-info', 'خطا'); updateElement('android-latest-version-page', `خطا (${errorMsg})`); updateElement('android-apk-link', 'خطا', '#'); updateElement('android-apk-version', '!'); }
        }
        console.log("[Updater] runUpdateProcess finished.");
    }

    // --- Function triggered on page load/navigation ---
    function handlePageLoadTrigger() {
         // ** این تابع فقط مسئول زمان‌بندی اجرای اصلی است **
         console.log("[Updater] Page load/navigation detected. Scheduling update check...");
         // ** استفاده از setTimeout برای دادن فرصت به DOM **
         setTimeout(() => {
             console.log("[Updater] Timeout finished. Now executing runUpdateProcess.");
             // اجرای تابع اصلی که بررسی عنصر و آپدیت را انجام می‌دهد
             runUpdateProcess().catch(err => {
                 console.error("[Updater] Unexpected error during runUpdateProcess execution:", err);
             });
         }, 300); // زمان تاخیر (می‌توانید تغییر دهید)
     }

    // --- Hook into MkDocs Material Theme ---
    function initializeUpdater() {
        console.log("[Updater] Initializing hooks (this should appear once per full page load).");
        let isSubscribed = false;

        // Function to setup subscription
        const setupSubscription = (observable$) => {
            console.log("[Updater] Setting up subscription.");
            observable$.subscribe(() => {
                console.log("[Updater] Material theme navigation event received.");
                handlePageLoadTrigger(); // Call the handler function
            });
            isSubscribed = true;
            console.log("[Updater] Successfully subscribed to Material theme updates.");
        };

        // Try to subscribe
        try {
            if (typeof app !== 'undefined' && app.document$?.subscribe) {
                 setupSubscription(app.document$);
            } else if (window.material?.document$?.subscribe) {
                 // Fallback for older versions or different structures
                 setupSubscription(window.material.document$);
            } else {
                 console.log("[Updater] Material theme observable (document$) not found.");
            }
        } catch (err) {
             console.error("[Updater] Error during subscription setup:", err);
        }


        // ** مهم: اجرای اولیه **
        // چه هوک پیدا شده باشد چه نه، یک بار باید اجرا شود.
        // اگر هوک پیدا شده، این اجرا ممکن است کمی بعد از اولین رویداد هوک باشد،
        // اما تضمین می‌کند که در بارگذاری اولیه حتما اجرا می‌شود.
        console.log("[Updater] Scheduling the *initial* page update check.");
        // اجرای اولیه هم با همان مکانیزم تاخیر انجام می‌شود
        handlePageLoadTrigger();

    }

    // Start the initialization process carefully
    if (document.readyState === 'loading') {
        // Wait for the initial DOM to be ready
        document.addEventListener('DOMContentLoaded', initializeUpdater);
    } else {
        // DOM is already ready, initialize now
        initializeUpdater();
    }

})();
