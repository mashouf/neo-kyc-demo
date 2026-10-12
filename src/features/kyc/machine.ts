import { assign, fromPromise, setup } from "xstate";
import { kycApi } from "./api";
import type { ApiCommand, ApiResult, KycSession, StatusResult } from "./contracts";

type Context = {
  session: KycSession;
  command: ApiCommand | null;
  error: string | null;
  message: string | null;
};
export const kycMachine = setup({
  types: {
    context: {} as Context,
    events: {} as
      | { type: "SUBMIT"; command: ApiCommand }
      | { type: "RETRY" }
      | { type: "STATUS"; result: StatusResult },
  },
  actors: {
    // Let this idempotent GET finish during React Strict Mode effect replay.
    load: fromPromise<ApiResult>(async () => kycApi.session()),
    submit: fromPromise<ApiResult, ApiCommand>(async ({ input, signal }) =>
      kycApi.submit(input, signal),
    ),
  },
}).createMachine({
  id: "kyc",
  initial: "loading",
  context: {
    session: { stage: "mobile", mode: "demo" },
    command: null,
    error: null,
    message: null,
  },
  states: {
    loading: {
      invoke: {
        src: "load",
        onDone: {
          target: "ready",
          actions: assign({ session: ({ event }) => event.output.session, error: null }),
        },
        onError: {
          target: "unavailable",
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error ? event.error.message : "بارگذاری نشست ممکن نیست",
          }),
        },
      },
    },
    unavailable: { on: { RETRY: "loading" } },
    ready: {
      initial: "route",
      on: {
        SUBMIT: {
          target: "submitting",
          actions: assign({ command: ({ event }) => event.command, error: null, message: null }),
        },
        STATUS: {
          guard: ({ context }) => context.session.stage === "verification",
          target: "#kyc.ready",
          reenter: true,
          actions: assign({
            session: ({ event }) => event.result.session,
            message: ({ event }) => event.result.message ?? null,
            error: null,
          }),
        },
      },
      states: {
        route: {
          always: [
            { guard: ({ context }) => context.session.stage === "mobile", target: "mobile" },
            { guard: ({ context }) => context.session.stage === "otp", target: "otp" },
            {
              guard: ({ context }) => context.session.stage === "personal-info",
              target: "personalInfo",
            },
            { guard: ({ context }) => context.session.stage === "address", target: "address" },
            {
              guard: ({ context }) => context.session.stage === "account-type",
              target: "accountType",
            },
            { guard: ({ context }) => context.session.stage === "documents", target: "documents" },
            { guard: ({ context }) => context.session.stage === "liveness", target: "liveness" },
            {
              guard: ({ context }) => context.session.stage === "verification",
              target: "verification",
            },
            { guard: ({ context }) => context.session.stage === "review", target: "review" },
            { target: "complete" },
          ],
        },
        mobile: {},
        otp: {},
        personalInfo: {},
        address: {},
        accountType: {},
        documents: {},
        liveness: {},
        verification: {},
        review: {},
        complete: {},
      },
    },
    submitting: {
      invoke: {
        src: "submit",
        input: ({ context }) => context.command!,
        onDone: {
          target: "ready",
          actions: assign({
            session: ({ event }) => event.output.session,
            message: ({ event }) => event.output.message ?? null,
            command: null,
          }),
        },
        onError: {
          target: "ready",
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error
                ? event.error.message
                : "خطایی رخ داد. دوباره تلاش کنید.",
            command: null,
          }),
        },
      },
    },
  },
});
