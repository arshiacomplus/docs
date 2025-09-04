# The Connection Tester

The `ConnectionTester` is the high-performance heart of the library, designed to quickly and accurately determine the quality of a large number of proxy configurations.

## The Core Problem

Testing proxy connections one-by-one is incredibly slow. Each test involves:
1.  Starting a client process (e.g., `xray.exe`).
2.  Waiting for it to initialize.
3.  Making a network request through it.
4.  Shutting the process down.

Repeating this for dozens of configs can take minutes.

## The Smart Solution: Merged and Concurrent Testing

The `ConnectionTester` uses a highly optimized, two-pronged strategy to solve this problem.

### 1. Xray: Merged Configuration

Instead of running one Xray process per config, the tester creates a **single, merged Xray instance**. Here's how:
-   It generates one large `config.json` file in memory.
-   For each Xray-compatible proxy (`vless`, `vmess`, `trojan`, etc.), it adds an **outbound** configuration.
-   For each outbound, it creates a corresponding **inbound** SOCKS proxy, each listening on a unique local port (e.g., `127.0.0.1:20801`, `127.0.0.1:20802`, etc.).
-   **Routing rules** are added to map each inbound port directly to its corresponding outbound proxy.

This way, one `xray.exe` process can serve dozens of testable proxies simultaneously, drastically reducing overhead.

### 2. Hysteria: Individual, Monitored Instances

Hysteria's client is designed to connect to a single server and does not support a merged configuration. For these, the tester:
-   Starts a separate `hysteria.exe` process for each Hysteria config.
-   Assigns a unique local IP and port for each instance's SOCKS proxy (e.g., `127.0.0.2:30800`, `127.0.0.3:30801`).
-   Intelligently waits for the proxy port to become active before starting the test, avoiding race conditions.

### 3. The Go Test Engine

Once all the local SOCKS proxies (from both Xray and Hysteria) are running, the tester passes a list of all these local endpoints to the Go test engine. The engine then tests all of them **concurrently**, measures their latency, and returns the results.

!!! tip "Performance"
    This combined strategy allows `python-v2ray` to test a massive number of configurations in a fraction of the time a sequential approach would take.