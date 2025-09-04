# ConfigParams & Parsers

This module provides the core data structures and functions for handling various proxy configuration formats.

## `ConfigParams` Dataclass

The `ConfigParams` object is the standardized, protocol-agnostic data structure that represents a parsed proxy configuration.

```python
@dataclass
class ConfigParams:
    protocol: str
    address: str
    port: int
    tag: Optional[str] = "proxy"
    id: Optional[str] = ""
    security: Optional[str] = ""
    network: Optional[str] = "tcp"
    # ... and many other protocol-specific fields
```

You typically don't create this object manually. Instead, you get it as a result from the `parse_uri` function.

## `parse_uri(config_uri: str) -> Optional[ConfigParams]`

This is the main function for parsing any supported proxy URI string. It automatically detects the protocol and uses the appropriate internal parser.

-   **`config_uri`** `(str)`: The full proxy URI (e.g., `"vless://..."`).
-   **Returns**: An instance of `ConfigParams` on success, or `None` if the URI is invalid or the protocol is unsupported.

### Usage

```python
from python_v2ray.config_parser import parse_uri

uri = "trojan://YOUR_PASSWORD@your.domain.com:443?sni=your.domain.com#MyTrojan"
params = parse_uri(uri)

if params:
    assert params.protocol == "trojan"
    assert params.password == "YOUR_PASSWORD"
    assert params.sni == "your.domain.com"
    assert params.tag == "MyTrojan"
```

## `XrayConfigBuilder`

A fluent API for programmatically constructing a complete Xray `config.json`.

### Usage

```python
from python_v2ray.config_parser import XrayConfigBuilder, parse_uri

# Start with a parsed params object
params = parse_uri("vless://...")

# Initialize the builder
builder = XrayConfigBuilder()

# Chain methods to build the config
builder.add_inbound({
    "protocol": "socks",
    "port": 10808,
    "listen": "127.0.0.1"
})

outbound_config = builder.build_outbound_from_params(params)
builder.add_outbound(outbound_config)

# Add default routing rules
builder.add_outbound({"protocol": "freedom", "tag": "direct"})
builder.add_outbound({"protocol": "blackhole", "tag": "block"})

# Get the final JSON string
final_json = builder.to_json()
print(final_json)