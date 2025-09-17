# Speed Testing: Download & Upload

While latency tests confirm if a connection is active, only a speed test can reveal its true real-world performance. The `python_v2ray` library provides dedicated, high-performance tools to measure both download and upload throughput for your proxy configurations.

To achieve maximum accuracy, these tests are orchestrated by Python but executed by the project's compiled Go engine, combining Python's ease of use with Go's superior networking performance.

This guide covers the two core methods for speed testing:

-   `test_speed()` for download speed.
-   `test_upload()` for upload speed.

***

## How It Works

The speed testing process is designed for efficiency and concurrency:

1.  **Python Orchestration**: Your script prepares a list of configurations and starts the necessary proxy processes (`XrayCore` or `HysteriaCore`) on local ports.
2.  **Go Execution**: Python then passes a list of test jobs (e.g., "download 10MB from this URL via local port 20800") to the `core_engine` application.
3.  **Concurrent Testing**: The Go engine runs all download or upload tests in parallel, delivering results significantly faster than sequential testing.
4.  **Cleanup**: Once the Go engine returns the speeds, Python ensures all background proxy processes are properly terminated.

***

## Practical Example

This example demonstrates how to run both download and upload speed tests for a list of configurations.

```python
# examples/06_speed_tester.py

import os
import sys
from pathlib import Path

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from python_v2ray.downloader import BinaryDownloader
from python_v2ray.tester import ConnectionTester
from python_v2ray.config_parser import parse_uri

def main():
    project_root = Path(__file__).parent.parent
    
    downloader = BinaryDownloader(project_root)
    downloader.ensure_all()

    test_uris = [
        "vless://YOUR_UUID@your.domain.com:443?type=ws#VLESS-Config",
        "hysteria2://YOUR_PASSWORD@your.domain.com:443?sni=your.domain.com#Hysteria-Config",
    ]
    
    parsed_configs = [p for p in (parse_uri(uri) for uri in test_uris) if p and "YOUR_" not in str(p)]

    if not parsed_configs:
        print("No valid configurations found. Please edit the 'test_uris' list.")
        return

    tester = ConnectionTester(
        vendor_path=str(project_root / "vendor"), 
        core_engine_path=str(project_root / "core_engine")
    )

    # --- 1. Run Download Speed Test ---
    print("\n" + "="*20 + " RUNNING DOWNLOAD TEST " + "="*20)
    download_results = tester.test_speed(
        parsed_params=parsed_configs,
        download_bytes=20000000  # 20 MB
    )
    
    if download_results:
        # Sort results from fastest to slowest
        sorted_dl = sorted(download_results, key=lambda x: x.get('download_mbps', 0), reverse=True)
        for res in sorted_dl:
            if res.get('status') == 'success':
                print(f"* Tag: {res['tag']:<30} | Download Speed: {res['download_mbps']:.2f} Mbps")
            else:
                print(f"! Tag: {res['tag']:<30} | Download FAILED | Reason: {res.get('status')}")

    # --- 2. Run Upload Speed Test ---
    print("\n" + "="*20 + " RUNNING UPLOAD TEST " + "="*20)
    upload_results = tester.test_upload(
        parsed_params=parsed_configs,
        upload_bytes=10000000  # 10 MB
    )

    if upload_results:
        # Sort results from fastest to slowest
        sorted_ul = sorted(upload_results, key=lambda x: x.get('upload_mbps', 0), reverse=True)
        for res in sorted_ul:
            if res.get('status') == 'success':
                print(f"* Tag: {res['tag']:<30} | Upload Speed: {res['upload_mbps']:.2f} Mbps")
            else:
                print(f"! Tag: {res['tag']:<30} | Upload FAILED | Reason: {res.get('status')}")

if __name__ == "__main__":
    main()
```

***

## API Reference

### `ConnectionTester.test_speed()`

Performs a download speed test for a list of configurations.

```python
def test_speed(
    self, 
    parsed_params: List[ConfigParams], 
    download_bytes: int = 10000000, 
    download_url: str = "https://speed.cloudflare.com/__down",
    timeout: int = 60
) -> List[Dict[str, Any]]:
```

-   **Returns**: A list of dictionaries, each containing `tag`, `status`, `download_mbps`, and `bytes_downloaded`.

### `ConnectionTester.test_upload()`

Performs an upload speed test for a list of configurations.

```python
def test_upload(
    self, 
    parsed_params: List[ConfigParams], 
    upload_bytes: int = 5000000, 
    upload_url: str = "https://speed.cloudflare.com/__up",
    timeout: int = 60
) -> List[Dict[str, Any]]:
```

-   **Returns**: A list of dictionaries, each containing `tag`, `status`, `upload_mbps`, and `bytes_uploaded`.