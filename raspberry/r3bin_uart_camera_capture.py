from pathlib import Path
import time
import cv2
import numpy as np
import serial

try:
    from ai_edge_litert.interpreter import Interpreter
except ImportError:
    from tflite_runtime.interpreter import Interpreter

BASE = Path.home() / "r3bin"
MODEL_PATH = BASE / "model" / "model_unquant.tflite"
LABELS_PATH = BASE / "model" / "labels.txt"
CAPTURE_DIR = BASE / "captures"

SERIAL_PORT = "/dev/serial0"
BAUD_RATE = 9600
CONFIDENCE_MIN = 0.60

CAPTURE_DIR.mkdir(parents=True, exist_ok=True)


def load_labels(path):
    labels = []

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            text = line.strip()

            if not text:
                continue

            parts = text.split(maxsplit=1)

            if len(parts) == 2 and parts[0].isdigit():
                text = parts[1]

            labels.append(text)

    return labels


def normalize_label(label):
    text = label.strip().lower()
    text = text.replace("-", "_").replace(" ", "_")

    if "metal" in text:
        return "METAL"

    if "organic" in text:
        return "ORGANIC"

    if "paper" in text or "cardboard" in text or "carboard" in text or "carton" in text:
        return "PAPER"

    if "plastic" in text:
        return "PLASTIC"

    if "batter" in text or "pila" in text:
        return "BATTERIES"

    if "no_object" in text or "empty" in text or "none" in text:
        return "NO_OBJECT"

    return "OTHER"


def prepare_input(frame, width, height, input_dtype):
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (width, height))
    input_data = np.expand_dims(resized, axis=0)

    if input_dtype == np.float32:
        input_data = input_data.astype(np.float32)
        input_data = (input_data / 127.5) - 1.0
    else:
        input_data = input_data.astype(input_dtype)

    return input_data


labels = load_labels(LABELS_PATH)

interpreter = Interpreter(model_path=str(MODEL_PATH))
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

input_shape = input_details[0]["shape"]
height = input_shape[1]
width = input_shape[2]
input_dtype = input_details[0]["dtype"]


def classify_once():
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Camera error")
        return "NO_OBJECT"

    time.sleep(0.4)

    frame = None

    for _ in range(6):
        ok, captured_frame = cap.read()

        if ok:
            frame = captured_frame

        time.sleep(0.08)

    cap.release()

    if frame is None:
        print("No frame")
        return "NO_OBJECT"

    timestamp = time.strftime("%Y%m%d_%H%M%S")
    image_path = CAPTURE_DIR / f"capture_{timestamp}.jpg"
    cv2.imwrite(str(image_path), frame)

    input_data = prepare_input(frame, width, height, input_dtype)

    interpreter.set_tensor(input_details[0]["index"], input_data)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]["index"])[0]
    best_index = int(np.argmax(output))
    confidence = float(output[best_index])

    raw_label = labels[best_index]
    category = normalize_label(raw_label)

    if confidence < CONFIDENCE_MIN and category != "NO_OBJECT":
        category = "OTHER"

    print(f"Photo: {image_path.name}")
    print(f"Prediction: {raw_label} -> {category} ({confidence:.2f})")

    return category


def main():
    print("R3Bin Raspberry vision ready")
    print("Waiting for CAPTURE...")

    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=0.2)
    time.sleep(2)

    while True:
        line = ser.readline().decode("utf-8", errors="ignore").strip()

        if not line:
            continue

        print(f"ATmega says: {line}")

        if line == "CAPTURE":
            category = classify_once()
            response = category + "\n"

            ser.write(response.encode("utf-8"))
            ser.flush()

            print(f"Sent: {category}")
            print("Waiting for CAPTURE...")


if __name__ == "__main__":
    main()
