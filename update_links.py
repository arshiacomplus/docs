import requests
import os
import sys
from pathlib import Path

# --- تنظیمات ---
MAIN_REPO = 'arshiacomplus/WarpScanner'
ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI'
# *** مهم: این مسیر را با دقت بررسی و اصلاح کنید ***
MARKDOWN_FILE_PATH = Path('docs/setup.md') # مسیر فایل Markdown نسبت به ریشه ریپازیتوری

# ... (بقیه ثابت‌ها و Placeholder ها مثل قبل) ...
GITHUB_API_BASE = 'https://api.github.com/repos/'
LINUX_FALLBACK_VERSION = 'v0.4.1'; LINUX_FALLBACK_FILENAME = f'WarpScanner-{LINUX_FALLBACK_VERSION}-linux-64bit.tar.gz'; LINUX_FALLBACK_URL = f'https://github.com/{MAIN_REPO}/releases/download/{LINUX_FALLBACK_VERSION}/{LINUX_FALLBACK_FILENAME}'
PLACEHOLDERS = { "{{ MAIN_LATEST_VERSION }}": "نامشخص", "{{ WIN7_PORTABLE_LINK }}": "#", "{{ WIN7_PORTABLE_FILENAME }}": "یافت نشد", "{{ WIN7_PORTABLE_VERSION }}": "نامشخص", "{{ WIN8_UPPER_PORTABLE_LINK }}": "#", "{{ WIN8_UPPER_PORTABLE_FILENAME }}": "یافت نشد", "{{ WIN8_UPPER_PORTABLE_VERSION }}": "نامشخص", "{{ WIN7_SETUP_LINK }}": "#", "{{ WIN7_SETUP_FILENAME }}": "یافت نشد", "{{ WIN7_SETUP_VERSION }}": "نامشخص", "{{ WIN8_UPPER_SETUP_LINK }}": "#", "{{ WIN8_UPPER_SETUP_FILENAME }}": "یافت نشد", "{{ WIN8_UPPER_SETUP_VERSION }}": "نامشخص", "{{ LINUX_LINK }}": "#", "{{ LINUX_FILENAME }}": "یافت نشد", "{{ LINUX_VERSION }}": "نامشخص", "{{ LINUX_NOTE }}": "خطا در بررسی نسخه لینوکس.", "{{ ANDROID_LATEST_VERSION }}": "نامشخص", "{{ ANDROID_APK_LINK }}": "#", "{{ ANDROID_APK_FILENAME }}": "یافت نشد", "{{ ANDROID_APK_VERSION }}": "نامشخص", }

# --- توابع کمکی (بدون تغییر) ---
def fetch_latest_release(repo): /* ... کد مثل قبل ... */
    url = f"{GITHUB_API_BASE}{repo}/releases/latest"; print(f"Fetching latest release from: {url}")
    try: response = requests.get(url, timeout=15); response.raise_for_status(); print(f"Successfully fetched release for {repo}"); return response.json()
    except requests.exceptions.RequestException as e: print(f"Error fetching release for {repo}: {e}", file=sys.stderr); return None
    except Exception as e: print(f"An unexpected error occurred fetching {repo}: {e}", file=sys.stderr); return None
def find_asset(assets, filename_part): /* ... کد مثل قبل ... */
    if not assets: return None
    for asset in assets:
        if filename_part in asset.get('name', ''): return {'url': asset.get('browser_download_url'), 'name': asset.get('name')}
    return None

