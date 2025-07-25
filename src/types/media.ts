export type Upload = {
  metadata: unknown;
  url: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  thumbnailUrl: string | null;
  storageProvider: string;
  storageKey: string;
  isPublic: boolean;
};

export type PlacidTemplate = {
  uuid: string;
  title: string;
  thumbnail: string;
  width: number;
  height: number;
  layers: {
    name: string;
    type: string;
  }[];
};
