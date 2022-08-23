import { FFmpeg } from "@ffmpeg/ffmpeg";
import {
  Box,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { advanceStep, setFileUrl } from "../slices/appSlice";

interface IStepProps {
  text: string;
  value: number;
  current: number;
  progress: number;
}

interface IProps {
  ffmpeg: FFmpeg;
}

// TODO add type
const getFrameBounds = (info: any) => ({
  height: info.frame === 0 ? info.maxHeight : Math.floor(Math.abs(Math.cos((info.frame / (info.frameRate / info.tempo)) * Math.PI) * (info.maxHeight - 2))) + 2,
});

const Step = ({ text, value, current, progress }: IStepProps) => {
  const isActive = current === value;
  const isCompleted = current > value;
  const progressValue = isActive ? progress : isCompleted ? 100 : 0;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container alignItems="center">
        <Grid item xs={1}>
          {isActive && <CircularProgress />}
        </Grid>
        <Grid item xs={3}>
          {text}
        </Grid>
        <Grid item xs={8}>
          <LinearProgress variant="determinate" value={progressValue} />
        </Grid>
      </Grid>
    </Box>
  );
};

enum Operation {
  Extract,
  Split,
  Modify,
  Merge,
  Cleanup,
}

export default function StepProcess({ ffmpeg }: IProps) {
  const {
    width: orgWidth,
    height: Orgheight,
    frameRate,
    frameCount,
  } = useSelector((state: RootState) => state.fileInfo);
  const resDivider = useSelector((state: RootState) => state.resDivider);
  const config = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();

  const width = orgWidth / resDivider;
  const height = Orgheight / resDivider;

  const [step, setStep] = useState(Operation.Extract);
  const [progress, setProgress] = useState(0);
  // const [log, setLog] = useState("");

  const handleProcess = async () => {
    // Setup logging to element
    //adds tons of lag
    //ffmpeg.setLogger(({ type, message }) => setLog(message));

    await ffmpeg.run(
      "-i",
      "video",
      "-vn",
      "-c:a",
      "libvorbis",
      "audio.webm"
    );

    setStep(Operation.Split);

    // Split file into frames
    await ffmpeg.run(
      "-i",
      "video",
      "-vf",
      `scale=${width}:${height}`,
      "%d.png"
    );

    setStep(Operation.Modify);

    const list = [];

    let lastWidth = -1;
    let lastHeight = -1;
    let sameSizeCount = 0;
    const compressionLevel = config.compression;

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
          "300K",
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

    setStep(Operation.Merge);

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

    dispatch(setFileUrl(url));

    setStep(Operation.Cleanup);

    Promise.all([
      ffmpeg.FS("unlink", "list.txt"),
      ffmpeg.FS("unlink", "audio.webm"),
      ffmpeg.FS("unlink", "video"),
      ...new Array(frameCount)
        .fill(0)
        .map((_, i) => ffmpeg.FS("unlink", `${i + 1}.png`)),
      list.map((string) => ffmpeg.FS("unlink", string.split(" ")[1])),
    ]);

    dispatch(advanceStep());
  };

  useEffect(() => {
    handleProcess();
  }, []);

  return (
    <div>
      <Box mt={2} mb={2}>
        <Step
          text="Extracting audio"
          value={0}
          current={step}
          progress={progress}
        />
        <Divider />
        <Step
          text="Splitting into frames"
          value={1}
          current={step}
          progress={progress}
        />
        <Divider />
        <Step
          text="Modifying frames"
          value={2}
          current={step}
          progress={progress}
        />
        <Divider />
        <Step
          text="Creating final video"
          value={3}
          current={step}
          progress={progress}
        />
        <Divider />
        <Step text="Cleaning up" value={4} current={step} progress={progress} />
      </Box>
    </div>
  );
}
