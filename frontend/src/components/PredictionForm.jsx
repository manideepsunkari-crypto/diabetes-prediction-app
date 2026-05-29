import { useState } from 'react';

const initialForm = {
  pregnancies: '',
  glucose: '',
  bloodPressure: '',
  skinThickness: '',
  insulin: '',
  bmi: '',
  diabetesPedigree: '',
  age: ''
};

const fields = [
  { key: 'pregnancies', label: 'Pregnancies', placeholder: 'e.g. 2', hint: 'Number of times pregnant' },
  { key: 'glucose', label: 'Glucose Level', placeholder: 'e.g. 120', hint: 'Plasma glucose concentration (mg/dL)' },
  { key: 'bloodPressure', label: 'Blood Pressure', placeholder: 'e.g. 70', hint: 'Diastolic blood pressure (mm Hg)' },
  { key: 'skinThickness', label: 'Skin Thickness', placeholder: 'e.g. 20', hint: 'Triceps skin fold thickness (mm)' },
  { key: 'insulin', label: 'Insulin', placeholder: 'e.g. 85', hint: '2-Hour serum insulin (mu U/ml)' },
  { key: 'bmi', label: 'BMI', placeholder: 'e.g. 28.5', hint: 'Body mass index (weight in kg / height in m²)' },
  { key: 'diabetesPedigree', label: 'Diabetes Pedigree', placeholder: 'e.g. 0.5', hint: 'Diabetes pedigree function score' },
  { key: 'age', label: 'Age', placeholder: 'e.g. 30', hint: 'Age in years' }
];

const PredictionForm = () => {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError('');
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="header">
        <h1>Diabetes Risk Predictor</h1>
        <p>Enter patient details below to assess diabetes risk using a machine learning model trained on clinical data.</p>
        <div className="disclaimer">
          ⚠️ For educational purposes only — not a medical diagnosis tool
        </div>
      </div>

      <div className="container">
        {/* Form */}
        <form onSubmit={handleSubmit} className="form-card">
          <h2>Patient Details</h2>
          <div className="form-grid">
            {fields.map(({ key, label, placeholder, hint }) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input
                  type="number"
                  name={key}
                  value={form[key]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  step="any"
                  min="0"
                  required
                />
                <span className="hint">{hint}</span>
              </div>
            ))}
          </div>

          <div className="button-row">
            <button type="submit" disabled={loading} className="btn-predict">
              {loading ? 'Analyzing...' : 'Predict Risk'}
            </button>
            <button type="button" onClick={handleReset} className="btn-reset">
              Reset
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="error-box">
            ❌ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`result-card ${result.prediction === 1 ? 'high-risk' : 'low-risk'}`}>
            <div className="result-icon">
              {result.prediction === 1 ? '⚠️' : '✅'}
            </div>
            <h2>{result.result}</h2>
            <div className="probability-bar-container">
              <div className="probability-label">
                Risk Probability: <strong>{result.probability}%</strong>
              </div>
              <div className="probability-bar">
                <div
                  className="probability-fill"
                  style={{ width: `${result.probability}%` }}
                />
              </div>
            </div>
            <p className="result-note">
              {result.prediction === 1
                ? 'This patient shows clinical indicators associated with diabetes. Please consult a healthcare professional.'
                : 'This patient shows low risk indicators. Regular checkups are still recommended.'}
            </p>
          </div>
        )}

        {/* How it works */}
        <div className="info-card">
          <h3>How it works</h3>
          <p>This tool uses a Logistic Regression model trained on the Pima Indians Diabetes Dataset — 768 real patient records with 8 clinical features. The model was evaluated using precision, recall, F1-score, and ROC-AUC to ensure reliability beyond simple accuracy.</p>
          <div className="stats-row">
            <div className="stat">
              <span className="stat-number">768</span>
              <span className="stat-label">Training samples</span>
            </div>
            <div className="stat">
              <span className="stat-number">8</span>
              <span className="stat-label">Clinical features</span>
            </div>
            <div className="stat">
              <span className="stat-number">76%</span>
              <span className="stat-label">Test accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;
