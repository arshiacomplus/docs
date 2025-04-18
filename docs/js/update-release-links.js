// docs/js/update-release-links.js
(function() {
    console.log("[Updater] Script loaded.");
    const GITHUB_API_BASE = 'https://api.github.com/repos/';
    const MAIN_REPO = 'arshiacomplus/WarpScanner';
    const ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI';
    const LINUX_FALLBACK_VERSION = 'v0.4.1';
    const LINUX_FALLBACK_FILENAME = `WarpScanner-${LINUX_FALLBACK_VERSION}-linux-64bit.tar.gz`;
    const LINUX_FALLBACK_URL = `https://github.com/arshiacomplus/WarpScanner/releases/download/${LINUX_FALLBACK_VERSION}/${LINUX_FALLBACK_FILENAME}`;

    // --- توابع کمکی (بدون تغییر) ---
    function updateElement(id, text, href = null) { /* ... کد کامل تابع مثل نسخه قبل ... */
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
    function findAssetUrl(assets, filenamePart) { /* ... کد کامل تابع مثل نسخه قبل ... */
        if (!assets || !Array.isArray(assets)) return null;
        let asset = assets.find(a => a.name === filenamePart);
        if (!asset) asset = assets.find(a => a.name.includes(filenamePart));
        return asset ? asset.browser_download_url : null;
     }
    async function fetchLatestRelease(repo) { /* ... کد کامل تابع مثل نسخه قبل ... */
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
    function resetElementsToLoading() { /* ... کد کامل تابع مثل نسخه قبل ... */
        console.log("[Updater] Resetting elements to loading state.");
        updateElement('main-latest-version-info', 'در حال دریافت نسخه اصلی...'); updateElement('main-latest-version-warn', '...');
        updateElement('win7-portable-link', 'در حال بارگذاری لینک...', '#'); updateElement('win7-portable-version', '...');
        updateElement('win8-upper-portable-link', 'در حال بارگذاری لینک...', '#'); updateElement('win8-upper-portable-version', '...');
        updateElement('win7-setup-link', 'در حال بارگذاری لینک...', '#'); updateElement('win7-setup-version', '...');
        updateElement('win8-upper-setup-link', 'در حال بارگذاری لینک...', '#'); updateElement('win8-upper-setup-version', '...');
        updateElement('linux-64bit-link', 'در حال بارگذاری لینک...', '#'); updateElement('linux-64bit-version', '...'); updateElement('linux-latest-version-note', '...');
        updateElement('android-latest-version-info', '...'); updateElement('android-latest-version-page', 'در حال دریافت نسخه اندروید...');
        updateElement('android-apk-link', 'در حال بارگذاری لینک...', '#'); updateElement('android-apk-version', '...');
     }
    async function runUpdateProcess() { /* ... کد کامل تابع اصلی پردازش مثل نسخه قبل ... */
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
        if (mainInfoElem) { /* ... کد کامل پردازش main repo مثل قبل ... */
            if (mainResult.status === 'fulfilled' && mainResult.value) {
                 const release = mainResult.value; const latestVersion = release.tag_name; const assets = release.assets; console.log(`[Updater] Processing Main Repo Success: ${latestVersion}`);
                 updateElement('main-latest-version-info', `آخرین نسخه اصلی: ${latestVersion}`); updateElement('main-latest-version-warn', latestVersion);
                 const win7PortablePart = 'win7-Portable.rar'; const win8PortablePart = 'win8-upper-Portable.rar'; const win7SetupPart = 'win7-Setup.exe'; const win8SetupPart = 'win8-upper-Setup.exe'; const linuxPart = 'linux-64bit.tar.gz';
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
        if (androidInfoElem) { /* ... کد کامل پردازش android repo مثل قبل ... */
             if (androidResult.status === 'fulfilled' && androidResult.value) {
                 const release = androidResult.value; const latestVersion = release.tag_name; const assets = release.assets; console.log(`[Updater] Processing Android Repo Success: ${latestVersion}`);
                 updateElement('android-latest-version-info', latestVersion); updateElement('android-latest-version-page', `آخرین نسخه اندروید: ${latestVersion}`);
                 const apkAsset = assets ? assets.find(a => a.name && a.name.endsWith('.apk')) : null; const apkUrl = apkAsset ? apkAsset.browser_download_url : null;
                 updateElement('android-apk-link', null, apkUrl || '#'); updateElement('android-apk-version', apkUrl ? latestVersion : 'یافت نشد');
            } else { const errorMsg = androidResult.reason?.message || 'خطای دریافت'; console.error('[Updater] Error processing android repo:', androidResult.reason); updateElement('android-latest-version-info', 'خطا'); updateElement('android-latest-version-page', `خطا (${errorMsg})`); updateElement('android-apk-link', 'خطا', '#'); updateElement('android-apk-version', '!'); }
        }
        console.log("[Updater] runUpdateProcess finished.");
     }

    // --- Debounce Helper ---
    // برای جلوگیری از اجرای مکرر و سریع تابع در حین تغییرات زیاد DOM
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- MutationObserver Logic ---
    // تابع اصلی که فرآیند آپدیت را (با debounce) فراخوانی می‌کند
    const debouncedRunUpdateProcess = debounce(() => {
        console.log("[Updater] Debounce timer expired, running update process.");
        runUpdateProcess().catch(err => {
            console.error("[Updater] Unexpected error after debounce:", err);
        });
    }, 350); // تاخیر debounce را کمی بیشتر کنید (مثلاً 350 میلی‌ثانیه)

    // تابع callback برای MutationObserver
    function handleMutation(mutationsList, observer) {
        let targetElementFound = false;
        for (const mutation of mutationsList) {
            // فقط به تغییراتی که نود اضافه می‌کنند توجه می‌کنیم
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // بررسی می‌کنیم آیا نودهای اضافه شده شامل المنت‌های هدف ما هستند یا نه
                for (const node of mutation.addedNodes) {
                    // node.querySelector فقط روی Element ها کار می‌کند، نه Text nodes
                    if (node.nodeType === Node.ELEMENT_NODE) {
                         // یکی از المنت‌های اصلی را چک کنید کافی است
                         if (node.querySelector('#main-latest-version-info') || node.querySelector('#android-latest-version-info')) {
                            targetElementFound = true;
                            break; // از حلقه داخلی خارج شو
                        }
                        // اگر خود نود اضافه شده همان المنت هدف باشد (بعید ولی ممکن)
                         if (node.id === 'main-latest-version-info' || node.id === 'android-latest-version-info') {
                             targetElementFound = true;
                             break;
                         }
                    }
                }
            }
            if (targetElementFound) break; // از حلقه اصلی خارج شو
        }

        if (targetElementFound) {
            console.log("[Updater] Relevant mutation detected (target elements added). Debouncing update process.");
            // فرآیند آپدیت را با debounce فراخوانی کن
            debouncedRunUpdateProcess();
        }
    }

    // --- Initialization ---
    function initialize() {
        console.log("[Updater] Initializing MutationObserver.");

        // المنت اصلی که محتوای مقالات در آن بارگذاری می‌شود را پیدا کنید
        // این سلکتور ممکن است بسته به نسخه دقیق Material یا تنظیمات شما نیاز به تغییر داشته باشد
        // با Inspect Element بررسی کنید
        const targetNode = document.querySelector('.md-main .md-content') || document.body; // Fallback به body

        if (!targetNode) {
            console.error("[Updater] Could not find target node for MutationObserver. Updates on navigation might not work.");
            // اجرای اولیه را به هر حال انجام بده
             console.log("[Updater] Running initial update process directly.");
             runUpdateProcess().catch(err => { console.error("[Updater] Error during initial runUpdateProcess:", err); });
            return;
        }

        console.log("[Updater] Target node for observer found:", targetNode);

        // تنظیمات observer: مشاهده افزودن/حذف فرزندان در کل زیردرخت
        const config = { childList: true, subtree: true };

        // ساخت observer با تابع callback
        const observer = new MutationObserver(handleMutation);

        // شروع مشاهده target node با تنظیمات مشخص شده
        try {
            observer.observe(targetNode, config);
            console.log("[Updater] MutationObserver started.");
        } catch (error) {
            console.error("[Updater] Failed to start MutationObserver:", error);
        }


        // ** اجرای اولیه: **
        // باید یک بار هم در ابتدا اجرا شود، چون ممکن است اولین بار محتوا
        // بدون ایجاد mutation قابل تشخیص (برای observer) لود شده باشد.
        console.log("[Updater] Running initial update process check.");
        // مستقیم اجرا می‌کنیم چون debounce اینجا لازم نیست و ممکن است تاخیر ناخواسته ایجاد کند
        runUpdateProcess().catch(err => { console.error("[Updater] Error during initial runUpdateProcess:", err); });

        // نکته: نیازی به قطع observer نیست مگر اینکه خود targetNode حذف شود که بعید است.
    }

    // صبر کن تا DOM اولیه آماده شود، سپس observer را مقداردهی اولیه کن
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
