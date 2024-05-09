import { SourceMapGenerator } from 'source-map';

// Define the TypeScript service class
export class SourceMapService {
  private sourceMapGenerator: SourceMapGenerator;

  constructor() {
    this.sourceMapGenerator = new SourceMapGenerator({
      file: "mappedFile.js"
    });
  }

  // Add a mapping to the source map
  addMapping(source: string, generatedLine: number, generatedColumn: number, originalLine: number, originalColumn: number, name?: string) {
    this.sourceMapGenerator.addMapping({
      source,
      generated: {
        line: generatedLine,
        column: generatedColumn
      },
      original: {
        line: originalLine,
        column: originalColumn
      },
      name
    });
  }

  // Set the content for a source file
  setSourceContent(source: string, sourceContent: string) {
    this.sourceMapGenerator.setSourceContent(source, sourceContent);
  }

  // Generate the source map
  generateSourceMap(): string {
    return this.sourceMapGenerator.toString();
  }
}