import { useState } from 'react';
import toast from 'react-hot-toast';
import { predictCrop } from '../services/api';

const DEFAULT_FORM = {
  temperature: '',
  humidity: '',
  moisture: '',
};

function Prediction() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, Number(v)])
      );

      const data = await predictCrop(payload);
      setResult(data);
      toast.success('Prediction complete');
    } catch {
      toast.error('Could not generate prediction');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-agri-primary mb-2">Crop Prediction</h1>
      <p className="text-gray-600 mb-6">Enter soil and weather metrics to predict the best crop.</p>

      <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-md p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(DEFAULT_FORM).map((field) => (
          <label key={field} className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            {field}
            <input
              type="number"
              step="any"
              required
              name={field}
              value={form[field]}
              onChange={onChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-agri-medium"
            />
          </label>
        ))}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-lg bg-agri-primary text-white font-semibold hover:bg-agri-medium disabled:opacity-60"
          >
            {loading ? 'Predicting…' : 'Predict Crop'}
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-sm uppercase tracking-wide font-semibold text-emerald-700">Prediction Result</p>
          <p className="text-2xl font-extrabold text-emerald-900 mt-1">
            {result.crop || result.prediction || JSON.stringify(result)}
          </p>
          {result.confidence !== undefined && (
            <p className="text-sm text-emerald-700 mt-1">Confidence: {result.confidence}%</p>
          )}
        </div>
      )}
    </section>
  );
}

export default Prediction;
