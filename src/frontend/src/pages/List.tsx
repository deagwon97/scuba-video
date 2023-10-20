import React, { useEffect } from "react";
import {onLoadVideoList, onLostPutVideosPresignedUrl} from "../apiClient/apiCall";
import {DirVideos} from "../apiClient/apiCall";
import "./List.css"

const FileUpload: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = React.useState<FileList | null>(null);
    const [directoryName, setDirectoryName] = React.useState<string>('');
    const [activateButton, setActivateButton] = React.useState<boolean>(false);
  
    const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setSelectedFiles(e.target.files);
        console.log(e.target.files);
      }
    };

    const putVideosPresignedUrl = React.useCallback(async () => {
        console.log( await onLostPutVideosPresignedUrl("hi"))
    },[])
    React.useEffect(() => {
        putVideosPresignedUrl();
    }, [])
    const onDirectoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDirectoryName(e.target.value);
      };
  
    const onUpload = async () => {
      if (!selectedFiles) return;
  
      const formData = new FormData();
  
      Array.from(selectedFiles).forEach((file, index) => {
        formData.append(`file${index + 1}`, file);
      });
      if (directoryName) {
        formData.append('directoryName', directoryName);
      }
  
      try {
        const response = await fetch('YOUR_API_ENDPOINT', {
          method: 'PUT',
          body: formData,
        });
  
        if (response.ok) {
          console.log('Files uploaded successfully.');
        } else {
          console.error('File upload failed:', response.statusText);
        }
      } catch (error) {
        console.error('There was an error uploading the files:', error);
      }
    };
  
    return (
        <>
            <button className="plus-button" onClick={()=>
                {
                    setActivateButton(!activateButton)
                }
            }>+</button>
            {activateButton === true && (
                <div className="upload-container">
                    <div className="files-container">
                        <h4>폴더명: </h4>
                        <input type="text" 
                                placeholder="Enter directory name" 
                                value={directoryName}
                                onChange={onDirectoryNameChange} />
                    </div>
                    <div className="files-container">
                        <label htmlFor="file-upload" className="custom-file-upload">
                        Choose Files
                        </label>
                        <input id="file-upload" type="file" multiple onChange={onFilesChange} />
                    </div>
                    <div>
                        {selectedFiles && (
                            <div>
                            <h4>Files to upload:</h4>
                            <ul>
                                {Array.from(selectedFiles).map((file) => (
                                <li key={file.name}>{file.name}</li>
                                ))}
                            </ul>
                            </div>
                        )}
                    </div>
                    <button className="upload-button" onClick={onUpload}>Upload</button>
                </div>
            )}
        </>
    );
}

export const VideoList = () => {
    const [videoList, setVideoList] = React.useState<null | DirVideos[]>();
    const callOnLoadVideoList = React.useCallback(async () => {
        const videoList = await onLoadVideoList();
        setVideoList(videoList);
    }, []);
    React.useEffect(() => {
        callOnLoadVideoList();
    }
    , []);
  return (
    <div>
        <div className="container">
          <FileUpload />
          <ul>
              {videoList && videoList.map((dirVideos, idx) => (
                  <li key={idx}>
                      <strong>{dirVideos.dir}</strong>
                      <ul>
                          {dirVideos.videos.map(video => (
                              <a key={video} href={`/video?object=${dirVideos.dir}/${video}`}>
                                  <li>{video}</li>
                              </a>
                          ))}
                      </ul>
                  </li>
              ))}
          </ul>
      </div>
    </div>
  );
};