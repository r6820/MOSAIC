export type ButtonProps<T> = {
    id: string;
    label: string;
    onClick: (props: T) => void;
}

export type ButtonContainerProps<T> = {
    buttons: ButtonProps<T>[]
}

export type SelectOption<T> = {
    value: T,
    label: string
}

export type SelectOptions<T> = {
    id: string,
    label: string,
    options: SelectOption<T>[],
    defaultValue: SelectOption<T>
}

export type SelectContainerProps<T> = {
    selectOptionsArray: SelectOptions<T>[],
    buttonProps: ButtonProps<SelectOption<T>[]>
}