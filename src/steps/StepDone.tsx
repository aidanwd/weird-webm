import { useSelector } from "react-redux";
import { RootState } from "..";

export default function StepDone() {
  const videoUrl = useSelector((state: RootState) => state.fileUrl);

  return (
    <div>
      <video src={videoUrl} controls></video>
    </div>
  );
}
