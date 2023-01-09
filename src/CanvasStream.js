export class CanvasStream extends WritableStream {
  constructor(canvas, draw) {
    super({
      write: (chunk) => draw(this.ctx, chunk),
    });
    this.ctx = canvas.getContext("2d");
  }
}
