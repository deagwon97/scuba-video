import axios from 'axios'


export type DirVideos = {
    dir: string
    videos: string[]
}

export const onLoadVideoList: () => Promise<DirVideos[]> = async () => {
    const result = await axios.get('/api/list')
    const videoList = result.data.result as DirVideos[]
    return videoList
}
type Data = {
    secret: string
}

export const onLostPutVideosPresignedUrl: (uploadSecret: string, objectKey: string) => Promise<string> = async (uploadSecret: string, objectKey: string) => {
    const secret: Data = {
        secret: uploadSecret
    };

    const result = await axios.post(`/api/presinged?objectKey=${objectKey}`,
        secret
    )
    const presignedUrl = result.data.url as string
    return presignedUrl
}