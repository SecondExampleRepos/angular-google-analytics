import { SourceMapGenerator } from 'source-map';

/**
 * TypeScript service to handle source maps.
 */
export class SourceMapService {
  private sourceMapGenerator: SourceMapGenerator;

  constructor() {
    this.sourceMapGenerator = new SourceMapGenerator({
      file: "mappedFile.js"
    });
  }

  /**
   * Adds a mapping to the source map.
   * @param generatedLine The line number in the generated file.
   * @param generatedColumn The column number in the generated file.
   * @param originalLine The line number in the original source file.
   * @param originalColumn The column number in the original source file.
   * @param source The file name of the original source file.
   * @param name An optional name of the original identifier.
   */
  addMapping(generatedLine: number, generatedColumn: number, originalLine: number, originalColumn: number, source: string, name?: string) {
    this.sourceMapGenerator.addMapping({
      generated: {
        line: generatedLine,
        column: generatedColumn
      },
      original: {
        line: originalLine,
        column: originalColumn
      },
      source: source,
      name: name
    });
  }

  /**
   * Sets the source content for a source file.
   * @param sourceFile The filename of the source file.
   * @param sourceContent The content of the source file.
   */
  setSourceContent(sourceFile: string, sourceContent: string) {
    this.sourceMapGenerator.setSourceContent(sourceFile, sourceContent);
  }

  /**
   * Generates the source map.
   * @returns The JSON string representation of the source map.
   */
  generateSourceMap(): string {
    return this.sourceMapGenerator.toString();
  }
}