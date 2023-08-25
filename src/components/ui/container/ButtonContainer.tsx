import { Button, ButtonContainerProps } from "@/components";


export const ButtonContainer = (props: ButtonContainerProps) => {
    const items = props.buttons.map((items) => <Button key={items.id} {...items} />);
    return (
        <div className='ButtonContainer'>
            {items}
        </div>
    );
}