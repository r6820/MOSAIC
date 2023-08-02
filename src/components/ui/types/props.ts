export type ButtonProps = {
    id: string;
    label: string;
    onClick: ()=>void;
}

export type ButtonContainerProps = {
    buttons: Array<ButtonProps>
}