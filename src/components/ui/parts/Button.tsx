import { ButtonProps } from "@/components";

export const Button = (props: ButtonProps) => {
    return (
        <button id={props.id} onClick={props.onClick}>
            {props.label}
        </button>
    )
}
