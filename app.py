from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import base64
from io import BytesIO
from PIL import Image

from models import fruit_model, coco_model
from config import (
    FOOD_NAMES,
    RISK_MESSAGES,
    FRUIT_CLASS_MAP,
    COCO_DRINK_CLASS_IDS,
    CONF_THRES_FRUIT,
    CONF_THRES_DRINK,
    KCAL_PER100,
    BASE_GRAMS,
    AR_RANGE,
    MIN_AREA_FRAC,
)

app = Flask(__name__)

def detect_and_analyze(image_np):
    h, w = image_np.shape[:2]
    results = []

    fruit_res = fruit_model.predict(image_np, conf=CONF_THRES_FRUIT, verbose=False)
    if len(fruit_res) > 0 and fruit_res[0].boxes is not None:
        boxes = fruit_res[0].boxes
        for i in range(len(boxes)):
            cls_id = int(boxes.cls[i].item())
            conf = float(boxes.conf[i].item())
            x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy()

            global_cls = FRUIT_CLASS_MAP.get(cls_id)
            if global_cls is None:
                continue

            box_w = x2 - x1
            box_h = y2 - y1
            area_frac = (box_w * box_h) / (w * h)
            aspect_ratio = box_w / max(box_h, 1e-6)

            ar_min, ar_max = AR_RANGE.get(global_cls, (0.1, 10.0))
            min_area = MIN_AREA_FRAC.get(global_cls, 0.001)

            if not (ar_min <= aspect_ratio <= ar_max):
                continue
            if area_frac < min_area:
                continue

            grams = BASE_GRAMS.get(global_cls, 100.0)
            kcal_per_100 = KCAL_PER100.get(global_cls, 50.0)
            kcal = (grams / 100.0) * kcal_per_100

            results.append({
                'class_id': global_cls,
                'class_name': FOOD_NAMES[global_cls],
                'confidence': round(conf, 2),
                'bbox': [int(x1), int(y1), int(x2), int(y2)],
                'grams': round(grams, 1),
                'kcal': round(kcal, 1),
                'risk_message': RISK_MESSAGES.get(global_cls, '주의가 필요합니다.'),
            })

    coco_res = coco_model.predict(image_np, conf=CONF_THRES_DRINK, verbose=False)
    if len(coco_res) > 0 and coco_res[0].boxes is not None:
        boxes = coco_res[0].boxes
        for i in range(len(boxes)):
            cls_id = int(boxes.cls[i].item())
            if cls_id not in COCO_DRINK_CLASS_IDS:
                continue

            conf = float(boxes.conf[i].item())
            x1, y1, x2, y2 = boxes.xyxy[i].cpu().numpy()

            global_cls = 2

            box_w = x2 - x1
            box_h = y2 - y1
            area_frac = (box_w * box_h) / (w * h)
            aspect_ratio = box_w / max(box_h, 1e-6)

            ar_min, ar_max = AR_RANGE.get(global_cls, (0.1, 10.0))
            min_area = MIN_AREA_FRAC.get(global_cls, 0.001)

            if not (ar_min <= aspect_ratio <= ar_max):
                continue
            if area_frac < min_area:
                continue

            grams = BASE_GRAMS.get(global_cls, 250.0)
            kcal_per_100 = KCAL_PER100.get(global_cls, 45.0)
            kcal = (grams / 100.0) * kcal_per_100

            results.append({
                'class_id': global_cls,
                'class_name': FOOD_NAMES[global_cls],
                'confidence': round(conf, 2),
                'bbox': [int(x1), int(y1), int(x2), int(y2)],
                'grams': round(grams, 1),
                'kcal': round(kcal, 1),
                'risk_message': RISK_MESSAGES.get(global_cls, '주의가 필요합니다.'),
            })

    return results

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.json
        image_data = data.get('image', '')

        if not image_data:
            return jsonify({'error': '이미지가 없습니다.'}), 400

        image_data = image_data.split(',')[1] if ',' in image_data else image_data
        image_bytes = base64.b64decode(image_data)

        nparr = np.frombuffer(image_bytes, np.uint8)
        image_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image_np is None:
            return jsonify({'error': '이미지 디코딩 실패'}), 400

        results = detect_and_analyze(image_np)

        return jsonify({
            'success': True,
            'detections': results,
            'count': len(results)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("[INFO] Flask 서버 시작...")
    print("[INFO] 브라우저에서 http://localhost:5000 접속하세요")
    app.run(debug=True, host='0.0.0.0', port=5000)
