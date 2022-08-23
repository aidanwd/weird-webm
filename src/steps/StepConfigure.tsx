import { Alert, Box, Slider, Button, Card, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "..";
import { advanceStep, setConfig } from "../slices/appSlice";

export default function StepConfigure() {
  const fileInfo = useSelector((state: RootState) => state.fileInfo);
  const configInfo = useSelector((state: RootState) => state.config);
  const dispatch = useDispatch();

  const handleContinue = () => {
    dispatch(advanceStep());
  };

  return (
    <div>
      <Box mt={2} mb={2}>
        <Card>
          <Box m={2}>
          <Typography>
          Original resolution: {fileInfo.width}x{fileInfo.height}
        </Typography>
        <Typography>Video Codec: {fileInfo.videocodec}</Typography>
        <Typography>Framerate: {fileInfo.frameRate} FPS</Typography>
        <Typography>Duration: {fileInfo.duration} sec</Typography>
        <Typography>Streams: {fileInfo.streams}</Typography>
        <Typography>Frame count: {fileInfo.frameCount}</Typography>
        <Typography id="input-slider" gutterBottom>
          Split Interval: {configInfo.compression}
          </Typography>
        <Box sx={{ width: 500 }}>
          <Slider aria-label="Split Interval" defaultValue={10} valueLabelDisplay="auto" step={1} min={2} max={50} onChange={(e, compression) => {
            dispatch(setConfig({ compression }));
          }}/>
          
          <Alert severity="warning">Warning: Setting this value too low will cause your browser to run out of memory!</Alert>
        </Box>
          </Box>
        </Card>
      </Box>
      <Button variant="contained" onClick={handleContinue}>Continue</Button>
    </div>
  );
}
