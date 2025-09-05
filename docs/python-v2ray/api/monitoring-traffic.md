lang: en
direction: ltr

# Advanced Usage: Monitoring Live Traffic

One of the most powerful features of `python-vray` is its ability to connect to a running Xray instance and monitor real-time data usage. This is achieved by leveraging Xray's built-in gRPC API service.

This guide shows you how to start a proxy and watch its live uplink and downlink traffic.

!!! warning "Xray-Only Feature"
    This functionality is exclusive to Xray-compatible protocols (`vless`, `vmess`, `trojan`, etc.). It does not work with Hysteria.

## The Code

The process involves three key steps:
1.  **Enable the API** in the `XrayConfigBuilder` and assign it a specific port.
2.  Pass that `api_port` when initializing the `XrayCore` instance.
3.  Use a loop to call the `xray.get_stats()` method, targeting the outbound you want to monitor.

Here is the complete script:

```python
import time
from pathlib import Path
from python_v2ray.core import XrayCore
from python_v2ray.config_parser import parse_uri, XrayConfigBuilder

def monitor_proxy_traffic():
    project_root = Path("./")
    
    # --- Step 1: Configuration ---
    
    # A working Xray-compatible URI
    proxy_uri = "vless://YOUR_UUID@your.domain.com:443?security=tls&sni=your.domain.com#MyProxy"
    
    # Define a tag for the outbound we want to monitor
    outbound_tag = "proxy_main" 
    
    # Choose a free port for the gRPC API service
    api_port = 62789
    
    # --- Step 2: Build the Xray Config with API Enabled ---
    
    params = parse_uri(proxy_uri)
    if not params:
        print("Invalid URI.")
        return
        
    # Assign our custom tag to the parsed config
    params.tag = outbound_tag

    print(f"* Building config to monitor outbound with tag: '{outbound_tag}'")
    builder = XrayConfigBuilder()
    
    # !! CRITICAL: Enable the API service on the specified port
    builder.enable_api(port=api_port)
    
    builder.add_inbound({
        "port": 10808, "listen": "127.0.0.1", "protocol": "socks"
    })
    
    outbound_config = builder.build_outbound_from_params(params)
    builder.add_outbound(outbound_config)

    # --- Step 3: Run XrayCore and Start Monitoring ---
    
    print("* Starting Xray with API enabled...")
    
    # !! CRITICAL: Pass the api_port to the XrayCore constructor
    with XrayCore(vendor_dir=str(project_root/"vendor"), config_builder=builder, api_port=api_port) as xray:
        if not xray.is_running():
            print("! Xray failed to start.")
            return

        print(f"\n* Xray is running. SOCKS on 10808. API on {api_port}.")
        print("* Now, generate some traffic through the SOCKS proxy (e.g., watch a video).")
        print("* Press Ctrl+C to stop.\n")

        try:
            while True:
                time.sleep(2)
                stats = xray.get_stats(tag=outbound_tag)
                
                if stats:
                    # Convert bytes to Megabytes (MB)
                    uplink_mb = stats['uplink'] / (1024 * 1024)
                    downlink_mb = stats['downlink'] / (1024 * 1024)
                    print(
                        f"\r* Live Stats for '{outbound_tag}': "
                        f"Uplink: {uplink_mb:.2f} MB | "
                        f"Downlink: {downlink_mb:.2f} MB   ",
                        end=""
                    )
                else:
                    # This message appears until the first byte of traffic is sent
                    print(f"\r* Waiting for traffic on tag '{outbound_tag}'...", end="")
        
        except KeyboardInterrupt:
            print("\n* User stopped the stats viewer.")

    print("\n* Monitoring finished. Xray has been stopped.")
if __name__ == "__main__":
    monitor_proxy_traffic()
```