import { Component, ReactNode } from "react";
import { ButtonProps } from "@/components";


export class Button extends Component<ButtonProps> {
    render(): ReactNode {
        return (
            <button id={this.props.id} onClick={this.props.onClick}>
                {this.props.label}
            </button>
        );
    }
}