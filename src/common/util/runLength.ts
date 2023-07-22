export function runLengthEncode(array: number[]): number[] {
    if (array.length == 0) { return [] }
    let dataArray: number[] = [...array];
    let lengthArray: number[] = [];
    const compArray: number[] = [];
    let counter = 0;
    let current = dataArray.shift() as number;
    while (dataArray.length > 0) {
        if (dataArray[0] == current) {
            if (counter >= 0) {
                counter += 1;
            } else {
                counter = counter == -1 ? 1 : counter
                lengthArray.push(counter);
                counter = 1;
            }
        } else {
            if (counter > 0) {
                counter += 1;
                counter = counter == -1 ? 1 : counter
                lengthArray.push(counter);
                counter = 0;
            } else {
                counter -= 1;
            }
        }

        current = dataArray.shift() as number;
    }

    counter = counter == 0 ? 1 : counter > 0 ? counter + 1 : counter - 1;
    lengthArray.push(counter);

    dataArray = [...array]
    while (lengthArray.length > 0) {
        let l = lengthArray.shift() as number;
        if (l > 0) {
            compArray.push(l, dataArray.splice(0, l)[0]);
        } else {
            compArray.push(l, ...dataArray.splice(0, -l));
        }
    }
    return compArray
}

export function runLengthDecode(array: number[]): number[] {
    array = [...array]
    const plainArray: number[] = [];
    let length = 0;
    while (array.length > 0) {
        length = array.shift() as number;
        if (length > 0) {
            plainArray.push(...new Array(length).fill(array.shift()))
        } else {
            plainArray.push(...array.splice(0, -length))
        }
    }

    return plainArray
}