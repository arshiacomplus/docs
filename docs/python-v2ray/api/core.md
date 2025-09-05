lang: en
direction: ltr

# XrayCore

The `XrayCore` class is a low-level process manager for a single instance of the Xray-core client. It is designed to be used as a context manager (`with` statement) to ensure that the Xray process is started and stopped safely.

## Class Definition

```python
class XrayCore:
    def __init__(self, 
                 vendor_dir: str, 
                 config_builder: XrayConfigBuilder, 
                 api_port: Optional[int] = None, 
                 debug_mode: bool = False):
        ...
```

### Parameters

-   **`vendor_dir`** `(str)`: The path to the directory containing the `xray` executable.
-   **`config_builder`** `(XrayConfigBuilder)`: An instance of the config builder containing the full JSON configuration for this Xray instance.
-   **`api_port`** `(Optional[int])`: If provided, enables the Xray API on this port and allows for stat collection. Defaults to `None`.
-   **`debug_mode`** `(bool)`: If `True`, the temporary config file will not be deleted upon exit, allowing for inspection. Defaults to `False`.

## Usage Example: Running a Single Proxy

This is the canonical way to run a specific proxy configuration.

```python
from python_v2ray.core import XrayCore
from python_v2ray.config_parser import parse_uri, XrayConfigBuilder

# 1. Parse your configuration URI
uri = "vless://YOUR_UUID@your.domain.com:443?security=tls&sni=your.domain.com"
params = parse_uri(uri)

if params:
    # 2. Build the configuration
    builder = XrayConfigBuilder()
    builder.add_inbound({
        "port": 10808, "listen": "127.0.0.1", "protocol": "socks"
    })
    outbound = builder.build_outbound_from_params(params)
    builder.add_outbound(outbound)

    # 3. Run the XrayCore instance
    # The 'with' statement automatically starts and stops the process.
    with XrayCore(vendor_dir="./vendor", config_builder=builder) as xray:
        if xray.is_running():
            print("Xray is running. SOCKS proxy available on 127.0.0.1:10808")
            # Your application logic can go here...
            # The process will run until the 'with' block exits.
    
    print("Xray has been stopped.")
```

## Methods

### `start()`
Starts the Xray-core subprocess with the generated configuration.

### `stop()`
Terminates the Xray-core subprocess safely.

### `is_running() -> bool`
Returns `True` if the Xray process is currently running, `False` otherwise.

### `get_stats(tag: str, reset: bool = False) -> Optional[Dict[str, int]]`
If the API is enabled, this method queries the gRPC API for traffic statistics for a given outbound tag.

-   **`tag`** `(str)`: The tag of the outbound to query (e.g., `"proxy"`).
-   **`reset`** `(bool)`: If `True`, the counters will be reset to zero after the query.

Returns a dictionary like `{'uplink': bytes, 'downlink': bytes}` or `None` on failure.