import { Component, ReactNode } from "react";
import { Button,ButtonContainerProps } from "@/components";


export class ButtonContainer extends Component<ButtonContainerProps> {
    render(): ReactNode {
        const items = this.props.buttons.map((items) => <Button key={items.id} {...items} />);
        return (
            <div className='ButtonContainer'>
                {items}
            </div>
        );
    }
}