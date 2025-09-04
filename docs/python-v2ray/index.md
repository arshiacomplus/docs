lang: fa

# Welcome to python-v2ray

**A powerful, high-level Python wrapper for managing and testing V2Ray/Xray-core and Hysteria clients.**

This library abstracts away the complexities of binary management, multi-format config parsing, and concurrent connection testing, providing a clean, streamlined, and "Pythonic" API for developers. It's designed to be both powerful for advanced users and simple for those just getting started.

<div class="grid cards" markdown>

-   :material-clock-fast:{ .lg .middle } **High-Speed Concurrent Testing**

    ---

    Test dozens of proxies in seconds with a high-performance Go-based test engine.

-   :material-download-box-outline:{ .lg .middle } **Automated Binary Management**

    ---

    Automatically downloads and manages the correct Xray and Hysteria binaries for your OS.

-   :material-puzzle-edit-outline:{ .lg .middle } **Unified Config Parser**

    ---

    Seamlessly parse `vless`, `vmess`, `trojan`, `ss`, and `hysteria2` links into a standard object.

-   :material-api:{ .lg .middle } **Fluent & Powerful API**

    ---

    Programmatically build configs, run processes, and fetch live traffic stats with a clean API.

</div>

[Get Started in 5 Minutes](./getting-started/installation.md){ .md-button .md-button--primary } [View on GitHub](https://github.com/arshiacomplus/python_v2ray){ .md-button }

---

### File: `docs/getting-started/installation.md`

```markdown
# Installation

Getting `python-v2ray` installed is quick and easy. All you need is a supported version of Python.

## Prerequisites

- **Python 3.8+**
- **pip** (Python's package installer)

## Standard Installation

Install the latest stable version directly from the Python Package Index (PyPI) with a single command:

```bash
pip install python-v2ray
```

## Verifying the Installation

To ensure the library was installed correctly, you can open a Python interpreter and import it:

```bash
python -c "import python_v2ray; print('python-v2ray installed successfully!')"
```

If this command runs without errors, you are ready to go!

!!! info "How Binaries Are Handled"
    The first time you use a feature that requires `Xray-core`, `Hysteria`, or the `core_engine`, the library will automatically download the correct executable for your operating system (Windows, macOS, or Linux) and architecture.

    These files are stored in `vendor/` and `core_engine/` subdirectories within your project, so they only need to be downloaded once.
```

---

### File: `docs/getting-started/quick-start.md`

```markdown
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
                clean_status = status.split('|')[0].strip()
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
```

---

### File: `docs/core-concepts/architecture.md`

```markdown
# Architecture

`python-v2ray` employs a smart hybrid architecture to achieve both high performance and ease of use. It combines a high-level Python orchestrator with a low-level Go test engine.

### The Two Main Components

1.  **Python Orchestrator**
    This is the user-facing part of the library, written entirely in Python. It handles:
    -   **API Layer**: Providing the clean, "Pythonic" API (`XrayCore`, `ConnectionTester`, etc.).
    -   **Configuration Logic**: Parsing diverse URI formats and building complex JSON configs.
    -   **Process Management**: Starting, stopping, and monitoring the underlying `xray` and `hysteria` processes.
    -   **Binary Management**: Downloading the necessary executables for the user's platform.

2.  **Go Test Engine (`core_engine`)**
    This is a small, self-contained, compiled Go program. Its sole purpose is to perform network operations as fast as possible. It receives a list of test jobs from the Python orchestrator and:
    -   Performs concurrent TCP/SOCKS dialing.
    -   Measures connection latency to a target URL.
    -   Reports results (success, failure, latency) back to Python.

### Communication Flow

The two components communicate via a simple and efficient Inter-Process Communication (IPC) protocol:

1.  The **Python Orchestrator** serializes a list of "test jobs" into a JSON string.
2.  It executes the **Go Test Engine** as a subprocess.
3.  It pipes the JSON string to the Go engine's `stdin`.
4.  The **Go Engine** runs all tests concurrently (using goroutines).
5.  It gathers the results, serializes them into a JSON string, and prints it to `stdout`.
6.  The **Python Orchestrator** reads the `stdout` from the subprocess and deserializes the JSON results.

!!! success "The Best of Both Worlds"
    This hybrid design allows you to benefit from Python's rapid development and rich ecosystem while leveraging Go's exceptional performance for concurrent networking tasks.
```

---

### File: `docs/core-concepts/config-parser.md`

```markdown
# Configuration Parsing

One of the biggest challenges in the proxy ecosystem is the variety of complex and inconsistent configuration formats. `python-v2ray` solves this with a powerful and unified parsing engine.

### The Challenge

Proxy configurations can be shared as URIs (`vless://...`), Base64-encoded JSON (`vmess://...`), or legacy formats (`ss://...`). Each protocol has its own unique set of parameters.

### The Solution: A Universal Data Model

The library's parsing engine is built around two key components:

1.  **`parse_uri(uri: str)` function:** This is the main entry point. It takes any supported configuration URI as a string, detects its protocol, and delegates it to the correct specialized parser.

2.  **`ConfigParams` Dataclass:** This is the "lingua franca" of the library. No matter what the input format is, `parse_uri` always returns a standardized `ConfigParams` object. This object contains all possible fields from every supported protocol, providing a consistent and predictable structure for the rest of the library to work with.

### How It Works: An Example

Let's see it in action.

```python
from python_v2ray.config_parser import parse_uri

vless_uri = "vless://8b63cf90-830c-4fd8-a911-9e84fd7a5898@example.com:443?security=tls&sni=example.com&type=ws#MyVLESS"

# The magic happens here
params = parse_uri(vless_uri)

# Now you have a clean, structured Python object
if params:
    print(f"Protocol: {params.protocol}")
    print(f"Address: {params.address}")
    print(f"Port: {params.port}")
    print(f"ID: {params.id}")
    print(f"Network: {params.network}")
    print(f"Security: {params.security}")
    print(f"Tag: {params.tag}")
```

**Expected Output:**
```
Protocol: vless
Address: example.com
Port: 443
ID: 8b63cf90-830c-4fd8-a911-9e84fd7a5898
Network: ws
Security: tls
Tag: MyVLESS
```

By converting all configs into a `ConfigParams` object, the library simplifies everything that comes after, from building Xray JSON files to running connection tests.
```

---

### And so on for the rest of the files...

I will stop here for you to review. If you are happy with this style and direction, I will write the content for the remaining files (`core-concepts/tester.md`, the entire `api/` section, and `license.md`) in exactly the same high-quality, professional manner.


Just say the word, and we'll complete the rest.
