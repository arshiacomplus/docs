lang: en
direction: ltr

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