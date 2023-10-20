export const TYPES = {
  Api: Symbol('Api')
}

export interface IApi {
  onLoadVideoList: () => Promise<string[]>
  onLostPutVideosPresignedUrl: (objectKey: string) => Promise<string>
}
