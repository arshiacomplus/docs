# Installation

Getting `python-v2ray` installed is quick and easy. All you need is a supported version of Python.

## Prerequisites

- **Python 3.8+**
- **pip** (Python's package installer)

## Standard Installation

Install the latest stable version directly from the Python Package Index (PyPI) with a single command:

```bash
pip install python-v2ray
```

## Verifying the Installation

To ensure the library was installed correctly, you can open a Python interpreter and import it:

```bash
python -c "import python_v2ray; print('python-v2ray installed successfully!')"
```

If this command runs without errors, you are ready to go!

!!! info "How Binaries Are Handled"
    The first time you use a feature that requires `Xray-core`, `Hysteria`, or the `core_engine`, the library will automatically download the correct executable for your operating system (Windows, macOS, or Linux) and architecture.

    These files are stored in `vendor/` and `core_engine/` subdirectories within your project, so they only need to be downloaded once.