import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Feature Flag POC Backend está funcionando! 🚀';
  }
}
