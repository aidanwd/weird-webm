import Upload, { File } from "./Upload";
import { FFprobeWorker } from "ffprobe-wasm";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useState, useRef } from "react";
import { LinearProgress } from "@mui/material";
import { Container } from "@mui/system";

// TODO add type
const getFrameBounds = (info: any) => ({
  height:
    info.frame === 0
      ? info.maxHeight
      : Math.floor(
          Math.abs(
            Math.cos((info.frame / (info.frameRate / info.tempo)) * Math.PI) *
              (info.maxHeight - 1)
          )
        ) + 1,
});

const ffmpeg = createFFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  log: true,
});

enum Operation {
  Load,
  Split,
  Modify,
  Merge,
}

function App() {
  const [log, setLog] = useState("");
  const [operationText, setOperation] = useState("");
  const [videoSrc, setVideoSrc] = useState("");
  const [progress, setProgress] = useState(0);
  const operation = useRef(Operation.Load);

  const handleUpload = async (file: File) => {
    const worker = new FFprobeWorker();
    const fileInfo = await worker.getFileInfo(file);
    console.log(fileInfo);
    console.log(file);

    // Only load ffmpeg if it is not already loaded
    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    const videoInfo = fileInfo.streams[0];

    const frameRate = parseInt(videoInfo.r_frame_rate.split("/")[0]);
    const frameCount = parseInt(videoInfo.nb_frames);
    const width = videoInfo.codec_width / 4;
    const height = videoInfo.codec_height / 4;

    // Setup logging to element
    ffmpeg.setLogger(({ type, message }) => {
      setLog(message);

      if (operation.current !== Operation.Modify) {
        const matches = message.match(/frame=\s+(\d+)/);
        if (matches) {
          setProgress((parseInt(matches[1]) / (frameCount - 1)) * 100);
        }
      }
    });

    console.log(frameRate, frameCount, width, height);

    setOperation("Loading video");

    // Load file into ffmpeg FS
    await ffmpeg.FS("writeFile", "video.mp4", await fetchFile(file));

    setOperation("Extracting audio");

    await ffmpeg.run(
      "-i",
      "video.mp4",
      "-vn",
      "-c:a",
      "libvorbis",
      "audio.webm"
    );

    setOperation("Splitting video into frames");

    // Split file into frames
    await ffmpeg.run(
      "-i",
      "video.mp4",
      "-vf",
      `scale=${width}:${height}`,
      "%d.png"
    );

    setOperation("Modifying frames");

    operation.current = Operation.Modify;

    const list = [];

    let lastWidth = -1;
    let lastHeight = -1;
    let sameSizeCount = 0;
    const compressionLevel = 5;

    for (let i = 0; i < frameCount; i++) {
      setProgress((i / frameCount) * 100);

      const infoObject = {
        frame: i,
        maxWidth: width,
        maxHeight: height,
        frameCount: frameCount,
        frameRate: frameRate,
        tempo: 1, // TODO
        angle: 360, //TODO
      };

      const frameBounds: any = {};
      const current: any = getFrameBounds(infoObject);

      if (current.width !== undefined) frameBounds.width = current.width;
      if (current.height !== undefined) frameBounds.height = current.height;
      if (current.command !== undefined) frameBounds.command = current.command;

      if (frameBounds.width === undefined) frameBounds.width = width;
      if (frameBounds.height === undefined) frameBounds.height = height;

      if (i === 0) {
        lastWidth = frameBounds.width;
        lastHeight = frameBounds.height;
      }

      if (
        Math.abs(frameBounds.width - lastWidth) +
          Math.abs(frameBounds.height - lastHeight) >
          compressionLevel ||
        i === frameCount - 1
      ) {
        // Convert to webm
        await ffmpeg.run(
          "-r",
          frameRate.toString(),
          "-start_number",
          (i - sameSizeCount + 1).toString(),
          "-i",
          "%d.png",
          "-frames:v",
          sameSizeCount.toString(),
          "-c:v",
          "vp8",
          "-b:v",
          "1M",
          "-crf",
          "10",
          "-vf",
          `scale=${frameBounds.width}x${frameBounds.height}`,
          "-aspect",
          `${frameBounds.width}:${frameBounds.height}`,
          "-f",
          "webm",
          `${i}.webm`
        );

        list.push(`file ${i}.webm`);

        sameSizeCount = 1;
        lastWidth = frameBounds.width;
        lastHeight = frameBounds.height;
      } else {
        sameSizeCount++;
      }
    }

    console.log(list);

    // Create file list for ffmpeg
    const enc = new TextEncoder();
    await ffmpeg.FS("writeFile", "list.txt", enc.encode(list.join("\n")));

    operation.current = Operation.Merge;

    setOperation("Creating final video");

    // Create final webm file
    await ffmpeg.run(
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      "list.txt",
      "-i",
      "audio.webm",
      "-c",
      "copy",
      "final.webm"
    );

    const data = await ffmpeg.FS("readFile", "final.webm");

    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/webm" })
    );
    setVideoSrc(url);
    console.log(url);
  };

  return (
    <Container>
      <div>{operationText}</div>
      <div>{log}</div>
      <LinearProgress variant="determinate" value={progress} />
      <Upload onUpload={handleUpload} />
      <video src={videoSrc} controls></video>
    </Container>
  );
}

export default App;
