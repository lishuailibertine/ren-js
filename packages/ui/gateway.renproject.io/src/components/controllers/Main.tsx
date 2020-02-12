import * as React from "react";

import RenJS, { processShiftInParams, processShiftOutParams } from "@renproject/ren";
import {
    HistoryEvent, RenNetwork, SendTokenInterface, ShiftInEvent, ShiftInParams, ShiftInParamsAll,
    ShiftInStatus, ShiftOutEvent, ShiftOutParams, ShiftOutParamsAll, ShiftOutStatus, sleep,
} from "@renproject/ren-js-common";
import { parse as parseLocation } from "qs";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { DEFAULT_NETWORK } from "../../lib/environmentVariables";
import { _catchInteractionErr_ } from "../../lib/errors";
import { getWeb3 } from "../../lib/getWeb3";
import {
    acknowledgeMessage, GatewayMessage, GatewayMessageType, postMessageToClient,
} from "../../lib/postMessage";
import { connect, ConnectedProps } from "../../state/connect";
import { SDKContainer } from "../../state/sdkContainer";
import { UIContainer } from "../../state/uiContainer";
import { Footer } from "../views/Footer";
import { LoggedOutPopup } from "../views/LoggedOutPopup";
import { ErrorBoundary } from "./ErrorBoundary";
import { OpeningShift } from "./OpeningShift";
import { ProgressBar } from "./ProgressBar";
import { getStorage, removeStorageTrade } from "./Storage";

/**
 * App is the main visual component responsible for displaying different routes
 * and running background app loops
 */
