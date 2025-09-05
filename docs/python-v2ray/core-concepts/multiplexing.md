lang: en
direction: ltr

# Core Concepts: Multiplexing (Mux)

Multiplexing, or "Mux," is a powerful feature in protocols like VLESS and VMess that significantly improves performance by reusing a single underlying TCP connection for multiple data streams.

### What is Mux?

Imagine a single-lane road versus a multi-lane highway.

-   **Without Mux (Single Lane):** Every time your browser wants to download a new piece of a website (an image, a script, etc.), it has to create a brand new connection. This involves a slow and costly process called a TCP and TLS handshake for every single request.

-   **With Mux (Multi-Lane Highway):** The client opens **one single, robust connection** to the server (the highway). Then, all subsequent data streams (the cars) travel through this existing connection simultaneously.

### Why is it Important?

Enabling Mux has several key benefits:

-   **Reduced Latency:** By eliminating the need for repeated handshakes, Mux drastically reduces the time it takes to start new requests. This is especially noticeable on websites with many small assets.
-   **Improved Throughput:** It leads to more efficient use of the network connection, which can improve overall download and upload speeds.
-   **Evasion Potential:** In some cases, the traffic pattern of a Mux-enabled connection can look different from standard VPN traffic, which may help with avoiding detection.

---

## Enabling Mux with `python-v2ray`

Our library provides two flexible ways to enable and configure Mux.

### Method 1: Per-Config (via URI)

This is the most precise method. The custom `mvless` protocol scheme allows you to enable Mux and set its concurrency directly within the configuration link.

!!! example "Enabling Mux in an `mvless` URI"
    Notice the `mux=ON` and `muxConcurrency=8` parameters in the query string.

    ```python
    from python_v2ray.config_parser import parse_uri

    # Example mvless URI with Mux enabled
    uri = "mvless://UUID@example.com:443?mux=ON&muxConcurrency=8&type=ws#MyMuxConfig"
    
    params = parse_uri(uri)
    
    if params:
        print(f"Mux Enabled: {params.mux_enabled}")
        print(f"Mux Concurrency: {params.mux_concurrency}")
    ```
    **Output:**
    ```
    Mux Enabled: True
    Mux Concurrency: 8
    ```

### Method 2: Global Setting (via ConnectionTester)

You can apply a default Mux configuration to all Xray-compatible proxies that don't already have Mux enabled in their URI. This is done by passing a `mux_config` dictionary to the `test_uris` method.

!!! example "Applying a Global Mux Setting"

    ```python
    from python_v2ray.tester import ConnectionTester
    from python_v2ray.config_parser import parse_uri

    # Define your global Mux settings
    global_mux_settings = {"enabled": True, "concurrency": 8}
    
    # This standard vless config does NOT have Mux defined in its URL
    uris = ["vless://UUID@example.com:443?type=ws#StandardVless"]
    parsed_configs = [parse_uri(uri) for uri in uris]
    
    # Initialize the tester
    tester = ConnectionTester(vendor_path="./vendor", core_engine_path="./core_engine")
    
    # Pass the global config to the tester
    # The tester will now apply these Mux settings to the 'StandardVless' config
    results = tester.test_uris(
        parsed_params=parsed_configs,
        mux_config=global_mux_settings
    )
    ```

### Priority Rules

!!! tip "Important: Per-Config Overrides Global"
    The library uses a clear priority system:

    **Settings from a URI always take precedence over global settings.**

    For example, if you provide a global `mux_config` but also test an `mvless` URI that has `mux=ON`, the settings from the URI will be used for that specific test, and the global settings will be ignored for that config. This gives you the ultimate flexibility.