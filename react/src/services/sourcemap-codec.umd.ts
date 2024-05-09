type Segment = number[];

class SourceMapCodec {
    private static charToInteger: { [key: number]: number } = {};
    private static chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    static {
        for (let i = 0; i < SourceMapCodec.chars.length; i++) {
            SourceMapCodec.charToInteger[SourceMapCodec.chars.charCodeAt(i)] = i;
        }
    }

    static decode(mappings: string): Segment[][] {
        const decoded: Segment[][] = [];
        let line: Segment[] = [];
        let segment: Segment = [0, 0, 0, 0, 0];
        let j = 0;
        for (let i = 0, shift = 0, value = 0; i < mappings.length; i++) {
            const c = mappings.charCodeAt(i);
            if (c === 44) { // ","
                this.segmentify(line, segment, j);
                j = 0;
            } else if (c === 59) { // ";"
                this.segmentify(line, segment, j);
                j = 0;
                decoded.push(line);
                line = [];
                segment[0] = 0;
            } else {
                const integer = SourceMapCodec.charToInteger[c];
                if (integer === undefined) {
                    throw new Error('Invalid character (' + String.fromCharCode(c) + ')');
                }
                const hasContinuationBit = integer & 32;
                integer &= 31;
                value += integer << shift;
                if (hasContinuationBit) {
                    shift += 5;
                } else {
                    const shouldNegate = value & 1;
                    value >>>= 1;
                    if (shouldNegate) {
                        value = value === 0 ? -0x80000000 : -value;
                    }
                    segment[j] += value;
                    j++;
                    value = shift = 0; // reset
                }
            }
        }
        this.segmentify(line, segment, j);
        decoded.push(line);
        return decoded;
    }

    private static segmentify(line: Segment[], segment: Segment, j: number): void {
        if (j === 4)
            line.push([segment[0], segment[1], segment[2], segment[3]]);
        else if (j === 5)
            line.push([segment[0], segment[1], segment[2], segment[3], segment[4]]);
        else if (j === 1)
            line.push([segment[0]]);
    }

    static encode(decoded: Segment[][]): string {
        let sourceFileIndex = 0;
        let sourceCodeLine = 0;
        let sourceCodeColumn = 0;
        let nameIndex = 0;
        let mappings = '';
        for (let i = 0; i < decoded.length; i++) {
            const line = decoded[i];
            if (i > 0)
                mappings += ';';
            if (line.length === 0)
                continue;
            let generatedCodeColumn = 0;
            const lineMappings: string[] = [];
            for (const segment of line) {
                let segmentMappings = SourceMapCodec.encodeInteger(segment[0] - generatedCodeColumn);
                generatedCodeColumn = segment[0];
                if (segment.length > 1) {
                    segmentMappings +=
                        SourceMapCodec.encodeInteger(segment[1] - sourceFileIndex) +
                        SourceMapCodec.encodeInteger(segment[2] - sourceCodeLine) +
                        SourceMapCodec.encodeInteger(segment[3] - sourceCodeColumn);
                    sourceFileIndex = segment[1];
                    sourceCodeLine = segment[2];
                    sourceCodeColumn = segment[3];
                }
                if (segment.length === 5) {
                    segmentMappings += SourceMapCodec.encodeInteger(segment[4] - nameIndex);
                    nameIndex = segment[4];
                }
                lineMappings.push(segmentMappings);
            }
            mappings += lineMappings.join(',');
        }
        return mappings;
    }

    private static encodeInteger(num: number): string {
        let result = '';
        num = num < 0 ? (-num << 1) | 1 : num << 1;
        do {
            let clamped = num & 31;
            num >>>= 5;
            if (num > 0) {
                clamped |= 32;
            }
            result += SourceMapCodec.chars[clamped];
        } while (num > 0);
        return result;
    }
}