# --- منطق اصلی اسکریپت ---
if __name__ == "__main__":
    print("--- Starting Link Update Script ---")

    # ... (منطق دریافت اطلاعات API مثل قبل) ...
    main_release = fetch_latest_release(MAIN_REPO); main_version = "خطا"; linux_note = "خطا در بررسی نسخه لینوکس."
    if main_release: main_version = main_release.get('tag_name', 'نامشخص'); PLACEHOLDERS["{{ MAIN_LATEST_VERSION }}"] = main_version; assets = main_release.get('assets'); win7p = find_asset(assets, 'win7-Portable.rar'); win8p = find_asset(assets, 'win8-upper-Portable.rar'); win7s = find_asset(assets, 'win7-Setup.exe'); win8s = find_asset(assets, 'win8-upper-Setup.exe');
    if win7p: PLACEHOLDERS["{{ WIN7_PORTABLE_LINK }}"] = win7p['url']; PLACEHOLDERS["{{ WIN7_PORTABLE_FILENAME }}"] = win7p['name']; PLACEHOLDERS["{{ WIN7_PORTABLE_VERSION }}"] = main_version
    if win8p: PLACEHOLDERS["{{ WIN8_UPPER_PORTABLE_LINK }}"] = win8p['url']; PLACEHOLDERS["{{ WIN8_UPPER_PORTABLE_FILENAME }}"] = win8p['name']; PLACEHOLDERS["{{ WIN8_UPPER_PORTABLE_VERSION }}"] = main_version
    if win7s: PLACEHOLDERS["{{ WIN7_SETUP_LINK }}"] = win7s['url']; PLACEHOLDERS["{{ WIN7_SETUP_FILENAME }}"] = win7s['name']; PLACEHOLDERS["{{ WIN7_SETUP_VERSION }}"] = main_version
    if win8s: PLACEHOLDERS["{{ WIN8_UPPER_SETUP_LINK }}"] = win8s['url']; PLACEHOLDERS["{{ WIN8_UPPER_SETUP_FILENAME }}"] = win8s['name']; PLACEHOLDERS["{{ WIN8_UPPER_SETUP_VERSION }}"] = main_version
    linux_asset = find_asset(assets, 'linux-64bit.tar.gz');
    if linux_asset: PLACEHOLDERS["{{ LINUX_LINK }}"] = linux_asset['url']; PLACEHOLDERS["{{ LINUX_FILENAME }}"] = linux_asset['name']; PLACEHOLDERS["{{ LINUX_VERSION }}"] = main_version; linux_note = f"فایل لینوکس از آخرین نسخه ({main_version}) دریافت شده است."
    else: print(f"Linux asset not found in latest release ({main_version}). Using fallback {LINUX_FALLBACK_VERSION}."); PLACEHOLDERS["{{ LINUX_LINK }}"] = LINUX_FALLBACK_URL; PLACEHOLDERS["{{ LINUX_FILENAME }}"] = LINUX_FALLBACK_FILENAME; PLACEHOLDERS["{{ LINUX_VERSION }}"] = LINUX_FALLBACK_VERSION; linux_note = f"آخرین نسخه ({main_version}) فاقد فایل لینوکس بود. از نسخه قدیمی‌تر ({LINUX_FALLBACK_VERSION}) استفاده شد."
    PLACEHOLDERS["{{ LINUX_NOTE }}"] = linux_note
    else: print("Failed to fetch main repository data.", file=sys.stderr)
    android_release = fetch_latest_release(ANDROID_REPO); android_version = "خطا"
    if android_release: android_version = android_release.get('tag_name', 'نامشخص'); PLACEHOLDERS["{{ ANDROID_LATEST_VERSION }}"] = android_version; PLACEHOLDERS["{{ ANDROID_APK_VERSION }}"] = android_version; assets = android_release.get('assets'); apk_asset = find_asset(assets, '.apk');
    if apk_asset: PLACEHOLDERS["{{ ANDROID_APK_LINK }}"] = apk_asset['url']; PLACEHOLDERS["{{ ANDROID_APK_FILENAME }}"] = apk_asset['name']
    else: PLACEHOLDERS["{{ ANDROID_APK_FILENAME }}"] = "فایل APK یافت نشد"
    else: print("Failed to fetch Android repository data.", file=sys.stderr)

    # --- خواندن، جایگزینی و نوشتن فایل Markdown ---
    markdown_file_path = MARKDOWN_FILE_PATH
    print(f"Attempting to process Markdown file at resolved path: {markdown_file_path.resolve()}") # لاگ مسیر کامل

    # بررسی وجود فایل با جزئیات بیشتر
    if not markdown_file_path.is_file():
        print(f"!!!!!!!! ERROR !!!!!!!!", file=sys.stderr)
        print(f"Markdown file NOT FOUND at expected path: '{markdown_file_path}'", file=sys.stderr)
        print(f"This path is relative to the current working directory.", file=sys.stderr)
        print(f"Current Working Directory: {Path.cwd()}", file=sys.stderr)
        print("------------------------------------------", file=sys.stderr)
        print("Listing files/dirs in Current Working Directory:", file=sys.stderr)
        try:
            for item in Path.cwd().iterdir():
                print(f"  - {item.name}{'/' if item.is_dir() else ''}", file=sys.stderr)
        except Exception as e:
            print(f"    Could not list CWD contents: {e}", file=sys.stderr)
        print("------------------------------------------", file=sys.stderr)
        # سعی کنید مسیر docs را هم لیست کنید اگر وجود دارد
        docs_dir = Path('docs')
        if docs_dir.is_dir():
             print("Listing files/dirs in ./docs:", file=sys.stderr)
             try:
                 for item in docs_dir.iterdir():
                     print(f"  - {item.name}{'/' if item.is_dir() else ''}", file=sys.stderr)
             except Exception as e:
                 print(f"    Could not list ./docs contents: {e}", file=sys.stderr)
        else:
            print("./docs directory not found in CWD.", file=sys.stderr)
        print("------------------------------------------", file=sys.stderr)
        sys.exit(1) # خروج با خطا

    # اگر فایل پیدا شد، ادامه بده
    try:
        print(f"SUCCESS: Markdown file found. Reading file content...")
        content = markdown_file_path.read_text(encoding='utf-8')

        print("Replacing placeholders...")
        original_content = content
        modified = False
        for placeholder, value in PLACEHOLDERS.items():
            value_str = str(value) if value is not None else ""
            new_content = content.replace(placeholder, value_str)
            if new_content != content:
                 # print(f"  - Replaced '{placeholder}'") # لاگ جایگزینی می‌تواند طولانی باشد
                 content = new_content
                 modified = True

        if not modified:
            print("No changes needed in content.")
        else:
            print("Content modified. Writing back to file...")
            markdown_file_path.write_text(content, encoding='utf-8')
            print(f"Successfully updated: {markdown_file_path}")

    except IOError as e:
        print(f"Error reading or writing file '{markdown_file_path}': {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred during file processing: {e}", file=sys.stderr)
        sys.exit(1)

    print("--- Link Update Script Finished ---")
