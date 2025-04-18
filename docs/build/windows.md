# ساخت نسخه ویندوز 💻

خب رفیق، اگه می‌خوای WarpScanner رو روی ویندوز خودت از سورس بیلد کنی، اینجا قدم به قدم با هم پیش میریم.

## 1. نصب پایتون 🐍

اولین و مهم‌ترین قدم، نصب پایتونه.

*   برو به [سایت رسمی پایتون (python.org)](https://www.python.org/downloads/windows/) و آخرین نسخه پایدار رو دانلود کن.
*   **مهم برای ویندوز 7:** اگه هنوز از ویندوز 7 استفاده می‌کنی، **باید** از نسخه‌های **پایتون 3.8 یا قدیمی‌تر** استفاده کنی. می‌تونی نسخه‌های قدیمی‌تر رو از همون سایت رسمی پیدا کنی (مثلاً [Python 3.8.10](https://www.python.org/downloads/release/python-3810/)).
*   **نکته نصب:** موقع نصب پایتون، حتماً تیک گزینه **"Add Python X.X to PATH"** رو بزن. این کار باعث میشه بتونی راحت‌تر از دستورات `python` و `pip` توی خط فرمان (CMD) استفاده کنی.

!!! tip "نصب چند نسخه پایتون"
    اگه نیاز داری هم برای ویندوزهای جدید و هم برای ویندوز 7 بیلد بگیری، می‌تونی هر دو نسخه پایتون (مثلاً آخرین نسخه و نسخه 3.8) رو نصب داشته باشی. موقع اجرای دستورات بیلد، فقط باید حواست باشه که مسیر درست همون نسخه پایتون مورد نظرت رو بدی.

بعد از نصب پایتون خوشگلمون، یه نفس تازه کن (یا همون قهوه که گفتی 😉)، و بیا سراغ ادامه ماجرا.

## 2. انتخاب روش بیلد

برای ساخت فایل اجرایی (`.exe`) از اسکریپت پایتون روی ویندوز، دو تا روش متداول داریم:

### روش اول: استفاده از PyInstaller (ساده‌تر)

PyInstaller ابزار محبوب و نسبتاً ساده‌ایه برای تبدیل اسکریپت پایتون به فایل اجرایی.

1.  **نصب PyInstaller:**
    خط فرمان (CMD) رو باز کن و این دستور رو بزن:
    ```cmd
    pip install pyinstaller
    ```

2.  **نصب کتابخانه‌های مورد نیاز برنامه:**
    برنامه WarpScanner به یه سری کتابخونه‌های دیگه هم نیاز داره. باید اون‌ها رو هم با `pip` نصب کنی. مهم‌ترین‌هاش اینان (ممکنه لیست کامل‌تر باشه، به فایل `requirements.txt` اگه وجود داره نگاه کن):
    ```cmd
    pip install requests customtkinter icmplib retrying pyperclip PyYAML Pillow cryptography
    ```
    *(لیست بالا بر اساس اطلاعات قبلی ، حتماً لیست دقیق رو از `requirements.txt` پروژه چک کن)*

3.  **آماده‌سازی پوشه پروژه:**
    *   با دستور `cd` توی CMD، به مسیری برو که فایل اصلی پایتون برنامه (مثلاً اسمش `WarpScanner.py` باشه) قرار داره.
        ```cmd
        cd path\to\your\project\directory
        ```
    *   **آیکون (اختیاری):** اگه می‌خوای فایل `exe` آیکون داشته باشه، یه فایل آیکون با فرمت `.png` و اسم `icon.png` توی همین پوشه قرار بده. اگه آیکون نداری یا نمی‌خوای، مشکلی نیست، فقط باید بخش مربوط به آیکون رو از دستور بیلد حذف کنی.

4.  **اجرای دستور بیلد PyInstaller:**
    حالا دستور اصلی رو باید بزنی. چون ممکنه چند نسخه پایتون نصب داشته باشی، بهتره مسیر کامل فایل `pyinstaller.exe` مربوط به اون نسخه پایتون که می‌خوای باهاش بیلد بگیری رو مشخص کنی.

    *   **برای ویندوز 8 و بالاتر (با پایتون مدرن، مثلاً 3.11):**
        ```cmd
        C:\Users\<نام-کاربری-شما>\AppData\Local\Programs\Python\Python311\Scripts\pyinstaller.exe WarpScanner.py -w --onefile -i icon.png
        ```
        *   **توضیحات:**
            *   `<نام-کاربری-شما>` رو با نام یوزر خودت توی ویندوز عوض کن.
            *   `Python311` رو با ورژن پایتونی که نصب کردی و می‌خوای استفاده کنی جایگزین کن (مثلاً `Python310`, `Python312`).
            *   `WarpScanner.py` اسم فایل اصلی پایتون برنامه است (اگه اسمش فرق داره، عوضش کن).
            *   `-w`: باعث میشه موقع اجرای برنامه، پنجره سیاه CMD باز نشه (برای برنامه‌های گرافیکی مثل این خوبه).
            *   `--onefile`: سعی می‌کنه همه چی رو توی یه فایل `exe` تکی جمع کنه.
            *   `-i icon.png`: آیکون رو به فایل `exe` اضافه می‌کنه. **اگه فایل `icon.png` رو نداری، این قسمت (`-i icon.png`) رو کلاً پاک کن.**

    *   **برای ویندوز 7 (با پایتون 3.8):**
        ```cmd
        C:\Users\<نام-کاربری-شما>\AppData\Local\Programs\Python\Python38\Scripts\pyinstaller.exe WarpScanner.py -w --onefile -i icon.png
        ```
        *   مثل دستور بالا، حواست به جایگزین کردن `<نام-کاربری-شما>` و اسم فایل پایتون باشه.
        *   مطمئن شو که مسیر به پوشه `Python38` اشاره می‌کنه.
        *   اگه آیکون نداری، `-i icon.png` رو حذف کن.

5.  **پیدا کردن فایل نهایی:**
    بعد از اینکه دستور بیلد با موفقیت اجرا شد، فایل `exe` نهایی رو می‌تونی توی پوشه‌ای به اسم `dist` (که داخل همون پوشه پروژه‌ات ساخته میشه) پیدا کنی. **(برای مرحله بعد به این فایل نیاز داریم)**

### روش دوم: استفاده از Nuitka (پیشرفته‌تر)

Nuitka یه کامپایلر پایتونه که سعی می‌کنه کد پایتون رو به کد C تبدیل و بعد کامپایل کنه. این روش معمولاً فایل خروجی بهینه‌تر و سریع‌تری میده ولی مراحلش یه کم پیچیده‌تره.

1.  **نصب Nuitka:**
    ```cmd
    pip install nuitka
    ```
2.  **نصب کتابخانه‌های مورد نیاز برنامه:**
    برنامه WarpScanner به یه سری کتابخونه‌های دیگه هم نیاز داره. باید اون‌ها رو هم با `pip` نصب کنی. مهم‌ترین‌هاش اینان (ممکنه لیست کامل‌تر باشه، به فایل `requirements.txt` اگه وجود داره نگاه کن):
    ```cmd
    pip install requests customtkinter icmplib retrying pyperclip PyYAML Pillow cryptography
    ```
    *(لیست بالا بر اساس اطلاعات قبلی ، حتماً لیست دقیق رو از `requirements.txt` پروژه چک کن)*
3.  **نصب کامپایلر C (MinGW-w64):**
    Nuitka برای کامپایل کردن به یه کامپایلر C نیاز داره. یکی از بهترین گزینه‌ها برای ویندوز MinGW-w64 هست.
    *   می‌تونی از طریق [MSYS2](https://www.msys2.org/) نصبش کنی (روش پیشنهادی) یا یه نسخه مستقلش رو از [WinLibs](https://winlibs.com/) یا منابع دیگه دانلود کنی.
    *   **مهم:** بعد از نصب، باید مسیر پوشه `bin` کامپایلر MinGW (جایی که `gcc.exe` قرار داره) رو به متغیر محیطی `PATH` سیستمت اضافه کنی.

4.  **نصب UPX (اختیاری ولی به‌شدت پیشنهادی):**
    UPX ابزاریه که فایل‌های اجرایی رو فشرده می‌کنه و حجم فایل نهایی رو خیلی کم می‌کنه. Nuitka می‌تونه ازش استفاده کنه.
    *   به [صفحه دانلود UPX در گیت‌هاب](https://github.com/upx/upx/releases) برو و آخرین نسخه برای ویندوز رو دانلود کن.
    *   فایل `upx.exe` رو از حالت فشرده خارج کن و در یه مسیر مشخص قرار بده (مثلاً `C:\upx\upx.exe`). مسیرش رو برای دستور بیلد لازم داریم.

5.  **آماده‌سازی پوشه پروژه:**
    *   مثل روش PyInstaller، با `cd` به پوشه پروژه برو.
    *   **آیکون (اختیاری):** برای Nuitka، فرمت آیکون باید `.ico` باشه. اگه آیکون داری، فایلی به اسم `icon.ico` توی پوشه پروژه قرار بده.

6.  **اجرای دستور بیلد Nuitka:**
    دستور بیلد Nuitka معمولاً طولانی‌تر و پر از گزینه‌ است.

    *   **برای ویندوز 8 و بالاتر (با پایتون مدرن، مثلاً 3.11):**
        ```cmd
        C:\Users\<نام-کاربری-شما>\AppData\Local\Programs\Python\Python311\python.exe -m nuitka --mingw64 --standalone --follow-imports --remove-output --jobs=2 --enable-plugin=tk-inter --enable-plugin=upx --upx-binary="C:\upx\upx.exe" --windows-icon-from-ico="icon.ico" --windows-console-mode=disable --include-package-data=customtkinter --include-package=requests,cryptography,icmplib,retrying,pyperclip,yaml,PIL WarpScanner.py
        ```
    *   **برای ویندوز 7 (با پایتون 3.8):**
        ```cmd
        C:\Users\<نام-کاربری-شما>\AppData\Local\Programs\Python\Python38\python.exe -m nuitka --mingw64 --standalone --follow-imports --remove-output --jobs=2 --enable-plugin=tk-inter --enable-plugin=upx --upx-binary="C:\upx\upx.exe" --windows-icon-from-ico="icon.ico" --windows-console-mode=disable --include-package-data=customtkinter --include-package=requests,cryptography,icmplib,retrying,pyperclip,yaml,PIL WarpScanner.py
        ```

    *   **توضیحات مهم دستور Nuitka:**
        *   `<نام-کاربری-شما>`, `Python311`/`Python38`, و `WarpScanner.py` رو مثل قبل با مقادیر درست جایگزین کن.
        *   `--mingw64`: مشخص می‌کنه که از کامپایلر MinGW استفاده بشه.
        *   `--standalone`: سعی می‌کنه تمام نیازمندی‌ها رو کنار فایل اجرایی کپی کنه.
        *   `--follow-imports`: تمام ماژول‌هایی که ایمپورت شدن رو پیدا و شامل می‌کنه.
        *   `--remove-output`: بعد از اتمام کار، فایل‌های موقت بیلد رو پاک می‌کنه.
        *   `--jobs=2`: تعداد هسته‌های CPU که برای بیلد استفاده بشه (می‌تونی بیشترش کنی اگه CPU قوی‌تری داری).
        *   `--enable-plugin=tk-inter`: پلاگین لازم برای برنامه‌هایی که از Tkinter (مثل CustomTkinter) استفاده می‌کنن.
        *   `--enable-plugin=upx`: پلاگین فشرده‌سازی با UPX رو فعال می‌کنه.
        *   `--upx-binary="C:\upx\upx.exe"`: مسیر فایل `upx.exe` رو بهش میده. **اگه UPX رو نصب نکردی یا نمی‌خوای استفاده کنی، این گزینه و گزینه `--enable-plugin=upx` رو حذف کن.**
        *   `--windows-icon-from-ico="icon.ico"`: آیکون `.ico` رو به فایل اجرایی اضافه می‌کنه. **اگه فایل `icon.ico` رو نداری، این گزینه رو حذف کن.**
        *   `--windows-console-mode=disable`: پنجره سیاه CMD رو موقع اجرا نشون نمیده.
        *   `--include-package-data=customtkinter`: فایل‌های جانبی (مثل تم‌ها)ی CustomTkinter رو شامل می‌کنه.
        *   `--include-package=...`: بعضی وقت‌ها لازمه به Nuitka بگی صراحتاً کدوم پکیج‌ها رو کامل شامل کنه. (لیست پکیج‌ها در دستور بالا ممکنه کامل نباشه، حتماً با نیازمندی‌های پروژه چک کن)

7.  **پیدا کردن فایل نهایی:**
    بعد از اتمام بیلد Nuitka، یه پوشه با پسوند `.dist` و همنام فایل پایتونت ساخته میشه (مثلاً `WarpScanner.dist`). فایل `exe` نهایی داخل این پوشه قرار داره. **(برای مرحله بعد به این فایل نیاز داریم)**

## 3. کپی کردن پوشه‌های ضروری (از نسخه‌های پرتابل) 📁

خب، کار هنوز تموم نشده! فایل `.exe` ای که با PyInstaller یا Nuitka ساختی، به تنهایی کامل نیست و برای کار کردن درست (مخصوصاً توابع مربوط به WARP و اسکن)، به یه سری پوشه و فایل‌های دیگه نیاز داره که کنارش باشن.

1.  **دانلود نسخه پرتابل:**
    برو به قسمت Releases پروژه (احتمالاً توی گیت‌هاب) و یکی از **نسخه‌های پرتابل (Portable)** رسمی برنامه رو دانلود کن. سعی کن نسخه‌ای رو دانلود کنی که با سورس کدی که ازش بیلد گرفتی، مطابقت داشته باشه (معمولاً آخرین نسخه).

2.  **پیدا کردن پوشه‌های مورد نیاز:**
    فایل زیپ نسخه پرتابل رو باز کن و دنبال این پوشه‌ها بگرد:
    *   `hy2`
    *   `imgs`
    *   `ip_range`
    *   `xray`

3.  **کپی کردن پوشه‌ها:**
    *   حالا این پوشه‌ها (`hy2`, `imgs`, `ip_range`, `xray`) رو کپی کن.
    *   برو به مسیری که فایل `.exe` خودت رو اونجا پیدا کردی:
        *   اگه از **PyInstaller** با `--onefile` استفاده کردی، فایل `exe` توی پوشه `dist` قرار داره.
        *   اگه از **Nuitka** استفاده کردی، فایل `exe` توی پوشه `.dist` (مثلاً `WarpScanner.dist`) قرار داره.
    *   پوشه‌هایی که کپی کرده بودی رو **دقیقاً کنار فایل `.exe` خودت** Paste کن.

!!! warning "نکته مهم درباره نسخه‌های قدیمی"
    توجه: این چهار پوشه (`hy2`, `imgs`, `ip_range`, `xray`) برای **آخرین نسخه** برنامه ضروری هستن. اگه داری از سورس کد قدیمی‌تری بیلد می‌گیری و نسخه پرتابل قدیمی‌تری رو هم دانلود کردی، ممکنه همه این پوشه‌ها توی اون نسخه پرتابل وجود نداشته باشن. **اشکالی نداره!** فقط هر کدوم از این چهار تا پوشه رو که توی نسخه پرتابلِ دانلود شده پیدا کردی، کپی کن و کنار فایل `exe` خودت قرار بده. باقی مونده‌ها رو لازم نیست کپی کنی.

!!! success "تبریک! 🎉"
    حالا فایل `exe` شما به همراه پوشه‌های ضروریش آماده استفاده!

---

خب، اینم از راهنمای کامل بیلد گرفتن روی ویندوز به همراه نکته مهم کپی کردن فایل‌های جانبی. امیدوارم به کارت بیاد. موفق باشی! 💪
