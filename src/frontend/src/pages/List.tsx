import axios, { AxiosProgressEvent } from "axios";
import React from "react";
import {onLoadVideoList, onLostPutVideosPresignedUrl} from "../apiClient/apiCall";
import {DirVideos} from "../apiClient/apiCall";
import { Link } from "react-router-dom";
import "./List.css"

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

const FileUpload: React.FC = () => {
    const [file, setFile]  = React.useState<File | null>(null);
    const [directoryName, setDirectoryName] = React.useState<string>('');
    const [activateButton, setActivateButton] = React.useState<boolean>(false);
    const [uploadPercentage, setUploadPercentage] = React.useState<number>(0);
 
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        setFile(e.target.files[0]);
        setUploadPercentage(0);
      }
    };

    const onSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!file) return;
      const fileType = file.type
  
      try {
        const objectKey = `${directoryName}/${file.name}`;
        console.log(fileType);
        const url = await onLostPutVideosPresignedUrl(uploadSecret, fileType, objectKey);
        
        await axios.put(url, file, {
          headers: {
            "Content-Type": fileType
          },
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            const { loaded, total } = progressEvent;
            let percent = Math.floor((loaded * 100) / (total as number));
            setUploadPercentage(percent);
            if (percent === 100) {
              setTimeout(() => setUploadPercentage(0), 1000);
              window.location.reload();
            }
          },
        });
      } catch (error) {
        console.error("There was an error uploading the file", error);
      }
    };

    const onDirectoryNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDirectoryName(e.target.value);
    };

    const [uploadSecret, setUploadSecret] = React.useState<string>('');
    const onUploadSecretChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadSecret(e.target.value);
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
                        <h4>암호: </h4>
                        <input type="password" 
                                placeholder="Enter password" 
                                value={uploadSecret}
                                onChange={onUploadSecretChange} />
                    </div>
                    <div className="files-container">
                        <label htmlFor="file-upload" className="custom-file-upload">
                        파일 선택
                        </label>
                        <input id="file-upload" type="file" onChange={onChange} />
                    </div>
                    <div>
                        {file && (
                            <div>
                                <h5 key={file.name}>{file.name}</h5>
                            </div>
                        )}
                    </div>
                    <button className="upload-button" onClick={onSubmit}>Upload</button>
                    <div className="progress-box">
                      <progress value={uploadPercentage} max="100" />
                    </div>
                    <div className="progress-percent">
                      {uploadPercentage}{' '}% 
                    </div>
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
                              <Link key={video} to={`/video?object=${dirVideos.dir}/${video}`}>
                                  <li>{video}</li>
                              </Link>
                          ))}
                      </ul>
                  </li>
              ))}
          </ul>
      </div>
    </div>
  );
};