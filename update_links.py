import requests
import os
import sys
from pathlib import Path

# --- تنظیمات ---
MAIN_REPO = 'arshiacomplus/WarpScanner'
ANDROID_REPO = 'arshiacomplus/WarpScanner-android-GUI'
# مسیر فایل Markdown نسبت به محل اجرای اسکریپت
MARKDOWN_FILE_REL_PATH = 'docs/setup.md' # <<< مسیر فایل Markdown خود را اینجا تنظیم کنید

GITHUB_API_BASE = 'https://api.github.com/repos/'

# اطلاعات نسخه ثابت لینوکس (برای زمانی که در آخرین ریلیز موجود نباشد)
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
        if filename_part in asset.get('name', ''):
            return {
                'url': asset.get('browser_download_url'),
                'name': asset.get('name'),
            }
    return None

def get_filename_from_url(url):
    """نام فایل را از URL استخراج می‌کند."""
    if not url or url == '#':
        return "یافت نشد"
    try:
        return os.path.basename(url)
    except Exception:
        return "نام فایل نامشخص"

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
        # مقادیر پیش‌فرض خطا باقی می‌مانند


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
         # مقادیر پیش‌فرض خطا باقی می‌مانند

    # --- خواندن، جایگزینی و نوشتن فایل Markdown ---
    script_dir = Path(__file__).parent
    markdown_file_path = script_dir / MARKDOWN_FILE_REL_PATH

    if not markdown_file_path.is_file():
        print(f"Error: Markdown file not found at '{markdown_file_path}'", file=sys.stderr)
        sys.exit(1)

    try:
        print(f"Reading Markdown file: {markdown_file_path}")
        with open(markdown_file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        print("Replacing placeholders...")
        original_content = content
        for placeholder, value in PLACEHOLDERS.items():
            # اطمینان از اینکه مقدار None نباشد
            value_str = str(value) if value is not None else ""
            content = content.replace(placeholder, value_str)
            if placeholder in original_content and placeholder not in content:
                 print(f"  - Replaced '{placeholder}'")
            elif placeholder in original_content:
                 print(f"  - Warning: Placeholder '{placeholder}' found but not fully replaced?")


        if content == original_content:
            print("No changes detected in content after replacement attempts.")
        else:
            print("Content modified. Writing back to file...")
            with open(markdown_file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Successfully updated: {markdown_file_path}")

    except IOError as e:
        print(f"Error reading or writing file '{markdown_file_path}': {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred during file processing: {e}", file=sys.stderr)
        sys.exit(1)

    print("--- Link Update Script Finished ---")
