declare module 'expo-document-picker' {
  export interface DocumentPickerOptions {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
    multiple?: boolean;
  }

  export interface DocumentPickerAsset {
    uri: string;
    name: string;
    size?: number;
    mimeType?: string;
    lastModified?: number;
    file?: File;
    output?: FileList | null;
  }

  export interface DocumentPickerResult {
    type: 'success' | 'cancel';
    canceled: boolean;
    uri?: string;
    name?: string;
    size?: number;
    mimeType?: string;
    lastModified?: number;
    file?: File;
    output?: FileList | null;
    assets?: DocumentPickerAsset[];
  }

  export function getDocumentAsync(options?: DocumentPickerOptions): Promise<DocumentPickerResult>;

  export const DocumentPickerTypes: {
    allFiles: string;
    images: string;
    plainText: string;
    pdf: string;
    video: string;
    audio: string;
  };
}
