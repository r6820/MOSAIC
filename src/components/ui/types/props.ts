export type ButtonProps = {
    id: string;
    label: string;
    onClick: () => void;
}

export type ButtonContainerProps = {
    buttons: ButtonProps[]
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
    buttonProps: {
        id: string;
        label: string;
        onClick: (selectOptions: SelectOption<T>[]) => void;
    }

}