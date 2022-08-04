import { fetchFile, FFmpeg } from "@ffmpeg/ffmpeg";
import { FFprobeWorker } from "ffprobe-wasm";
import { useDispatch } from "react-redux";
import { advanceStep, setFileInfo } from "../slices/appSlice";
import Upload, { File } from "../Upload";

interface IProps {
  ffmpeg: FFmpeg;
}

export default function StepUpload({ ffmpeg }: IProps) {
  const dispatch = useDispatch();

  const handleUpload = async (file: File) => {
    const worker = new FFprobeWorker();
    const fileInfo = await worker.getFileInfo(file);

    const videoInfo = fileInfo.streams[0];

    const frameRate = parseInt(videoInfo.r_frame_rate.split("/")[0]);
    const frameCount = parseInt(videoInfo.nb_frames);
    const width = videoInfo.codec_width;
    const height = videoInfo.codec_height;

    // Load file into ffmpeg FS
    await ffmpeg.FS("writeFile", "video.mp4", await fetchFile(file));

    dispatch(setFileInfo({ frameRate, frameCount, width, height }));
    dispatch(advanceStep());
  };

  return (
    <div>
      <Upload onUpload={handleUpload} />
    </div>
  );
}
