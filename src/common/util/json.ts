export function fromJSONtoArray<T>(jsonstring: string): T[] {
    let arr: T[] = [];
    try {
        arr = JSON.parse(jsonstring) as T[];
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }
        alert('ERROR: Invalid')
    } finally {
        return arr
    }
}

export function toJSON<T>(obj: T): string {
    return JSON.stringify(obj)
}