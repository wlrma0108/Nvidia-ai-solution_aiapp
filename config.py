import os
import cv2

PADDLE_HOME = os.path.join(os.path.expanduser("~"), "paddle_ocr_home")
os.environ["PADDLE_HOME"] = PADDLE_HOME
os.environ.setdefault("PADDLE_PDX_MODEL_SOURCE", "HF")
os.makedirs(PADDLE_HOME, exist_ok=True)

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FRUIT_MODEL_PATH = os.path.join(SCRIPT_DIR, "best.pt")
COCO_MODEL_PATH = "yolov8n.pt"

FOOD_NAMES = {0: "Banana", 1: "Watermelon", 2: "Drink"}
RISK_MESSAGES = {
    0: "바나나는 당지수가 높아서 혈당을 빠르게 올릴 수 있습니다.",
    1: "수박은 수분이 많지만 당지수가 높아 대량 섭취 시 혈당을 급격히 올릴 수 있습니다.",
    2: "당 들어간 음료는 혈당을 급격히 올릴 수 있습니다. 라벨의 당류/탄수화물 양을 꼭 확인해야 합니다.",
}
FRUIT_CLASS_MAP = {0: 0, 1: 1}
COCO_DRINK_CLASS_IDS = {39, 40, 41}
ALLOW_GLOBAL = [0, 1, 2]

CONF_THRES_FRUIT = 0.85
CONF_THRES_DRINK = 0.45
IOU_THRES = 0.50
MAX_AGE = 10
IOU_MATCH = 0.30
CENTER_GATE_SCALE = 0.6

AR_RANGE = {0: (0.25, 6.00), 1: (0.60, 2.00), 2: (0.25, 4.00)}
MIN_AREA_FRAC = {0: 0.0015, 1: 0.0020, 2: 0.0015}

STARTUP_SKIP_FRAMES = 10
MIN_HITS = 8
EMA_ON_THRES = 0.80
VERIFY_WINDOW = 15
VERIFY_KEEP_MIN = 11
STAB_IOU_MIN = 0.50
STAB_CENTER_MAX_PX = 40
REVERIFY_CROP = True
REVERIFY_PAD = 12
REVERIFY_CONF = 0.88
COOLDOWN_FRAMES = 20

USE_CALORIE = True
KCAL_PER100 = {0: 89.0, 1: 30.0, 2: 45.0}
BASE_GRAMS = {0: 118.0, 1: 150.0, 2: 250.0}
GEOM = {
    0: {"thick_cm": 3.0, "density": 0.95, "shape_k": 0.60},
    1: {"thick_cm": 3.0, "density": 0.96, "shape_k": 0.80},
    2: {"thick_cm": 5.0, "density": 1.00, "shape_k": 0.50},
}

FONT = cv2.FONT_HERSHEY_SIMPLEX
