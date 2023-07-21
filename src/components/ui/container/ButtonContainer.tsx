import { Component, ReactNode } from "react";
import { Button } from "..";

type Props = {
    onclickPrev: () => void;
    onclickNext: () => void 
}


export class PrevNext extends Component<Props> {
    render(): ReactNode {
        return (
            <>
                <Button id='prev-button' label='<prev' onClick={this.props.onclickPrev} />
                <Button id='next-button' label='next>' onClick={this.props.onclickNext} />
            </>
        );
    }
}