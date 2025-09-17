# Proxy Chaining ("WARP on Any")

This is one of the most powerful features of the library, allowing you to route the traffic of any Xray-compatible configuration through a final exit-point proxy. This is commonly used to enhance privacy or bypass complex network restrictions by creating a "WARP on Any" setup, where all your traffic exits through a Cloudflare WARP (WireGuard) endpoint.

The implementation is seamless: once you provide a WARP configuration, the `XrayConfigBuilder` automatically configures all other outbounds to use it as their `dialerProxy`.

## How It Works

Instead of connecting directly to the internet, a primary outbound (like VLESS or Trojan) first routes its traffic through the specified WARP outbound. The traffic flow looks like this:

`Your App` -> `Local SOCKS Inbound` -> `Primary Outbound (e.g., VLESS)` -> `WARP Outbound (WireGuard)` -> `Internet`

This entire chain is managed within a single, merged Xray instance for maximum efficiency.

## Practical Example: Testing Connectivity through WARP

This example demonstrates how to test the connectivity (ping) of several configurations that are all forced to route their traffic through a single WARP profile.

```python
# examples/07_warp_tester.py

import os
import sys
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from python_v2ray.downloader import BinaryDownloader
from python_v2ray.tester import ConnectionTester
from python_v2ray.config_parser import parse_uri

def main():
    project_root = Path(__file__).parent.parent
    
    # Ensure all necessary binaries are ready
    downloader = BinaryDownloader(project_root)
    downloader.ensure_all()

    # --- 1. Define your WARP config (must be a WireGuard URI) ---
    warp_uri = "wireguard://YOUR_PRIVATE_KEY@engage.cloudflareclient.com:2408?address=172.16.0.2/32&publicKey=...#WARP-Profile"

    # --- 2. Define the primary configs to test THROUGH WARP ---
    test_uris = [
        "vless://YOUR_UUID@your.domain.com:443?type=ws#VLESS-through-WARP",
        "trojan://YOUR_PASSWORD@another.domain.com:443#Trojan-through-WARP",
        # You can even chain another WireGuard config through the main WARP config
        # "wireguard://ANOTHER_PRIVATE_KEY@...#WG-on-WARP" 
    ]
    
    # --- 3. Parse all configurations ---
    parsed_warp_config = parse_uri(warp_uri)
    parsed_test_configs = [p for p in (parse_uri(uri) for uri in test_uris) if p]

    # --- Input Validation ---
    if not parsed_warp_config or "YOUR_PRIVATE_KEY" in warp_uri:
        print("! Please provide a valid WARP WireGuard URI.")
        return
    if not parsed_test_configs:
        print("! No valid primary configurations found to test.")
        return

    tester = ConnectionTester(
        vendor_path=str(project_root / "vendor"), 
        core_engine_path=str(project_root / "core_engine")
    )

    # --- 4. Run the test, passing the WARP config to the `warp_config` parameter ---
    print(f"\n--- Running Connectivity Test with WARP-on-Any enabled ---")
    results = tester.test_uris(
        parsed_params=parsed_test_configs,
        warp_config=parsed_warp_config,
        timeout=30  # Allow a longer timeout for chained connections
    )

    # --- 5. Print the results ---
    if results:
        print("\n" + "="*20 + " WARP ON ANY PING TEST RESULTS " + "="*20)
        sorted_results = sorted(results, key=lambda x: x.get('ping_ms', 9999))
        for result in sorted_results:
            tag = result.get('tag', 'N/A')
            ping = result.get('ping_ms', -1)
            status = result.get('status', 'error')
            
            if status == 'success':
                print(f"* Tag: {tag:<30} | Ping: {ping:>4} ms | Status: SUCCESS")
            else:
                print(f"! Tag: {tag:<30} | Ping: ---- ms | Status: FAILED ({status})")
    else:
        print("! No results were received from the tester.")

if __name__ == "__main__":
    main()
```

## API Reference: The `warp_config` Parameter

To enable proxy chaining, a new optional parameter has been added to all primary testing methods:

-   `test_uris(..., warp_config: Optional[ConfigParams] = None)`
-   `test_speed(..., warp_config: Optional[ConfigParams] = None)`
-   `test_upload(..., warp_config: Optional[ConfigParams] = None)`

Simply pass a parsed `ConfigParams` object of a valid WireGuard configuration to this parameter, and the `ConnectionTester` will handle the rest.

## Important Considerations

-   The `warp_config` **must** be a valid `ConfigParams` object generated from a WireGuard URI.
-   This chaining feature is handled by Xray's `dialerProxy`. Therefore, it only applies to protocols that are managed within the merged Xray instance (VLESS, VMess, Trojan, etc.). It does **not** apply to protocols like Hysteria that are launched in a separate, independent process by the Go test engine.