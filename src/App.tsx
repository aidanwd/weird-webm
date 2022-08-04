import Upload, { File } from "./Upload";
import { FFprobeWorker } from "ffprobe-wasm";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import { useState, useRef, useEffect } from "react";
import {
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { Container } from "@mui/system";
import StepUpload from "./steps/StepUpload";
import StepConfigure from "./steps/StepConfigure";
import StepDone from "./steps/StepDone";
import { useSelector } from "react-redux";
import { RootState } from ".";
import StepProcess from "./steps/StepProcess";

const ffmpeg = createFFmpeg({
  corePath: "https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js",
  log: true,
});

enum EStep {
  Upload,
  Configure,
  Process,
  Done,
}

function App() {
  const activeStep = useSelector((state: RootState) => state.activeStep);

  useEffect(() => {
    if (!ffmpeg.isLoaded()) {
      ffmpeg.load();
    }
  }, []);

  const handleUpload = async (file: File) => {
    const worker = new FFprobeWorker();
    const fileInfo = await worker.getFileInfo(file);

    console.log(fileInfo);
    console.log(file);

    // Only load ffmpeg if it is not already loaded

    const videoInfo = fileInfo.streams[0];

    const frameRate = parseInt(videoInfo.r_frame_rate.split("/")[0]);
    const frameCount = parseInt(videoInfo.nb_frames);
    const width = videoInfo.codec_width / 4;
    const height = videoInfo.codec_height / 4;

    const data = await ffmpeg.FS("readFile", "final.webm");

    const url = URL.createObjectURL(
      new Blob([data.buffer], { type: "video/webm" })
    );
    // setVideoSrc(url);
    console.log(url);
  };

  const renderStep = () => {
    switch (activeStep) {
      case EStep.Upload:
        return <StepUpload ffmpeg={ffmpeg} />;
      case EStep.Configure:
        return <StepConfigure />;
      case EStep.Process:
        return <StepProcess ffmpeg={ffmpeg} />;
      case EStep.Done:
        return <StepDone />;
    }
  };

  return (
    <Container>
      <Typography component="h1" variant="h1">
        Weird WebM
      </Typography>
      <Stepper activeStep={activeStep}>
        <Step>
          <StepLabel>Upload 🔼</StepLabel>
        </Step>
        <Step>
          <StepLabel>Configure 🔧</StepLabel>
        </Step>
        <Step>
          <StepLabel>Process ⚙️</StepLabel>
        </Step>
        <Step>
          <StepLabel>Done 🔽</StepLabel>
        </Step>
      </Stepper>
      {renderStep()}
      {/* <div>{operationText}</div>
      <div>{log}</div>
      <LinearProgress variant="determinate" value={progress} />
      <Upload onUpload={handleUpload} />
       */}
    </Container>
  );
}

export default App;