export const Main = withRouter(connect<RouteComponentProps & ConnectedProps<[UIContainer, SDKContainer]>>([UIContainer, SDKContainer])(
    ({ containers: [uiContainer, sdkContainer], location }) => {

        const pause = React.useCallback(async (fromClient?: boolean) => {
            if (!fromClient) {
                const sendMsg = () => {
                    if (uiContainer.state.gatewayPopupID) {
                        postMessageToClient(window, uiContainer.state.gatewayPopupID, GatewayMessageType.Pause, {});
                    }
                };
                // The client send a pause or resume reminder message every
                // second, so there's a change that the user clicks pause or
                // resume just as the client sends the reminder.
                sendMsg();
                setTimeout(sendMsg, 100);
            }
            return uiContainer.pause();
        }, [uiContainer]);

        const pauseOnClick = React.useCallback(() => pause(false), [pause]);

        const resume = React.useCallback(async (fromClient?: boolean) => {
            if (!fromClient) {
                const sendMsg = () => {
                    if (uiContainer.state.gatewayPopupID) {
                        postMessageToClient(window, uiContainer.state.gatewayPopupID, GatewayMessageType.Resume, {});
                    }
                };
                // See above on pausing.
                sendMsg();
                setTimeout(sendMsg, 100);
            }
            return uiContainer.resume();
        }, [uiContainer]);

        const resumeOnClick = React.useCallback(() => resume(false), [resume]);

        const cancelShift = React.useCallback(async (fromClient?: boolean) => {
            let retries = 0;
            while (!sdkContainer.state.shift || !uiContainer.state.renNetwork) {
                // Make errors less frequent as retries increase (by checking if retries is a square).
                if (Math.floor(Math.sqrt(retries)) ** 2 === retries) { console.error(`Waiting for shift information to cancel shift.`); }
                retries++;
                await sleep(100);
            }
            await removeStorageTrade(sdkContainer.state.shift.shiftParams.nonce, uiContainer.state.renNetwork);
            if (!fromClient && uiContainer.state.gatewayPopupID) {
                postMessageToClient(window, uiContainer.state.gatewayPopupID, GatewayMessageType.Cancel, {});
            }
        }, [uiContainer, sdkContainer]);

        const cancelOnClick = React.useCallback(() => cancelShift(false), [cancelShift]);

        const onDone = React.useCallback(async () => {
            if (uiContainer.state.gatewayPopupID) {
                postMessageToClient(window, uiContainer.state.gatewayPopupID, GatewayMessageType.Done, {});
            }
            uiContainer.resetTrade().catch((error) => _catchInteractionErr_(error, "Error in OpeningShift: onDone > resetTrade"));
        }, [uiContainer]);

        // React.useEffect(() => {
        //     const queryParams = parseLocation(location.search.replace(/^\?/, ""));
        //     const queryShiftID = queryParams.id;
        //     if (queryShiftID !== uiContainer.state.gatewayPopupID) {
        //         uiContainer.handleShift(queryShiftID).catch(console.error);
        //     }
        // }, [uiContainer.state.gatewayPopupID]);

        React.useEffect(() => {
            const queryParams = parseLocation(location.search.replace(/^\?/, ""));
            const queryShiftID = queryParams.id;
            uiContainer.handleShift(queryShiftID).catch(console.error);

            const urlRenNetwork: string = queryParams.network || DEFAULT_NETWORK;
            uiContainer.setState({ renNetwork: urlRenNetwork }).catch(console.error);

            // tslint:disable-next-line: no-any
            window.onmessage = (e: { data: GatewayMessage<any> }) => {
                if (e.data && e.data.from === "ren" && e.data.frameID === uiContainer.state.gatewayPopupID) {
                    (async () => {
                        switch (e.data.type) {
                            case GatewayMessageType.Shift:
                                acknowledgeMessage(e.data);
                                const { paused: alreadyPaused, shift: shiftParamsIn }: { paused: boolean, shift: HistoryEvent | (ShiftOutParamsAll & ShiftInParamsAll & SendTokenInterface) } = e.data.payload;
                                await (alreadyPaused ? pause() : resume());
                                const shiftID = e.data.frameID;
                                const time = Date.now() / 1000;

                                let historyEvent: HistoryEvent | undefined;
                                let shiftParams: HistoryEvent["shiftParams"];

                                if (shiftParamsIn.hasOwnProperty("shiftParams")) {
                                    historyEvent = shiftParamsIn as unknown as HistoryEvent;
                                    shiftParams = { ...historyEvent.shiftParams };
                                    shiftParams.nonce = historyEvent.shiftParams.nonce || RenJS.utils.randomNonce();
                                } else {
                                    historyEvent = undefined;
                                    shiftParams = {
                                        ...(shiftParamsIn as (ShiftOutParamsAll & ShiftInParamsAll & SendTokenInterface)),
                                        nonce: (shiftParamsIn as (ShiftOutParamsAll & ShiftInParamsAll & SendTokenInterface)).nonce || RenJS.utils.randomNonce(),
                                    };
                                }

                                let shiftDetails;

                                if (shiftParams.sendToken === RenJS.Tokens.BTC.Btc2Eth ||
                                    shiftParams.sendToken === RenJS.Tokens.ZEC.Zec2Eth ||
                                    shiftParams.sendToken === RenJS.Tokens.BCH.Bch2Eth) {
                                    shiftDetails = {
                                        // Cast required by TS to differentiate ShiftIn and ShiftOut types.
                                        shiftIn: true as true,
                                        status: ShiftInStatus.Committed,
                                        // tslint:disable-next-line: no-object-literal-type-assertion
                                        shiftParams: processShiftInParams((sdkContainer.state.sdkRenVM || new RenJS(urlRenNetwork)).network, shiftParams as ShiftInParams) as ShiftInEvent["shiftParams"],
                                    };
                                } else {
                                    shiftDetails = {
                                        shiftIn: false as false,
                                        status: ShiftOutStatus.Committed,
                                        shiftParams: processShiftOutParams((sdkContainer.state.sdkRenVM || new RenJS(urlRenNetwork)).network, shiftParams as ShiftOutParams) as unknown as ShiftOutEvent["shiftParams"],
                                    };
                                }

                                historyEvent = {
                                    ...shiftDetails,
                                    id: shiftID,
                                    time,
                                    inTx: null,
                                    outTx: null,
                                    renTxHash: null,
                                    renVMStatus: null,
                                    ...historyEvent,
                                };

                                await sdkContainer.updateShift(historyEvent);

                                break;
                            case GatewayMessageType.Pause:
                                acknowledgeMessage(e.data);
                                pause(true).catch(console.error);

                                break;
                            case GatewayMessageType.Cancel:
                                acknowledgeMessage(e.data);
                                cancelShift(true).catch(console.error);
                                break;
                            case GatewayMessageType.Resume:
                                acknowledgeMessage(e.data);
                                resume(true).catch(console.error);
                                break;
                            case GatewayMessageType.GetTrades:
                                acknowledgeMessage(e.data);
                                postMessageToClient(window, e.data.frameID, GatewayMessageType.GetTrades, await getStorage(urlRenNetwork));
                                break;
                            case GatewayMessageType.GetStatus:
                                acknowledgeMessage(e.data, sdkContainer.getShiftStatus());
                                break;
                            default:
                                // Acknowledge that we got the message. We don't
                                // know how to handle it, but we don't want
                                // the parent window to keep re-sending it.
                                acknowledgeMessage(e.data);
                        }
                    })().catch((error) => _catchInteractionErr_(error, "Error in App: onMessage"));
                }
            };
            postMessageToClient(window, queryShiftID, GatewayMessageType.Ready, {});
        }, []);

        const login = React.useCallback(async () => {
            const queryParams = parseLocation(location.search.replace(/^\?/, ""));
            const urlRenNetwork: string = queryParams.network || DEFAULT_NETWORK;
            uiContainer.setState({ renNetwork: urlRenNetwork }).catch(console.error);

            let web3 = uiContainer.state.web3;
            try {
                web3 = await getWeb3();
            } catch (error) {
                // ignore error
                return;
            }

            const πNetworkID = web3.eth.net.getId();
            const πAddresses = web3.eth.getAccounts();

            const networkID = await πNetworkID;
            const expectedNetworkID = (sdkContainer.state.sdkRenVM || new RenJS(urlRenNetwork)).network.contracts.networkID;
            const expectedNetwork = (sdkContainer.state.sdkRenVM || new RenJS(urlRenNetwork)).network.contracts.chainLabel;
            if (networkID !== expectedNetworkID) {
                await uiContainer.setState({ wrongNetwork: networkID, expectedNetwork });
                return;
            }
            const addresses = await πAddresses;
            const address = addresses.length > 0 ? addresses[0] : null;

            await Promise.all([
                uiContainer.connect(web3, address),
                sdkContainer.connect(web3, address, urlRenNetwork),
            ]);

        }, []);

        // useEffect replaces `componentDidMount` and `componentDidUpdate`.
        // To limit it to running once, we use the initialized hook.
        const [initialized, setInitialized] = React.useState(false);
        React.useEffect(() => {
            if (!initialized) {
                setInitialized(true);

                // Start loops to update prices and balances
                setInterval(() => uiContainer.lookForLogout(), 1 * 1000);
                login().catch((error) => { setInitialized(false); _catchInteractionErr_(error, "Error in App: login"); });
            }
        }, [initialized, login, uiContainer]);

        const { loggedOut, paused, renNetwork } = uiContainer.state;
        const { shift } = sdkContainer.state;

        return <main className={paused ? "paused" : ""} onClick={paused ? resumeOnClick : undefined}>
            {!paused ? <div className="banner">
                <span>Gateway {renNetwork === RenNetwork.Chaosnet || renNetwork === RenNetwork.Mainnet ? "by Ren Project" : <span className="warning"> {renNetwork}</span>}</span>
                {shift ?
                    (shift.status === ShiftInStatus.Committed || shift.status === ShiftOutStatus.Committed) ?
                        <div role="button" className={`popup--cancel`} onClick={cancelOnClick}>Cancel</div> :
                        (shift.status === ShiftInStatus.ConfirmedOnEthereum || shift.status === ShiftOutStatus.ReturnedFromRenVM) ?
                            <div role="button" className={`popup--cancel`} onClick={onDone}>Close</div> :
                            <div role="button" className={`popup--x`} onClick={pauseOnClick} />
                    :
                    <></>
                }
            </div> : <></>}
            <div className="main">
                {loggedOut && !paused ?
                    <ErrorBoundary><LoggedOutPopup oldAccount={loggedOut} /></ErrorBoundary> :
                    shift ? <ErrorBoundary>< OpeningShift /></ErrorBoundary> : <></>
                }
                {window === window.top ? <span className="not-in-iframe">See <a href="https://github.com/renproject/gateway-js" target="_blank" rel="noopener noreferrer">github.com/renproject/gateway-js</a> for more information about GatewayJS.</span> : <></>}
                {!paused && shift ? <ProgressBar /> : <></>}
            </div>
            {!paused && <Footer />}
        </main>;
    }
));