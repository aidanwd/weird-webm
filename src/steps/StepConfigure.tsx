import { Button, Card, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { advanceStep } from "../slices/appSlice";

export default function StepConfigure() {
  const fileInfo = useSelector((state: RootState) => state.fileInfo);
  const dispatch = useDispatch();

  const handleContinue = () => {
    dispatch(advanceStep());
  };

  return (
    <div>
      <Card>
        <Typography>
          Original resolution: {fileInfo.width}x{fileInfo.height}
        </Typography>
        <Typography>Framerate: {fileInfo.frameRate} FPS</Typography>
        <Typography>Frame count: {fileInfo.frameCount}</Typography>
      </Card>
      <Button onClick={handleContinue}>Continue</Button>
    </div>
  );
}
