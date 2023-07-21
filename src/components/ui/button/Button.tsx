import { Component, ReactNode } from "react";

type Props = {
    id: string;
    label: string;
    onClick: ()=>void;
}

export class Button extends Component<Props> {
    render(): ReactNode {
        return (
            <button id={this.props.id} onClick={this.props.onClick}>
                {this.props.label}
            </button>
        );
    }
}