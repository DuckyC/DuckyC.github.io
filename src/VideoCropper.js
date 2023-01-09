export class VideoCropper {
    cropVideo = (source, destination, x, y, width, height) => {
        if (this.worker) {
            this.worker.terminate();
        }
        this.worker = new Worker(new URL('./worker.js', import.meta.url), { name: "CropWorker" });
        const [track] = source.getTracks();
        const processor = new MediaStreamTrackProcessor({ track });
        const { readable } = processor;
      
        const generator = new MediaStreamTrackGenerator({ kind: "video" });
        const { writable } = generator;
      
        const mediaStream = new MediaStream([generator]);
      
        const processor2 = new MediaStreamTrackProcessor({
          track: mediaStream.getVideoTracks()[0],
        });
        const readable2 = processor2.readable;
      
        readable2.pipeTo(destination);
      
        this.worker.postMessage(
          {
            x,
            y,
            width,
            height,
            readable,
            writable,
          },
          [readable, writable]
        );
      }
}