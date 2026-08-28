import { reconcileSteps } from '../data/mock';

export function ReconcileTimeline() {
  return (
    <div className="timeline-panel">
      <div className="timeline-header">
        <div className="timeline-title">Live Reconcile Timeline</div>
        <div className="timeline-live">
          <span className="timeline-live-dot" />
          Live · All reconciled 2s ago
        </div>
      </div>
      <div className="timeline-steps">
        {reconcileSteps.map((step, i) => (
          <div key={step.id} style={{ display: 'contents' }}>
            <div className="timeline-step">
              <div className="timeline-step-icon">✓</div>
              <div className="timeline-step-label">
                <strong>{step.label}</strong>
                <br />
                {step.sub}
              </div>
            </div>
            {i < reconcileSteps.length - 1 && (
              <div className="timeline-connector" aria-hidden />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
