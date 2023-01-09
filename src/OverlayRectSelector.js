const ev = (c) => (e) => {
  e.preventDefault();
  e.stopPropagation();
  c(e);
};

export class OverlayRectSelector {
  constructor(overlay, rectSelected) {
    this.overlay = overlay;
    this.ctx = overlay.getContext("2d");
    this.rectSelected = rectSelected;
    this.isDown = false;
    this.startX = null;
    this.startY = null;

    overlay.onmousedown = this.onmousedown.bind(this);
    overlay.onmousemove = this.onmousemove.bind(this);
    overlay.onmouseout = this.onmouseup.bind(this);
    overlay.onmouseup = this.onmouseup.bind(this);
  }

  drawRect = (e) => {
    const { offsetX, offsetY } = this.rel(e);

    this.ctx.clearRect(0, 0, this.overlay.width, this.overlay.height);

    this.ctx.lineWidth = this.overlay.width / 300;
    this.ctx.strokeStyle = "red";
    this.ctx.strokeRect(...this.abs(this.startX, this.startY, offsetX - this.startX, offsetY - this.startY));
  };

  onmousedown = ev((e) => {
    this.isDown = true;
    const { offsetX, offsetY } = this.rel(e);

    this.startX = offsetX;
    this.startY = offsetY;
  });

  onmousemove = ev((e) => {
    if (!this.isDown) return;
    this.drawRect(e);
  });

  onmouseup = ev((e) => {
    if (!this.isDown) return;
    this.isDown = false;
    
    this.drawRect(e);

    const { offsetX, offsetY } = this.rel(e);
    this.rectSelected(...this.abs(this.startX, this.startY, offsetX - this.startX, offsetY - this.startY));
  });

  abs = (x,y,w,h) => [x * this.overlay.width, y * this.overlay.height, w * this.overlay.width, h * this.overlay.height];
  rel = (e) => {
    const { width, height } = this.overlay.getBoundingClientRect();
    return {
      offsetX: e.offsetX / width,
      offsetY: e.offsetY / height,
    };
  };
}
