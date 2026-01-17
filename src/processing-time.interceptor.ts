import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ProcessingTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const end: bigint = process.hrtime.bigint();
        const micros: number = Number((end - start) / 1_000n);

        const res = context.switchToHttp().getResponse();
        res.setHeader('X-Processing-Time-Micros', micros.toString());
      }),
    );
  }
}
