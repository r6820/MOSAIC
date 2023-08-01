export const ext:string = 'mof'

export const defaultSize: number = 7;
export const offset: { x: number, y: number } = { x: 50, y: 50 };

export const width = 800;
export const height = 800;

export const boardLength: number = 700;
export const indicatorWidth: number = 20;

export const stoneRatio: number = 0.9;
export const holeRatio: number = 0.36;
export const delayTime: number = 300;

export const playerId: Record<string, number> = { first: 1, second: 2, neutral: 3 }
export const changePlayer = (p: number) => {
    if (p == playerId.first) {
        return playerId.second;
    }
    if (p == playerId.second) {
        return playerId.first;
    }
    return p;
}
export const colors: Record<string, number> = {
    'bg': 0x119944,
    'frame': 0xdeb887,
    'hole': 0x333333,
    'innactive': 0x444444,
    'rim': 0xffffff,
    'place': 0x225511,
    [`stone${playerId.neutral}`]: 0xbbbbbb,
    [`stone${playerId.first}`]: 0xbb22bb,
    [`stone${playerId.second}`]: 0x22bbbb,
}