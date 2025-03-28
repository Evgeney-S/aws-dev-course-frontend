import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);

    // Get the presigned URL and upload the file
    try {
      if (!file) {
        throw new Error("No file selected to upload");
      }

      const requestParams = {
        method: "GET",
        url,
        params: {
            name: encodeURIComponent(file.name),
        },
        headers: {},
      };
      if(localStorage.getItem("authorization_token")){
        requestParams.headers = {
            Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        };
      };
      
      const response = await axios(requestParams);
      
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);
      const uploadUrl = response.data;
      const result = await fetch(response.data, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);
      setFile(undefined);
    } catch (error) {
      console.error("There was an error on uploading the file", error);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
