import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
  readonly webkitRelativePath: string;
}

interface Props {
  onUpload: (file: File) => void;
}

const Upload = ({ onUpload }: Props) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  return (
    <section className="container">
      <div {...getRootProps({className: 'dropzone'})}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop a video here, or click to select a video</p>
      </div>
    </section>
  );
};

export default Upload;
