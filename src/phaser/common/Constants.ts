export class Constants {
    static defaultSize: number = 7;
    static offset: { x: number, y: number } = { x: 50, y: 50 };

    static width = 800;
    static height = 800;

    static boardLength: number = 700;

    static stoneRatio: number = 0.9
    static holeRatio: number = 0.36

    static playerId: Record<string, number> = { first: 1, second: 2, neutral: 3 }
    static changePlayer(p: number) {
        if (p == this.playerId.first) {
            return this.playerId.second;
        }
        if (p == this.playerId.second) {
            return this.playerId.first;
        }
        return p;
    }
    static colors: Record<string, number> = {
        'bg': 0x229944,
        'frame': 0xdeb887,
        'hole': 0x444444,
        'rim': 0xffffff,
        [`stone${this.playerId.neutral}`]: 0xaaaaaa,
        [`stone${this.playerId.first}`]: 0xaa22aa,
        [`stone${this.playerId.second}`]: 0x22aaaa,
        // 'stone2': 0xaaaaaa,
        // 'stone1': 0xaa22aa,
        // 'stone-1': 0x22aaaa,
    }
}