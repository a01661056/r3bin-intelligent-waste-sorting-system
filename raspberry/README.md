# Raspberry Pi Vision Subsystem

This folder contains the Raspberry Pi script and model files used for local waste classification.

## Files

- `r3bin_uart_camera_capture.py`: UART + camera + TensorFlow Lite inference loop.
- `model_unquant.tflite`: exported Teachable Machine TensorFlow Lite model.
- `labels.txt`: model label file.

## Runtime Behavior

The script waits for the ATmega16 to send:

```text
CAPTURE
```

It then captures an image from the Logitech C270 webcam, runs TensorFlow Lite inference, normalizes the label, and responds with one of:

```text
METAL
ORGANIC
PAPER
PLASTIC
BATTERIES
OTHER
NO_OBJECT
```

## Expected Raspberry Pi Paths

The final deployment expected:

```text
~/r3bin/model/model_unquant.tflite
~/r3bin/model/labels.txt
~/r3bin/captures/
```

The script stores timestamped captures for debugging and dataset improvement.

## Run

```bash
python3 r3bin_uart_camera_capture.py
```

## Dependencies

- Python 3
- OpenCV
- NumPy
- pyserial
- ai-edge-litert or tflite-runtime

