import { FastAverageColor } from "fast-average-color";
const fac = new FastAverageColor()

import { CanvasStream } from "./CanvasStream";
import { HomeAssistant, HomeAssistantConnectedEvent, HomeAssistantDisconnectedEvent } from "./HomeAssistant";
import { OverlayRectSelector } from "./OverlayRectSelector";
import { HSVtoRGB, RGBtoHSV } from "./utils";
import { VideoCropper } from "./VideoCropper";

const startElem = document.getElementById("start");

const video = document.getElementById("video");
const overlay = document.getElementById("overlay");

const cropped = document.getElementById("cropped");
const output = document.getElementById("color");

const connect = document.getElementById("connect");
const disconnect = document.getElementById("disconnect");
const entitySelect = document.getElementById("entity-select");
const light_entityid = document.getElementById("light_entityid")
entitySelect.style.display = "none";
disconnect.style.display = "none";

const homeAssistant = new HomeAssistant();
const predefinedLight = localStorage.getItem("light_entityid")
if(predefinedLight) {
  homeAssistant.setEntity(predefinedLight)
  light_entityid.innerHTML = predefinedLight
}
homeAssistant.addEventListener(HomeAssistantConnectedEvent.type, (e) => {
  connect.style.display = "none";
  disconnect.style.display = "block";
  entitySelect.style.display = "block";
});

homeAssistant.addEventListener(HomeAssistantDisconnectedEvent.type, (e) => {
  connect.style.display = "block";
  disconnect.style.display = "none";
});

homeAssistant.load();

connect.onclick = async () => {
  await homeAssistant.authenticate();
};
disconnect.onclick = async () => {
  await homeAssistant.disconnect();
};
entitySelect.onclick = async() => {
  const entityId = prompt("Which light do you want to use?\nMust be one of these:\n\n"+homeAssistant.lights.join("\n"), localStorage.getItem("light_entityid") ?? homeAssistant.lights[0]);
  homeAssistant.setEntity(entityId)
  localStorage.setItem("light_entityid", entityId)
  light_entityid.innerHTML = entityId
}

const createCroppedCanvasStream = () => new CanvasStream(cropped, (ctx, videoFrame) => {
  if (cropped.width !== videoFrame.displayWidth || cropped.height !== videoFrame.displayHeight) {
    cropped.width = videoFrame.displayWidth;
    cropped.height = videoFrame.displayHeight;
  }

  ctx.clearRect(0, 0, video.width, video.height);
  ctx.drawImage(videoFrame, 0, 0);
  videoFrame.close();

  const color = fac.getColor(cropped, {
    algorithm: "dominant",
    ignoredColor: [
      [0, 0, 0, 255, 50],
      [255, 255, 255, 255, 50],
    ],
  });

  var averageColor
  const hsv = RGBtoHSV(...color.value);
  if (hsv.h == 0) {
    averageColor = [0, 0, 0];
  } else {
    const trueColor = HSVtoRGB(hsv.h, 1, 1);
    averageColor = [trueColor.r, trueColor.g, trueColor.b];
  }

  output.style["background-color"] = `rgb(${averageColor.join(",")})`;
  homeAssistant.setColor(averageColor)
});

const videoCropper = new VideoCropper();
const overlayRectSelector = new OverlayRectSelector(overlay, (..._) => videoCropper.cropVideo(video.srcObject, createCroppedCanvasStream(), ..._));

startElem.onclick = async () => {
  const capture = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: "never",
    },
    audio: false,
  });

  video.srcObject = capture;
  const track = capture.getVideoTracks()[0];
  const processor = new MediaStreamTrackProcessor(track);

  const canvasStream = new CanvasStream(video, (ctx, videoFrame) => {
    if (video.width !== videoFrame.displayWidth || video.height !== videoFrame.displayHeight) {
      video.width = videoFrame.displayWidth;
      video.height = videoFrame.displayHeight;

      const { width, height, left, top } = video.getBoundingClientRect();
      overlay.width = video.width;
      overlay.height = video.height;
      console.log(video.width, overlay.width);
      // overlay.style.width = width + "px";
      // overlay.style.height = height + "px";
      overlay.style.left = left + "px";
      overlay.style.top = top + "px";
    }

    ctx.clearRect(0, 0, video.width, video.height);
    ctx.drawImage(videoFrame, 0, 0);
    videoFrame.close();
  });

  processor.readable.pipeTo(canvasStream);

  startElem.style.display = "none";
};
