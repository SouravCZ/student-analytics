from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

app = Flask(__name__)
CORS(app)

MODEL_PATH = "model.pkl"

# ─────────────────────────────────────────
# 1. Generate Synthetic Dataset
# ─────────────────────────────────────────
def generate_dataset(n=500):
    np.random.seed(42)

    attendance = np.random.uniform(30, 100, n)
    avg_marks = np.random.uniform(20, 100, n)
    assignments = np.random.randint(0, 11, n)
    behavior = np.random.randint(1, 11, n)

    # At-risk logic: low attendance OR low marks OR low assignments
    at_risk = (
        (attendance < 60) |
        (avg_marks < 40) |
        (assignments < 4)
    ).astype(int)

    df = pd.DataFrame({
        "attendance_percentage": attendance,
        "avg_marks": avg_marks,
        "assignments_submitted": assignments,
        "behavior_score": behavior,
        "at_risk": at_risk
    })

    df.to_csv("dataset.csv", index=False)
    print(f"✅ Dataset generated: {n} records, {df['at_risk'].sum()} at-risk students")
    return df

# ─────────────────────────────────────────
# 2. Train Model
# ─────────────────────────────────────────
def train_model():
    if not os.path.exists("dataset.csv"):
        generate_dataset()

    df = pd.read_csv("dataset.csv")
    X = df[["attendance_percentage", "avg_marks", "assignments_submitted", "behavior_score"]]
    y = df["at_risk"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"✅ Model trained — Accuracy: {acc:.2%}")
    print(classification_report(y_test, y_pred))

    joblib.dump(model, MODEL_PATH)
    print(f"✅ Model saved to {MODEL_PATH}")
    return model

# ─────────────────────────────────────────
# 3. Load or Train Model on Startup
# ─────────────────────────────────────────
if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded from disk")
else:
    print("🔄 No model found — training now...")
    model = train_model()

# ─────────────────────────────────────────
# 4. Flask Routes
# ─────────────────────────────────────────

@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "DS Engine running", "model": "RandomForest at-risk predictor"})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        required = ["attendance_percentage", "avg_marks", "assignments_submitted", "behavior_score"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        features = [[
            float(data["attendance_percentage"]),
            float(data["avg_marks"]),
            int(data["assignments_submitted"]),
            int(data["behavior_score"])
        ]]

        prediction = model.predict(features)[0]
        probability = model.predict_proba(features)[0][1]

        return jsonify({
            "at_risk": int(prediction),
            "risk_probability": round(float(probability) * 100, 2),
            "status": "At Risk" if prediction == 1 else "Safe"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    try:
        students = request.get_json()  # expects a list of student objects

        results = []
        for s in students:
            features = [[
                float(s["attendance_percentage"]),
                float(s["avg_marks"]),
                int(s["assignments_submitted"]),
                int(s["behavior_score"])
            ]]
            prediction = model.predict(features)[0]
            probability = model.predict_proba(features)[0][1]
            results.append({
                "student_id": s.get("student_id", "unknown"),
                "at_risk": int(prediction),
                "risk_probability": round(float(probability) * 100, 2),
                "status": "At Risk" if prediction == 1 else "Safe"
            })

        return jsonify(results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/retrain", methods=["POST"])
def retrain():
    try:
        global model
        model = train_model()
        return jsonify({"message": "Model retrained successfully"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5001, debug=True)