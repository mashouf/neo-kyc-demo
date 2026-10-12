"use client";
import { useCallback } from "react";
import { useMachine } from "@xstate/react";
import { kycMachine } from "./machine";
import type { ApiCommand, StatusResult } from "./contracts";

export function useKycFlow() {
  const [snapshot, send] = useMachine(kycMachine);
  const submit = useCallback((command: ApiCommand) => send({ type: "SUBMIT", command }), [send]);
  const onStatus = useCallback((result: StatusResult) => send({ type: "STATUS", result }), [send]);
  const retry = useCallback(() => send({ type: "RETRY" }), [send]);
  return {
    ...snapshot.context,
    busy: snapshot.matches("submitting"),
    loading: snapshot.matches("loading"),
    unavailable: snapshot.matches("unavailable"),
    submit,
    onStatus,
    retry,
  };
}
export type KycFlowState = ReturnType<typeof useKycFlow>;
