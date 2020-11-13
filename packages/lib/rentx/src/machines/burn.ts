/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Improve typings.

import { Actor, assign, Machine, send } from "xstate";
import RenJS from "@renproject/ren";
import { LockChain, MintChain } from "@renproject/interfaces";
import { assert } from "@renproject/utils";

import { GatewaySession, GatewayTransaction } from "../types/transaction";

export interface BurnMachineContext {
    tx: GatewaySession;
    sdk: RenJS;
    providers: any; // The blockchain api providers required for the mintchain
    toChainMap: {
        [key in string]: (context: BurnMachineContext) => LockChain<any>;
    }; // Functions to create the "to" param;
    fromChainMap: {
        [key in string]: (context: BurnMachineContext) => MintChain<any>;
    }; // Functions to create the "from" param;
    burnListenerRef?: Actor<any>;
}

// We have different states for a burn machine, as there can only be one transaction
export interface BurnMachineSchema {
    states: {
        restoring: {};
        created: {};
        createError: {};
        srcSettling: {};
        srcConfirmed: {};
        destInitiated: {}; // We only care if the txHash has been issued by renVM
    };
}

const getFirstTx = (tx: GatewaySession) => Object.values(tx.transactions)[0];

export type BurnMachineEvent =
    | { type: "NOOP" }
    | { type: "RETRY" }
    | { type: "RESTORE" }
    | { type: "SUBMITTED"; data: GatewayTransaction }
    | { type: "RELEASE_ERROR"; data: any }
    | { type: "BURN_ERROR"; data: any }
    | { type: "CONFIRMATION"; data: GatewayTransaction }
    | { type: "CONFIRMED"; data: GatewayTransaction }
    | { type: "RELEASED" };

export const burnMachine = Machine<
    BurnMachineContext,
    BurnMachineSchema,
    BurnMachineEvent
>(
    {
        id: "RenVMBurnMachine",
        initial: "restoring",
        states: {
            restoring: {
                entry: send("RESTORE"),
                on: {
                    RESTORE: [
                        { target: "srcConfirmed", cond: "isSrcConfirmed" },
                        { target: "srcSettling", cond: "isSrcSettling" },
                        { target: "created" },
                    ],
                },
                meta: { test: async () => {} },
            },
            created: {
                invoke: {
                    src: "burnCreator",
                    onDone: {
                        actions: [
                            assign({
                                tx: (ctx, evt) => ({ ...ctx.tx, ...evt.data }),
                            }),
                            "burnSpawner",
                        ],
                    },
                    onError: {
                        target: "createError",
                        actions: assign({
                            tx: (ctx, evt) => ({ ...ctx.tx, error: evt.data }),
                        }),
                    },
                },
                on: {
                    SUBMITTED: {
                        target: "srcSettling",
                        actions: [
                            assign({
                                tx: (ctx, evt) => ({
                                    ...ctx.tx,
                                    transactions: {
                                        [evt.data.sourceTxHash]: evt.data,
                                    },
                                }),
                            }),
                        ],
                    },
                },
                meta: {
                    test: async (_: void, state: any) => {
                        assert(
                            !Object.keys(state.context.tx.transactions).length
                                ? true
                                : false,
                            "Should not have a transaction",
                        );
                    },
                },
            },
            createError: {
                on: {
                    RETRY: "created",
                },
                meta: {
                    test: async (_: void, state: any) => {
                        assert(
                            state.context.tx.error ? true : false,
                            "Error must exist",
                        );
                    },
                },
            },
            srcSettling: {
                on: {
                    CONFIRMATION: {
                        // update src confs
                        actions: assign({
                            tx: (ctx, evt) =>
                                evt.data
                                    ? {
                                          ...ctx.tx,
                                          transactions: {
                                              [evt.data.sourceTxHash]: evt.data,
                                          },
                                      }
                                    : ctx.tx,
                        }),
                    },
                    CONFIRMED: {
                        actions: [
                            assign({
                                tx: (ctx, evt) => ({
                                    ...ctx.tx,
                                    transactions: {
                                        [evt.data.sourceTxHash]: evt.data,
                                    },
                                }),
                            }),
                        ],
                        target: "srcConfirmed",
                    },
                },
                meta: {
                    test: async (_: void, state: any) => {
                        assert(
                            Object.keys(state.context.tx.transactions).length
                                ? true
                                : false,
                            "Should have a transaction",
                        );
                    },
                },
            },
            srcConfirmed: {
                on: {
                    RELEASED: "destInitiated",
                },
                meta: {
                    test: async (_: void, state: any) => {
                        assert(
                            getFirstTx(state.context.tx).sourceTxConfs >=
                                (getFirstTx(state.context.tx)
                                    .sourceTxConfTarget || 0)
                                ? true
                                : false,
                            "Should have a confirmed transaction",
                        );
                    },
                },
            },
            destInitiated: {
                meta: { test: async () => {} },
            },
        },
    },
    {
        guards: {
            isSrcSettling: (ctx, _evt) => {
                return getFirstTx(ctx.tx)?.sourceTxHash ? true : false;
            },
            isSrcConfirmed: (ctx, _evt) =>
                getFirstTx(ctx.tx)?.sourceTxConfs >=
                (getFirstTx(ctx.tx)?.sourceTxConfTarget ||
                    Number.POSITIVE_INFINITY),
        },
    },
);
