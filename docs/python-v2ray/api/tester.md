lang: en
direction: ltr

# ConnectionTester

The `ConnectionTester` class provides the high-level API for running concurrent connectivity tests on a list of proxy configurations.

## Class Definition

```python
class ConnectionTester:
    def __init__(self, vendor_path: str, core_engine_path: str):
        ...
```

### Parameters

-   **`vendor_path`** `(str)`: Path to the directory containing `xray` and `hysteria` executables.
-   **`core_engine_path`** `(str)`: Path to the directory containing the `core_engine` Go executable.

## `test_uris(parsed_params: List[ConfigParams], ...) -> List[Dict[str, Any]]`

This is the main method of the class. It takes a list of `ConfigParams` objects, orchestrates the test, and returns the results.

-   **`parsed_params`** `(List[ConfigParams])`: A list of parsed configuration objects, typically from `parse_uri`.
-   **Returns**: A list of dictionaries, where each dictionary represents the test result for one proxy.

### Result Dictionary Structure

Each result dictionary in the returned list has the following keys:
-   **`tag`** `(str)`: The tag of the proxy.
-   **`ping_ms`** `(int)`: The connection latency in milliseconds. `-1` on failure.
-   **`status`** `(str)`: The result status. `"success"` on success, or a descriptive error message on failure (e.g., `"proxy_startup_timeout"`, `"failed_http: ..."`).

### Usage

```python
from python_v2ray.config_parser import parse_uri
from python_v2ray.tester import ConnectionTester

# 1. A list of proxy URIs
uris = [
    "vless://...",
    "hysteria2://...",
]

# 2. Parse them all
parsed_configs = [p for p in (parse_uri(uri) for uri in uris) if p]

# 3. Initialize and run the tester
tester = ConnectionTester(vendor_path="./vendor", core_engine_path="./core_engine")
results = tester.test_uris(parsed_configs)

# 4. Process results
for result in results:
    print(
        f"Tag: {result['tag']}, "
        f"Latency: {result['ping_ms']}ms, "
        f"Status: {result['status']}"
    )