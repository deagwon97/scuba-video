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

      const fileLength = file.size;

      const onUploadProgress = (progressEvent: AxiosProgressEvent) => {
        const { loaded, total } = progressEvent;
        let percentCompleted = 0;
        if (total) {
          percentCompleted = Math.round( (loaded * 100) / total );
          setUploadPercentage(percentCompleted);
        }
        if (!total) {
          percentCompleted = 50;
          setUploadPercentage(percentCompleted);
        }
      }

  
      try {
        const objectKey = `${directoryName}/${file.name}`;
        const url = await onLostPutVideosPresignedUrl(uploadSecret, fileType, objectKey);


        const res = await axios.put(url, file,
          {
            headers: {
              "Content-Type": fileType,
              "Cache-Control": "no-cache",
            },
            onUploadProgress
          }
          ).then((res) => {
          console.log(res);
          setTimeout(() => {
            setUploadPercentage(0)
            window.location.reload();
          }, 1000);
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
                        <input type="text" 
                                placeholder="폴더명(날짜)" 
                                value={directoryName}
                                onChange={onDirectoryNameChange} />
                    </div>
                    <div className="files-container">
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

interface DeleteModalProps {
  objectKey: string;
  isOpen: boolean;
  modalHandler: React.Dispatch<React.SetStateAction<boolean>>;
}

const DeleteModal: React.FC<DeleteModalProps> = (
  {
    objectKey, 
    isOpen, 
    modalHandler
  }
) => {
  const [isModalOpen, setIsModalOpen] = React.useState(isOpen);
  const [secret, setSecret] = React.useState('');

  React.useEffect(() => {
    setIsModalOpen(isOpen)
  }, [isOpen]);

  const handleDelete = async () => {
      await axios.delete(`/api/object?objectKey=${objectKey}`, { data: { secret: secret } });
      alert('삭제되었습니다.');
      modalHandler(false);
      window.location.reload();
  };

  return (
    <div className={isModalOpen ? 'modal open' : 'modal'}>
      <div className={'modal-box'}>
        <strong>{objectKey}</strong>
        <input 
          type="password"
          placeholder="Enter secret"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
        />
        <button 
          className="modal-close-button"
          onClick={handleDelete}>삭제</button>
      </div>
    </div>
  );
};

export const VideoList = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [videoList, setVideoList] = React.useState<null | DirVideos[]>();
    const [selectedObectKey, setSelectedObjectKey] = React.useState<string>('');
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
                      <ul>
                          <li className="video-link">
                            <strong>{dirVideos.dir}</strong>
                          </li>
                          {dirVideos.videos.map(video => (
                            <div key={video} >
                              <li className="video-link">
                                <Link to={`/video?object=${dirVideos.dir}/${video}`}>
                                    {video}
                                </Link>
                                <button className="delete-button" onClick={() => {
                                  setIsOpen(!isOpen)
                                  setSelectedObjectKey(`${dirVideos.dir}/${video}`)
                                }}>x</button>
                              </li>
                              
                            </div>
                          ))}
                      </ul>
                  </li>
              ))}
          </ul>
          <DeleteModal
              objectKey={selectedObectKey}
              isOpen={isOpen}
              modalHandler={setIsOpen}
          />
      </div>
    </div>
  );
};