import requests
import os
import sys
from pathlib import Path

# --- تنظیمات ---
MAIN_REPO = 'arshiacomplus/WarpScanner'
ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI'
# *** مهم: این مسیر را با دقت بررسی و اصلاح کنید تا به فایل Markdown شما اشاره کند ***
MARKDOWN_FILE_PATH = Path('docs/getting-started.md') # مسیر فایل Markdown نسبت به ریشه ریپازیتوری

GITHUB_API_BASE = 'https://api.github.com/repos/'
LINUX_FALLBACK_VERSION = 'v0.4.1'
LINUX_FALLBACK_FILENAME = f'WarpScanner-{LINUX_FALLBACK_VERSION}-linux-64bit.tar.gz'
LINUX_FALLBACK_URL = f'https://github.com/{MAIN_REPO}/releases/download/{LINUX_FALLBACK_VERSION}/{LINUX_FALLBACK_FILENAME}'

# Placeholder هایی که در فایل Markdown استفاده شده‌اند
PLACEHOLDERS = {
    "{{ MAIN_LATEST_VERSION }}": "نامشخص",
    "{{ WIN7_PORTABLE_LINK }}": "#",
    "{{ WIN7_PORTABLE_FILENAME }}": "یافت نشد",
    "{{ WIN7_PORTABLE_VERSION }}": "نامشخص",
    "{{ WIN8_UPPER_PORTABLE_LINK }}": "#",
    "{{ WIN8_UPPER_PORTABLE_FILENAME }}": "یافت نشد",
    "{{ WIN8_UPPER_PORTABLE_VERSION }}": "نامشخص",
    "{{ WIN7_SETUP_LINK }}": "#",
    "{{ WIN7_SETUP_FILENAME }}": "یافت نشد",
    "{{ WIN7_SETUP_VERSION }}": "نامشخص",
    "{{ WIN8_UPPER_SETUP_LINK }}": "#",
    "{{ WIN8_UPPER_SETUP_FILENAME }}": "یافت نشد",
    "{{ WIN8_UPPER_SETUP_VERSION }}": "نامشخص",
    "{{ LINUX_LINK }}": "#",
    "{{ LINUX_FILENAME }}": "یافت نشد",
    "{{ LINUX_VERSION }}": "نامشخص",
    "{{ LINUX_NOTE }}": "خطا در بررسی نسخه لینوکس.",
    "{{ ANDROID_LATEST_VERSION }}": "نامشخص",
    "{{ ANDROID_APK_LINK }}": "#",
    "{{ ANDROID_APK_FILENAME }}": "یافت نشد",
    "{{ ANDROID_APK_VERSION }}": "نامشخص",
}

# --- توابع کمکی ---
def fetch_latest_release(repo):
    """اطلاعات آخرین ریلیز را از GitHub API دریافت می‌کند."""
    url = f"{GITHUB_API_BASE}{repo}/releases/latest"
    print(f"Fetching latest release from: {url}")
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()  # Check for HTTP errors (4xx or 5xx)
        print(f"Successfully fetched release for {repo}")
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching release for {repo}: {e}", file=sys.stderr)
        return None
    except Exception as e:
        print(f"An unexpected error occurred fetching {repo}: {e}", file=sys.stderr)
        return None

def find_asset(assets, filename_part):
    """یک فایل asset را بر اساس بخشی از نام آن پیدا می‌کند."""
    if not assets:
        return None
    # جستجو برای انطباق دقیق‌تر (مثلاً شامل ورژن) اگر ممکن باشد
    # در غیر این صورت، جستجو بر اساس بخش پایانی نام
    for asset in assets:
        # Ensure asset and asset name exist before checking
        asset_name = asset.get('name')
        if asset_name and filename_part in asset_name:
            return {
                'url': asset.get('browser_download_url'),
                'name': asset_name, # Use the retrieved name
            }
    return None

