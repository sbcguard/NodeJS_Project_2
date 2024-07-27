import { HttpException } from './root';

export class UnprcessableEntity extends HttpException {
  constructor(error: any, message: string, errorCode: number) {
    super(message, errorCode, 422, error);
  }
}
