import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateAdvisory() {
  const location = useLocation();
  const navigate = useNavigate();

  const isAnomaly = location.state?.source === 'Anomaly';

  const cclass = location.state?.cclass ?? 0;
  const mclass = location.state?.mclass ?? 0;
  const xclass = location.state?.xclass ?? 0;

  const classification = location.state?.classification || 'Solar Flare Anomaly';
  const flux = location.state?.flux;
  const time_tag = location.state?.time_tag;
  const loggedBy = location.state?.loggedBy;
  const returnPage = location.state?.page || 1;

  const [assessmentNote, setAssessmentNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!location.state) {
      navigate('/analyst/view-anomalies');
    }
  }, [location, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assessmentNote.trim()) {
      setError('An analyst threat assessment is required to issue an advisory.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isAnomaly) {
        // Dispatch to Company Admin with grouped flareDetails
        await axios.post(
          '/api/user/analyst/create-anomaly-advisory',
          {
            flareDetails: `${classification} | Peak Flux: ${Number(flux).toExponential(2)} W/m² | Time: ${new Date(time_tag).toUTCString()}`,
            message: assessmentNote
          },
          { withCredentials: true }
        );
      } else {
        // Dispatch to Supervisors and Company Admin for ML predictions
        await axios.post(
          '/api/user/analyst/create-prediction-advisory',
          {
            cclass,
            mclass,
            xclass,
            message: assessmentNote
          },
          { withCredentials: true }
        );
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/analyst/view-advisories');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating advisory:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to issue the advisory. Please check your network connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isAnomaly) {
      navigate('/analyst/view-anomalies', { state: { page: returnPage } });
    } else {
      navigate('/analyst/predict-anomalies');
    }
  };

  return (
    <div className="w-full p-8 text-white min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-extrabold tracking-wide mb-1">
            {isAnomaly ? 'Issue Incident Advisory' : 'Issue Operational Advisory'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isAnomaly
              ? 'Formalize verified solar flare telemetry into an actionable advisory for Company Administration.'
              : 'Formalize ML prediction outputs into an actionable operational alert for shift supervisors and company administration.'}
          </p>
        </div>

        {/* Snapshot Details Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-xl mb-8">
          {isAnomaly ? (
            <div>
              <h2 className="text-sm font-bold text-slate-300 tracking-wider mb-4 uppercase">
                Anomaly Telemetry Snapshot
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/40 border border-purple-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400 mb-1">CLASSIFICATION</span>
                  <span className="text-lg font-bold text-purple-400">{classification}</span>
                </div>
                <div className="bg-slate-700/40 border border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400 mb-1">PEAK FLUX</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    {flux ? Number(flux).toExponential(2) : '-'} W/m²
                  </span>
                </div>
                <div className="bg-slate-700/40 border border-blue-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400 mb-1">EVENT TIME (UTC)</span>
                  <span className="text-xs font-semibold text-slate-200 font-mono text-center">
                    {time_tag ? new Date(time_tag).toUTCString() : '-'}
                  </span>
                </div>
                <div className="bg-slate-700/40 border border-cyan-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400 mb-1">LOGGED BY</span>
                  <span className="text-base font-bold text-cyan-300">{loggedBy || 'Operator'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-sm font-bold text-slate-300 tracking-wider mb-4 uppercase">
                24-Hour Predictive Risk Snapshot
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-700/40 border border-green-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400 mb-1">C-CLASS FLARE</span>
                  <span className="text-2xl font-bold text-green-400">{cclass}%</span>
                </div>
                <div className="bg-slate-700/40 border border-amber-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400 mb-1">M-CLASS FLARE</span>
                  <span className="text-2xl font-bold text-amber-500">{mclass}%</span>
                </div>
                <div className="bg-slate-700/40 border border-red-500/30 rounded-xl p-4 flex flex-col items-center justify-center">
                  <span className="text-xs font-semibold text-slate-400 mb-1">X-CLASS FLARE</span>
                  <span className="text-2xl font-bold text-red-500">{xclass}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Assessment Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="assessment"
              className="block text-sm font-bold text-slate-300 tracking-wider mb-2 uppercase"
            >
              Analyst Threat Assessment
            </label>
            <textarea
              id="assessment"
              rows={6}
              value={assessmentNote}
              onChange={(e) => setAssessmentNote(e.target.value)}
              placeholder="Detail the specific hazards, operational risks, mitigation protocols, or payload precautions based on the current data..."
              className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              disabled={isSubmitting || success}
            />
          </div>

          {error && (
            <div className="mb-6 bg-red-900/40 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-900/40 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">
                {isAnomaly
                  ? 'Advisory dispatched to Company Admin successfully. Redirecting...'
                  : 'Advisory dispatched to supervisors and company admin successfully. Redirecting...'}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting || success}
              className="px-6 py-2.5 text-sm font-bold cursor-pointer text-slate-300 hover:text-white bg-transparent border border-slate-600 hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="flex items-center gap-2 cursor-pointer bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Dispatching...</span>
                </>
              ) : (
                'Issue Advisory'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}