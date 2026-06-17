import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Delete,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    const result = await this.mediaService.uploadFile(file, folder);
    return {
      success: true,
      data: result,
      message: 'File uploaded successfully',
    };
  }

  @Delete(':fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    await this.mediaService.deleteFile(fileId);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }
}
