lang: en

# Quick Start: Test Your Proxies

This guide will walk you through the most common use case: testing a list of proxy URIs to find the fastest ones.

### Step 1: Create a Python file

Create a new file, for example `test_proxies.py`.

### Step 2: Add the Code

Copy and paste the following code into your file.

```python
from pathlib import Path
from python_v2ray.downloader import BinaryDownloader
from python_v2ray.tester import ConnectionTester
from python_v2ray.config_parser import parse_uri

def main():
    """
    Ensures binaries are present, parses URIs, and tests their connectivity.
    """
    project_root = Path("./")

    # --- 1. Ensure all required binaries are available ---
    print("--- Verifying binaries ---")
    try:
        downloader = BinaryDownloader(project_root)
        downloader.ensure_all()
    except Exception as e:
        print(f"Fatal Error: {e}")
        return

    # --- 2. Add your proxy URIs here ---
    test_uris = [
        "vless://...",
        "vmess://...",
        "hysteria2://...",
        # ... add as many as you want
    ]

    # --- 3. Parse all URIs into a unified format ---
    print("\n* Parsing URIs...")
    parsed_configs = [p for p in (parse_uri(uri) for uri in test_uris) if p]

    if not parsed_configs:
        print("No valid configurations found to test.")
        return

    print(f"* Preparing to test {len(parsed_configs)} configurations concurrently...")

    # --- 4. Initialize and run the tester ---
    tester = ConnectionTester(
        vendor_path=str(project_root / "vendor"),
        core_engine_path=str(project_root / "core_engine")
    )
    results = tester.test_uris(parsed_configs)

    # --- 5. Display the results, sorted by latency ---
    print("\n" + "="*20 + " Test Results " + "="*20)
    if results:
        sorted_results = sorted(results, key=lambda x: x.get('ping_ms', 9999))
        for result in sorted_results:
            tag = result.get('tag', 'N/A')
            ping = result.get('ping_ms', -1)
            status = result.get('status', 'error')
            
            if status == 'success':
                print(f"✅ Tag: {tag:<35} | Latency: {ping:>4} ms | Status: {status}")
            else:
                # Clean up error messages for better readability
                clean_status = status.split('|').strip()
                print(f"❌ Tag: {tag:<35} | Latency: {ping:>4} ms | Status: {clean_status}")
    else:
        print("No results were received from the tester.")
    print("="*56)

if __name__ == "__main__":
    main()
```

### Step 3: Run the Test

Execute the script from your terminal:

```bash
python test_proxies.py
```

You will see the program check for binaries, parse your configs, and then print a clean, sorted list of working and non-working proxies.

### What's Next?

You've successfully tested your proxies! Now you can explore the core concepts to understand how the library works under the hood, or dive into the API Reference to build more advanced applications.