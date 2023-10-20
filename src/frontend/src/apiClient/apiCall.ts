import axios from 'axios'


export type DirVideos = {
    dir: string
    videos: string[]
}

export const onLoadVideoList: () => Promise<DirVideos[]> = async () => {
    const result = await axios.get('http://localhost:8000/api/list')
    const videoList = result.data.result as DirVideos[]
    return videoList
}
type Data = {
    secret: string
}

export const onLostPutVideosPresignedUrl: (objectKey: string) => Promise<string> = async (objectKey: string) => {
    const secret: Data = {
        secret: 'scuba'
    };

    const result = await axios.post(`http://localhost:8000/api/presingedUrl?objectKey=${objectKey}`,
        secret
    )
    const presignedUrl = result.data.result as string
    return presignedUrl
}