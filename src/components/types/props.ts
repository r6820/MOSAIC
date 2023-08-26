export type ButtonProps = {
    id: string;
    label: string | JSX.Element;
    onClick: () => void;
}

export type ButtonContainerProps = {
    buttons: ButtonProps[]
}

export type RoomProps = {
    id: number,
    size: number,
    player1: string,
    player2: string,
    state: string,
}