# --- منطق اصلی اسکریپت ---
if __name__ == "__main__":
    print("--- Starting Link Update Script ---")

    # دریافت اطلاعات مخزن اصلی
    main_release = fetch_latest_release(MAIN_REPO)
    main_version = "خطا"
    linux_note = "خطا در بررسی نسخه لینوکس."

    if main_release:
        main_version = main_release.get('tag_name', 'نامشخص')
        PLACEHOLDERS["{{ MAIN_LATEST_VERSION }}"] = main_version
        assets = main_release.get('assets')

        # پردازش فایل‌های ویندوز
        win7p = find_asset(assets, 'win7-Portable.rar')
        win8p = find_asset(assets, 'win8-upper-Portable.rar')
        win7s = find_asset(assets, 'win7-Setup.exe')
        win8s = find_asset(assets, 'win8-upper-Setup.exe')

        if win7p:
            PLACEHOLDERS["{{ WIN7_PORTABLE_LINK }}"] = win7p['url']
            PLACEHOLDERS["{{ WIN7_PORTABLE_FILENAME }}"] = win7p['name']
            PLACEHOLDERS["{{ WIN7_PORTABLE_VERSION }}"] = main_version
        if win8p:
            PLACEHOLDERS["{{ WIN8_UPPER_PORTABLE_LINK }}"] = win8p['url']
            PLACEHOLDERS["{{ WIN8_UPPER_PORTABLE_FILENAME }}"] = win8p['name']
            PLACEHOLDERS["{{ WIN8_UPPER_PORTABLE_VERSION }}"] = main_version
        if win7s:
            PLACEHOLDERS["{{ WIN7_SETUP_LINK }}"] = win7s['url']
            PLACEHOLDERS["{{ WIN7_SETUP_FILENAME }}"] = win7s['name']
            PLACEHOLDERS["{{ WIN7_SETUP_VERSION }}"] = main_version
        if win8s:
            PLACEHOLDERS["{{ WIN8_UPPER_SETUP_LINK }}"] = win8s['url']
            PLACEHOLDERS["{{ WIN8_UPPER_SETUP_FILENAME }}"] = win8s['name']
            PLACEHOLDERS["{{ WIN8_UPPER_SETUP_VERSION }}"] = main_version

        # پردازش فایل لینوکس (با fallback)
        linux_asset = find_asset(assets, 'linux-64bit.tar.gz')
        if linux_asset:
            PLACEHOLDERS["{{ LINUX_LINK }}"] = linux_asset['url']
            PLACEHOLDERS["{{ LINUX_FILENAME }}"] = linux_asset['name']
            PLACEHOLDERS["{{ LINUX_VERSION }}"] = main_version
            linux_note = f"فایل لینوکس از آخرین نسخه ({main_version}) دریافت شده است."
        else:
            print(f"Linux asset not found in latest release ({main_version}). Using fallback {LINUX_FALLBACK_VERSION}.")
            PLACEHOLDERS["{{ LINUX_LINK }}"] = LINUX_FALLBACK_URL
            PLACEHOLDERS["{{ LINUX_FILENAME }}"] = LINUX_FALLBACK_FILENAME
            PLACEHOLDERS["{{ LINUX_VERSION }}"] = LINUX_FALLBACK_VERSION
            linux_note = f"آخرین نسخه ({main_version}) فاقد فایل لینوکس بود. از نسخه قدیمی‌تر ({LINUX_FALLBACK_VERSION}) استفاده شد."
        PLACEHOLDERS["{{ LINUX_NOTE }}"] = linux_note

    else:
        # اگر دریافت اطلاعات مخزن اصلی ناموفق بود
        print("Failed to fetch main repository data. Placeholders will contain error messages.", file=sys.stderr)

    # دریافت اطلاعات مخزن اندروید
    android_release = fetch_latest_release(ANDROID_REPO)
    android_version = "خطا"

    if android_release:
        android_version = android_release.get('tag_name', 'نامشخص')
        PLACEHOLDERS["{{ ANDROID_LATEST_VERSION }}"] = android_version
        PLACEHOLDERS["{{ ANDROID_APK_VERSION }}"] = android_version
        assets = android_release.get('assets')

        apk_asset = find_asset(assets, '.apk') # پیدا کردن اولین فایل apk
        if apk_asset:
            PLACEHOLDERS["{{ ANDROID_APK_LINK }}"] = apk_asset['url']
            PLACEHOLDERS["{{ ANDROID_APK_FILENAME }}"] = apk_asset['name']
        else:
             PLACEHOLDERS["{{ ANDROID_APK_FILENAME }}"] = "فایل APK یافت نشد"

    else:
         # اگر دریافت اطلاعات مخزن اندروید ناموفق بود
        print("Failed to fetch Android repository data. Placeholders will contain error messages.", file=sys.stderr)

    # --- خواندن، جایگزینی و نوشتن فایل Markdown ---
    markdown_file_path = MARKDOWN_FILE_PATH
    # Add a print statement to show the path being used
    print(f"Attempting to process Markdown file expected at relative path: '{markdown_file_path}'")
    # Also print the absolute path it resolves to in the current environment
    try:
        absolute_path = markdown_file_path.resolve()
        print(f"Absolute path resolved to: {absolute_path}")
    except FileNotFoundError:
        print(f"Could not resolve absolute path, file likely doesn't exist at '{markdown_file_path}' relative to CWD.")
        absolute_path = None # Set to None if resolve fails
    except Exception as e:
        print(f"Error resolving path: {e}")
        absolute_path = None


    # بررسی وجود فایل با جزئیات بیشتر
    # Use the original relative path for the check, as resolve() fails if it doesn't exist
    if not markdown_file_path.is_file():
        print(f"!!!!!!!! ERROR !!!!!!!!", file=sys.stderr)
        print(f"Markdown file NOT FOUND using relative path: '{markdown_file_path}'", file=sys.stderr)
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
             print("Listing files/dirs in ./docs directory:", file=sys.stderr)
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
        print(f"SUCCESS: Markdown file found at '{markdown_file_path}'. Reading file content...")
        content = markdown_file_path.read_text(encoding='utf-8')

        print("Replacing placeholders...")
        original_content = content
        modified = False
        for placeholder, value in PLACEHOLDERS.items():
            value_str = str(value) if value is not None else ""
            # Only replace if placeholder exists and value is different
            if placeholder in content:
                new_content = content.replace(placeholder, value_str)
                if new_content != content:
                    # print(f"  - Replaced '{placeholder}'") # Can be verbose
                    content = new_content
                    modified = True

        if not modified:
            print("No changes needed in content (placeholders might be missing or values are the same).")
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
