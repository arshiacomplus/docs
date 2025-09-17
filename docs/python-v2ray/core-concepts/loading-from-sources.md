# Loading Configs from Different Sources

Manually managing individual configuration links can be tedious. The library provides a powerful and flexible universal loader, `load_configs`, to import profiles from various sources, including remote subscription links, local files, and Python lists.

This function acts as the primary entry point for getting configurations into the system before testing or processing.

## Key Features

-   **Subscription Link Support**: Directly fetches and decodes configurations from remote subscription URLs.
-   **Intelligent Decoding**: Automatically handles both **Base64-encoded** and **plain-text** subscription content.
-   **Multiple Sources**: Accepts a URL, a local file path, or a Python list of URIs as input.
-   **Robust Parsing**: Each raw URI is then processed by the internal `parse_uri` function to create a standardized `ConfigParams` object.

## Using the `load_configs` Function

The behavior of the function is controlled by two parameters: `source` and `is_subscription`.

### Scenario 1: Loading from a Subscription URL

This is the most common use case. Provide the URL and set the `is_subscription` flag to `True`.

```python
from python_v2ray.config_parser import load_configs

sub_url = "https://your.subscription.link/path"

# The flag tells the function to fetch the URL and decode its content
parsed_configs = load_configs(source=sub_url, is_subscription=True)

print(f"Loaded {len(parsed_configs)} configs from the subscription.")
```

### Scenario 2: Loading from a Local File

You can load configurations from a local text file. The loader handles two types of files automatically.

#### a) File with one URI per line

```python
# --- contents of my_configs.txt ---
# vless://...
# trojan://...

from pathlib import Path
from python_v2ray.config_parser import load_configs

file_path = Path("my_configs.txt")

# No flag is needed; this is the default behavior for files
parsed_configs = load_configs(source=file_path)
```

#### b) File containing a single subscription link

```python
# --- contents of my_sub.txt ---
# https://another.subscription.link/path

from pathlib import Path
from python_v2ray.config_parser import load_configs

file_path = Path("my_sub.txt")

# The flag tells the function to read the URL from the file and then fetch it
parsed_configs = load_configs(source=file_path, is_subscription=True)
```

### Scenario 3: Loading from a Python List

If you already have your configuration URIs in a Python list, you can pass it directly.

```python
from python_v2ray.config_parser import load_configs

my_uri_list = [
    "vless://abcdef@example.com:443?type=ws#Config-1",
    "trojan://password@anotherexample.com:443#Config-2",
]

# This is the most direct way to parse a list of configs
parsed_configs = load_configs(source=my_uri_list)
```

## API Reference

### `load_configs()`

```python
def load_configs(
    source: Union[str, List[str], Path], 
    is_subscription: bool = False
) -> List[ConfigParams]:
```

-   **`source`**: The input source. Can be:
    -   A `str` representing a URL or a single URI.
    -   A `list` of URI strings.
    -   A `pathlib.Path` object pointing to a local file.
-   **`is_subscription`** (optional): A boolean flag. Set to `True` if the `source` (or the content of the source file) is a subscription link that needs to be fetched and decoded. Defaults to `False`.
-   **Returns**: A list of `ConfigParams` objects. **This function always returns a list**, even if it's empty.