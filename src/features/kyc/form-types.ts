import type { ApiCommand, KycSession } from "./contracts";

export type StepProps = {
  session: KycSession;
  busy: boolean;
  submit: (command: ApiCommand) => void;
};
