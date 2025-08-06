import React from 'react';
import { CheckCircle, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

const RightPanel = ({ evidenceCompartments }) => {
  const compartments = evidenceCompartments || {};

  const StatusHeader = ({ status }) => {
    const s = status.toLowerCase();
    let Icon = HelpCircle;
    let color = "text-slate-700 bg-slate-200";
    if (s.includes('approved')) { Icon = CheckCircle; color = "text-green-700 bg-green-100"; }
    if (s.includes('denied')) { Icon = XCircle; color = "text-red-700 bg-red-100"; }
    if (s.includes('information')) { Icon = AlertCircle; color = "text-yellow-700 bg-yellow-100"; }
    return <div className={`flex items-center gap-2 text-sm font-bold p-2 rounded-md ${color}`}><Icon size={16} /> {status}</div>;
  };

  return (
    <div className="flex-shrink-0 w-1/3 bg-slate-50 border-l border-slate-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-800">Evidence Panel</h2>
      </div>
      <div className="p-4 space-y-6">
        {Object.keys(compartments).length === 0 && (
          <div className="text-center text-sm text-slate-500 mt-8">
            Evidence for your claims will appear here.
          </div>
        )}
        {Object.values(compartments).map((comp, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-3">{comp.topic}</h3>
            {comp.decision && <div className="mb-3"><StatusHeader status={comp.decision} /></div>}
            <div className="mb-3 p-3 bg-slate-50 rounded-md text-sm text-slate-600">
              <p className="font-semibold text-slate-700">Summary:</p>
              {comp.justification}
            </div>
            {comp.calculation && (
              <div className="mb-3 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
                <p className="font-semibold text-blue-800">Calculation:</p>
                {comp.calculation}
              </div>
            )}
            <p className="text-xs font-semibold text-slate-500 mb-2">Cited Clauses:</p>
            <div className="space-y-2">
              {comp.clauses.map((clause, idx) => (
                <div key={idx} className="p-2 border-l-4 border-blue-300 bg-blue-50">
                  <p className="text-xs font-semibold text-blue-800">
                    {clause.clause_id} - <span className="font-normal text-slate-500">{clause.source_document}</span>
                  </p>
                  <p className="text-sm text-slate-700 mt-1">"{clause.clause_text}"</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightPanel;
