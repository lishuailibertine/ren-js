import { Token } from "../types/assets";
import { Arg, Args } from "./jsonRPC";

// Minting/Shifting ////////////////////////////////////////////////////////////

export type MintArgsArray = [
    Arg<"phash", "b32", string>, // base64
    Arg<"amount", "u64", number>,
    Arg<"token", "b20", string>, // base64
    Arg<"to", "b20", string>, // base64
    Arg<"n", "b32", string>, // base64
    Arg<"utxo", "ext_btcCompatUTXO", { "txHash": string; /* base64 */ "vOut": number; }>
];

export type BurnArgsArray = [
    Arg<"ref", "u64", number>,
];

export type TxOutputArgsArray = [
    Arg<"phash", "b32", string>,
    Arg<"amount", "u64", number>,
    Arg<"token", "b20", string>,
    Arg<"to", "b20", string>,
    Arg<"n", "b32", string>,
    Arg<"utxo", "ext_btcCompatUTXO", { "txHash": string, "vOut": number, "scriptPubKey": string, "amount": 60000 }>,
    Arg<"gas", "u64", number>,
    Arg<"ghash", "b32", string>,
    Arg<"nhash", "b32", string>,
    Arg<"hash", "b32", string>,
];

export type TxSignatureArray = [
    Arg<"r", "b", string>, // base 64
    Arg<"s", "b", string>, // base 64
    Arg<"v", "b", string>, // base 64
];

export interface SubmitTxRequest<T extends Args> {
    // Tx being submitted.
    tx: {
        "to": Token;
        "args": T;
    };
}

export type SubmitMintRequest = SubmitTxRequest<MintArgsArray>;
export type SubmitBurnRequest = SubmitTxRequest<BurnArgsArray>;

export interface QueryTxRequest {
    // TxHash of the transaction that will be returned.
    txHash: string;
}

export type SubmitTxResponse = {
    // Tx being submitted.
    tx: {
        hash: string;
        to: Token;
        args: MintArgsArray;
    };
};

export enum TxStatus {
    // TxStatusNil is used for transactions that have not been seen, or are
    // otherwise unknown.
    TxStatusNil = "nil",
    // TxStatusConfirming is used for transactions that are currently waiting
    // for their underlying blockchain transactions to ne confirmed.
    TxStatusConfirming = "confirming",
    // TxStatusPending is used for transactions that are waiting for consensus
    // to be reached on when the transaction should be executed.
    TxStatusPending = "pending",
    // TxStatusExecuting is used for transactions that are currently being
    // executed.
    TxStatusExecuting = "executing",
    // TxStatusDone is used for transactions that have been successfully
    // executed.
    TxStatusDone = "done",
    // TxStatusReverted is used for transactions that were reverted during
    // execution.
    TxStatusReverted = "reverted",
}

export interface QueryTxResponse {
    tx: {
        hash: string;
        to: Token;
        args: TxOutputArgsArray;
        out: TxSignatureArray;
    };
    txStatus: TxStatus;
}

export type QueryBurnResponse = {
    tx: {
        hash: string;
        to: Token;
        args: any;
        out: any;
    };
    txStatus: TxStatus;
};

export interface Tx {
    hash: string;
    args: {
        phash: string;
        amount: number;
        token: string;
        to: string;
        n: string;
        utxo: { "txHash": string, "vOut": number, "scriptPubKey": string, "amount": 60000 };
        gas: number;
        ghash: string;
        nhash: string;
        hash: string;
    };
    signature: {
        r: string;
        s: string;
        v: string;
    };
}