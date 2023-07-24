import { Component, ReactNode } from "react";
import { Button } from "..";

type Props = {
    buttons: Array<{
        id: string,
        label: string,
        onClick: () => void
    }>
}


export class ButtonContainer extends Component<Props> {
    render(): ReactNode {
        const items = this.props.buttons.map((items) => <Button key={items.id} {...items} />);
        return (
            <div>
                {items}
            </div>
        );
    }
}