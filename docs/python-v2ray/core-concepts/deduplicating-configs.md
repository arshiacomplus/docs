# Deduplicating Configurations

When working with large lists of configurations, especially from multiple subscription links, it's common to encounter duplicates. These are profiles that are functionally identical (same server, port, and user ID) but may have different tags or remarks. Running tests on these duplicates is inefficient and clutters your results.

The library provides a simple yet powerful utility function, `deduplicate_configs`, to clean up your list.

## The Deduplication Strategy

The function intelligently identifies duplicates by focusing on the **core properties** of a configuration, while **intentionally ignoring the `tag`**.

-   **Unique Key**: For each configuration, a unique key is generated based on properties like `protocol`, `address`, `port`, and `id`/`password`.
-   **First-Come, First-Served**: The function keeps the *first* occurrence of each unique configuration it encounters and discards all subsequent duplicates.

This ensures that your final list is clean and ready for efficient testing.

## Practical Example

This minimal example demonstrates how to use `deduplicate_configs` to clean a list of `ConfigParams` objects.

```python
# examples/09_deduplicate_configs.py

import os
import sys

# Add project root to path to find our library
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from python_v2ray.config_parser import load_configs, deduplicate_configs

def main():
    """
    * A minimal example to demonstrate how to remove duplicate configurations
    * from a list, ignoring their tags (# remarks).
    """

    # --- 1. Define a list with duplicate configurations ---
    # Note: The first two VLESS configs are identical except for their tag.
    raw_uris = [
        "vless://abcdef@example.com:443?type=ws#VLESS-Config-1",
        "vless://abcdef@example.com:443?type=ws#VLESS-Config-2-DUPLICATE",
        "trojan://password@anotherexample.com:443#Trojan-Config-UNIQUE",
    ]

    print("--- Initial List of Raw URIs ---")
    for uri in raw_uris:
        print(f"- {uri}")

    # --- 2. Load the configs into ConfigParams objects ---
    parsed_configs = load_configs(source=raw_uris)
    print(f"\n* Initially parsed {len(parsed_configs)} configurations.")

    # --- 3. Apply the deduplication function ---
    print("\n--- Applying Deduplication (Ignoring Tags) ---")
    unique_configs = deduplicate_configs(parsed_configs)
    
    # --- 4. Display the final, clean list ---
    print(f"\n* Found {len(unique_configs)} unique configurations.")
    print("Tags of final unique configs:", [p.tag for p in unique_configs])

if __name__ == "__main__":
    main()
```

### Expected Output:
```
--- Initial List of Raw URIs ---
- vless://abcdef@example.com:443?type=ws#VLESS-Config-1
- vless://abcdef@example.com:443?type=ws#VLESS-Config-2-DUPLICATE
- trojan://password@anotherexample.com:443#Trojan-Config-UNIQUE

* Initially parsed 3 valid configurations.

--- Applying Deduplication (Ignoring Tags) ---

* Found 2 unique configurations.
Tags of final unique configs: ['VLESS-Config-1', 'Trojan-Config-UNIQUE']
```

## API Reference

### `deduplicate_configs()`

```python
def deduplicate_configs(configs: List[ConfigParams]) -> List[ConfigParams]:
```

-   **`configs`**: A list of `ConfigParams` objects to be cleaned.
-   **Returns**: A new list containing only the unique `ConfigParams` objects.
