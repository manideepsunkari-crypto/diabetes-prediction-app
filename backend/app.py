from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load the trained model and scaler
model = pickle.load(open('model.pkl', 'rb'))
scaler = pickle.load(open('scaler.pkl', 'rb'))

@app.route('/')
def home():
    return jsonify({'message': 'Diabetes Prediction API running'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Extract features in the correct order
        features = [
            float(data['pregnancies']),
            float(data['glucose']),
            float(data['bloodPressure']),
            float(data['skinThickness']),
            float(data['insulin']),
            float(data['bmi']),
            float(data['diabetesPedigree']),
            float(data['age'])
        ]

        # Scale and predict
        features_scaled = scaler.transform([features])
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0][1]

        return jsonify({
            'prediction': int(prediction),
            'probability': round(float(probability) * 100, 1),
            'result': 'High Risk of Diabetes' if prediction == 1 else 'Low Risk of Diabetes'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
