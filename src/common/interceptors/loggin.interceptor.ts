// src/common/interceptors/logging.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = req;

    const now = Date.now();
    console.log(`\n[Request] ${method} ${url}`);
    console.log(`- Params: ${JSON.stringify(params)}`);
    console.log(`- Query: ${JSON.stringify(query)}`);
    console.log(`- Body: ${JSON.stringify(body)}`);

    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - now;
        console.log(`[Response] ${method} ${url} - ${ms}ms\n`);
      }),
    );
  }
}
