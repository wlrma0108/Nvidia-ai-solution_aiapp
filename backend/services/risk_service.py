def calculate_risk_level(estimated_sugar_g: float, daily_target_g: float) -> str:
    ratio = estimated_sugar_g / daily_target_g if daily_target_g > 0 else 0

    if ratio <= 0.3:
        return "GOOD"
    elif ratio <= 0.6:
        return "WARNING"
    else:
        return "BAD"


def calculate_risk_score(estimated_sugar_g: float, daily_target_g: float) -> int:
    ratio = estimated_sugar_g / daily_target_g if daily_target_g > 0 else 0

    if ratio <= 0.5:
        score = int(ratio * 100)
    elif ratio <= 1.0:
        score = 50 + int((ratio - 0.5) * 100)
    else:
        score = 100

    return min(100, max(0, score))


def calculate_drug_risk(drug_info: dict, uses_insulin: bool) -> dict:
    risk_level = "GOOD"
    risk_score = 0
    message = ""

    if not drug_info or not drug_info.get("name"):
        return {
            "risk_level": "GOOD",
            "risk_score": 0,
            "message": "약 정보를 확인할 수 없습니다."
        }

    drug_name = drug_info.get("name", "").lower()
    ingredients = " ".join(drug_info.get("ingredients", [])).lower()

    high_risk_keywords = [
        "스테로이드", "프레드니솔론", "덱사메타손",
        "이뇨제", "티아자이드",
        "베타차단제", "프로프라놀롤"
    ]

    warning_keywords = [
        "항생제", "소염제", "진통제",
        "아스피린", "이부프로펜"
    ]

    full_text = f"{drug_name} {ingredients}"

    for keyword in high_risk_keywords:
        if keyword in full_text:
            risk_level = "BAD"
            risk_score = 80
            message = (
                f"이 약물({drug_info['name']})은 혈당 수치에 영향을 줄 수 있습니다. "
                f"당뇨병 환자는 복용 전 반드시 의사와 상담하세요."
            )

            if uses_insulin:
                risk_score = 100
                message += "\n인슐린 투여 중이므로 특히 주의가 필요합니다."

            return {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "message": message
            }

    for keyword in warning_keywords:
        if keyword in full_text:
            risk_level = "WARNING"
            risk_score = 40
            message = (
                f"이 약물({drug_info['name']})은 일반적으로 안전하나, "
                f"장기 복용 시 혈당에 영향을 줄 수 있습니다. "
                f"복용량과 복용 기간을 의사와 상의하세요."
            )

            return {
                "risk_level": risk_level,
                "risk_score": risk_score,
                "message": message
            }

    message = (
        f"약물({drug_info['name']}) 정보를 확인했습니다. "
        f"특별한 위험 요소는 감지되지 않았으나, "
        f"새로운 약을 복용할 때는 항상 의사나 약사와 상담하시기 바랍니다."
    )

    return {
        "risk_level": "GOOD",
        "risk_score": 10,
        "message": message
    }
