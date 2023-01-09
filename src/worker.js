const even = (x) => 2 * Math.round(x / 2);

function createTransformer(x, y, width, height) {
  x = even(x);
  y = even(y);
  width = even(width);
  height = even(height);
  return (frame, controller) => {
    const newFrame = new VideoFrame(frame, {
      visibleRect: { x, y, width, height },
    });
    
    controller.enqueue(newFrame);
    frame.close();
  };
}

onmessage = async (event) => {
  const { readable, writable, x, y, width, height } = event.data;
  readable
    .pipeThrough(
      new TransformStream({
        transform: createTransformer(x, y, width, height),
      })
    )
    .pipeTo(writable);
};
