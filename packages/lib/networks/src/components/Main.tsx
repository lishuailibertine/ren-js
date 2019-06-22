import * as qs from "query-string";
import * as React from "react";

import { OrderedMap } from "immutable";
import { Format, formatFn } from "lib/layouts";
import { titleCase } from "change-case";
import { RouteComponentProps, withRouter } from "react-router";

import { NetworkData } from "../lib/networks";
import { ReactComponent as Home } from "../styles/home.svg";
import Network from "./Network";

const defaultState = {
    format: Format.TABLE,
    network: "mainnet",
};


interface MainProps extends RouteComponentProps {
    networks: OrderedMap<string, NetworkData>;
}

class Main extends React.Component<MainProps, typeof defaultState> {
    constructor(props: MainProps) {
        super(props);
        this.state = defaultState
    }
    public async componentDidMount() {
        const network = qs.parse(this.props.location.search).network;
        if (network && typeof network === "string" && this.props.networks.has(network)) {
            this.setState({ network });
        }
    }
    public render() {
        const { networks } = this.props;
        const { format, network } = this.state;
        console.log(networks);

        return (
            <div className="Main">
                <a style={{ position: "absolute", top: "20px", left: "20px" }} className="home-link" href="https://republicprotocol.github.io/tool-index/">
                    <Home style={{ height: "30px", width: "30px" }} />
                </a>
                <div className="network controls">
                    <h1>Contract Index</h1>
                    <table className="config-table">
                        <tr>
                            {networks.map((_: NetworkData | undefined, networkName: string | undefined) =>
                                <td key={networkName} className={network === networkName ? `config-checked` : ""}>
                                    <label><input type="radio"
                                        name="network"
                                        value={networkName}
                                        checked={network === networkName}
                                        onChange={this.handleInput}
                                    />
                                        {titleCase(networkName || "")}
                                    </label></td>
                            ).valueSeq().toArray()
                            }
                        </tr></table>
                    <br />
                    <table className="config-table">
                        <tr>
                            {formatFn.map((_, formatOpt: string | undefined) =>
                                <td key={formatOpt} className={format === formatOpt ? `config-checked` : ""}>
                                    <label>
                                        <input type="radio"
                                            name="format"
                                            value={formatOpt}
                                            checked={format === formatOpt}
                                            onChange={this.handleInput}
                                        />
                                        {formatOpt}
                                    </label>
                                </td>
                            ).toArray()}
                        </tr>
                    </table>
                </div>
                <Network
                    key={network}
                    format={formatFn.get(format)}
                    networkData={networks.get(network)}
                />)
            </div >
        );
    }

    private handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
        const element = (event.target as HTMLInputElement);
        this.setState((state) => ({ ...state, [element.name]: element.value }));
    }

}

export default withRouter(Main);