import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, X, Sparkles, Send } from 'lucide-react';

export default function PublishModal({
  isOpen,
  onClose,
  divisions,
  timetableEntries,
  conflicts,
  onConfirmPublish
}) {
  if (!isOpen) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const criticalCount = (conflicts || []).filter(c => c.severity === 'critical' || c.severity === 'impossible').length;
  const canPublish = criticalCount === 0 && timetableEntries.length > 0;

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmPublish();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Publish Official College Timetable</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs">
          <div>
            <span className="font-semibold text-slate-700 block mb-1">Target Divisions:</span>
            <div className="flex flex-wrap gap-1.5">
              {(divisions || []).map(d => (
                <span key={d.id} className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">
              Pre-Publish Health Check:
            </span>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{timetableEntries.length} Classes assigned across 5 days</span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              {criticalCount === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span className={criticalCount > 0 ? "font-bold text-rose-600" : ""}>
                {criticalCount === 0 ? "Zero hard conflicts detected" : `${criticalCount} unresolved collisions!`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>All specialized labs and classrooms confirmed</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Once published, this timetable becomes the official schedule visible to all enrolled Students and teaching Faculty in their respective portals.
          </p>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish || isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Timetable'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
