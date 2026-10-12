"use client";
import { KycIntro } from "./components/kyc-intro";
import { KycProgress } from "./components/kyc-progress";
import { KycConnectionStatus } from "./components/kyc-connection-status";
import { KycStepPanel } from "./components/kyc-step-panel";
import { KycPanelHelp } from "./components/kyc-panel-help";
import { useKycFlow } from "./use-kyc-flow";

export function KycFlow() {
  const flow = useKycFlow();
  return (
    <>
      <KycIntro />
      <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-9">
        <KycProgress stage={flow.session.stage} />
        <div className="min-w-0">
          <KycConnectionStatus
            stage={flow.session.stage}
            loading={flow.loading}
            unavailable={flow.unavailable}
          />
          <KycStepPanel {...flow} />
          <KycPanelHelp />
        </div>
      </div>
    </>
  );
}
