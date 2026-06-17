import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ImageKit, { toFile } from '@imagekit/nodejs';

@Injectable()
export class MediaService {
  private client: ImageKit;

  constructor(private configService: ConfigService) {
    this.client = new ImageKit({
      privateKey: this.configService.get<string>('IMAGEKIT_PRIVATE_KEY'),
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads') {
    try {
      // Use toFile helper to convert buffer to Uploadable
      const uploadableFile = await toFile(file.buffer, file.originalname);

      const response = await this.client.files.upload({
        file: uploadableFile,
        fileName: `${Date.now()}-${file.originalname}`,
        folder: folder,
      });

      return {
        url: response.url,
        fileId: response.fileId,
        name: response.name,
        thumbnailUrl: response.thumbnailUrl,
      };
    } catch (error) {
      console.error('ImageKit Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload image to ImageKit');
    }
  }

  async deleteFile(fileId: string) {
    try {
      await this.client.files.delete(fileId);
      return { success: true };
    } catch (error) {
      console.error('ImageKit Delete Error:', error);
      throw new InternalServerErrorException('Failed to delete image from ImageKit');
    }
  }

  getOptimizedUrl(path: string, transformations: any[] = []) {
    return this.client.helper.buildSrc({
      urlEndpoint: this.configService.get<string>('IMAGEKIT_URL_ENDPOINT'),
      src: path,
      transformation: transformations,
    });
  }
}
