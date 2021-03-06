import {
    bchAddressFrom,
    bchAddressToHex,
    btcAddressFrom,
    btcAddressToHex,
    createBCHAddress,
    createBTCAddress,
    createZECAddress,
    getBitcoinCashConfirmations,
    getBitcoinCashUTXO,
    getBitcoinCashUTXOs,
    getBitcoinConfirmations,
    getBitcoinUTXO,
    getBitcoinUTXOs,
    getZcashConfirmations,
    getZcashUTXO,
    getZcashUTXOs,
    zecAddressFrom,
    zecAddressToHex,
} from "@renproject/chains";
import { RenNetworkDetails } from "@renproject/contracts";
import {
    Chain,
    RenContract,
    Tokens as CommonTokens,
    Tx,
    UTXO,
    UTXOIndex,
    UTXOWithChain,
} from "@renproject/interfaces";
import { ripemd160, sha256 } from "ethereumjs-util";
import { UTXO as SendCryptoUTXO } from "send-crypto";

import { Ox } from "./common";
import { parseRenContract } from "./renVMUtils";

// const hexOrBase64ToBuffer = (value: string | Buffer): Buffer =>
//     typeof value === "string" ?
//         value.slice(0, 2) === "0x" ?
//             Buffer.from(strip0x(value), "hex") :
//             Buffer.from(value, "base64") :
//         Buffer.from(value);

export const hash160 = (publicKey: Buffer): Buffer =>
    ripemd160(sha256(publicKey), false);

/**
 * Generate Gateway address for a cross-chain transfer's origin chain.
 */
export const generateAddress = (
    renContract: RenContract,
    gHash: string,
    mpkh: Buffer,
    isTestnet: boolean,
): string => {
    const chain = parseRenContract(renContract).from;
    switch (chain) {
        case Chain.Bitcoin:
            return createBTCAddress(isTestnet, Ox(mpkh), gHash);
        case Chain.Zcash:
            return createZECAddress(isTestnet, Ox(mpkh), gHash);
        case Chain.BitcoinCash:
            return createBCHAddress(isTestnet, Ox(mpkh), gHash);
        default:
            throw new Error(
                `Unable to generate deposit address for chain ${chain}`,
            );
    }
};

/**
 * Retrieves unspent deposits at the provided address.
 * An optional `confirmations` parameter limits UTXOs to ones with at least that
 * amount of confirmations.
 */
export const retrieveDeposits = async (
    _network: RenNetworkDetails,
    renContract: RenContract,
    address: string,
    confirmations = 0,
): Promise<UTXOWithChain[]> => {
    const chain = parseRenContract(renContract).from;
    switch (chain) {
        case Chain.Bitcoin:
            return (
                await getBitcoinUTXOs(_network)(address, confirmations)
            ).map((utxo: UTXO) => ({
                chain: Chain.Bitcoin as Chain.Bitcoin,
                utxo,
            }));
        case Chain.Zcash:
            return (await getZcashUTXOs(_network)(address, confirmations)).map(
                (utxo: UTXO) => ({
                    chain: Chain.Zcash as Chain.Zcash,
                    utxo,
                }),
            );
        case Chain.BitcoinCash:
            // tslint:disable-next-line: no-unnecessary-type-assertion
            return (
                await getBitcoinCashUTXOs(_network)(address, confirmations)
            ).map((utxo: UTXO) => ({
                chain: Chain.BitcoinCash as Chain.BitcoinCash,
                utxo,
            }));
        default:
            throw new Error(`Unable to retrieve deposits for chain ${chain}`);
    }
};

/**
 * Returns the number of confirmations for the specified UTXO.
 */
export const retrieveUTXO = async (
    _network: RenNetworkDetails,
    chain: Chain,
    transaction: UTXOIndex,
): Promise<UTXO> => {
    // tslint:disable-next-line: no-any
    const { txHash, vOut } = transaction;
    switch (chain) {
        case Chain.Bitcoin:
            return await getBitcoinUTXO(_network)(txHash, vOut);
        case Chain.Zcash:
            return await getZcashUTXO(_network)(txHash, vOut);
        case Chain.BitcoinCash:
            // tslint:disable-next-line: no-unnecessary-type-assertion
            return await getBitcoinCashUTXO(_network)(txHash, vOut);
        default:
            throw new Error(`Unable to retrieve deposits for chain ${chain}`);
    }
};

export interface AssetUtils {
    getUTXOs: ({
        isTestnet,
    }: {
        isTestnet: boolean;
    }) => (
        address: string,
        confirmations: number,
    ) => Promise<readonly SendCryptoUTXO[]>;
    addressToHex: (address: string) => string;
    addressFrom: (address: string) => string;
}

export const btcUtils: AssetUtils = {
    getUTXOs: getBitcoinUTXOs,
    addressToHex: btcAddressToHex,
    addressFrom: btcAddressFrom,
};

export const zecUtils: AssetUtils = {
    getUTXOs: getZcashUTXOs,
    addressToHex: zecAddressToHex,
    addressFrom: zecAddressFrom,
};

export const bchUtils: AssetUtils = {
    getUTXOs: getBitcoinCashUTXOs,
    addressToHex: bchAddressToHex,
    addressFrom: bchAddressFrom,
};

export const Tokens: {
    BTC: AssetUtils & typeof CommonTokens["BTC"];
    ZEC: AssetUtils & typeof CommonTokens["ZEC"];
    BCH: AssetUtils & typeof CommonTokens["BCH"];
} = {
    // Bitcoin
    BTC: {
        ...CommonTokens.BTC,
        ...btcUtils,
    },

    // Zcash
    ZEC: {
        ...CommonTokens.ZEC,
        ...zecUtils,
    },

    // Bitcoin Cash
    BCH: {
        ...CommonTokens.BCH,
        ...bchUtils,
    },
};
