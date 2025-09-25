declare module 'expo-image-picker' {
  export interface ImagePickerOptions {
    mediaTypes?: 'Images' | 'Videos' | 'All';
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    allowsMultipleSelection?: boolean;
    selectionLimit?: number;
    videoMaxDuration?: number;
    videoQuality?: 'low' | 'medium' | 'high';
    base64?: boolean;
    exif?: boolean;
  }

  export interface ImagePickerAsset {
    uri: string;
    width: number;
    height: number;
    type?: 'image' | 'video';
    fileName?: string;
    fileSize?: number;
    base64?: string;
    exif?: Record<string, any>;
    duration?: number;
  }

  export interface ImagePickerResult {
    canceled: boolean;
    assets?: ImagePickerAsset[];
  }

  export interface CameraPermissionResponse {
    status: 'granted' | 'denied' | 'undetermined';
    expires: 'never' | number;
    canAskAgain: boolean;
    granted: boolean;
  }

  export interface MediaLibraryPermissionResponse {
    status: 'granted' | 'denied' | 'undetermined';
    expires: 'never' | number;
    canAskAgain: boolean;
    granted: boolean;
    accessPrivileges?: 'all' | 'limited' | 'none';
  }

  export function launchImageLibraryAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function launchCameraAsync(options?: ImagePickerOptions): Promise<ImagePickerResult>;
  export function requestCameraPermissionsAsync(): Promise<CameraPermissionResponse>;
  export function requestMediaLibraryPermissionsAsync(): Promise<MediaLibraryPermissionResponse>;
  export function getCameraPermissionsAsync(): Promise<CameraPermissionResponse>;
  export function getMediaLibraryPermissionsAsync(): Promise<MediaLibraryPermissionResponse>;

  export const MediaTypeOptions: {
    All: 'All';
    Videos: 'Videos';
    Images: 'Images';
  };
}
