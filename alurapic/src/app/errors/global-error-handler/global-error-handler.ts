import { Router } from '@angular/router';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import * as StackTrace from 'stacktrace-js';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { UserService } from 'src/app/core/user/user.service';
import { ServerLoginService } from './server-log.service';
import { environment } from 'src/environments/environment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const location = this.injector.get(LocationStrategy);
    const userService = this.injector.get(UserService);
    const serverLogService  = this.injector.get(ServerLoginService);
    const router = this.injector.get(Router);
    const url = location instanceof PathLocationStrategy ? location.path() : '';
    const message = error.message ? error.message : error.toString();
    
   if(environment.production)  router.navigate(['/error']);
    StackTrace
    .fromError(error)
    .then(stackFrames => {
      const stackAsString = stackFrames.map(sf => sf.toString())
                                        .join('\n');
      serverLogService.log({
        message, 
        url, 
        userName: userService.getUserName(),
      stack: stackAsString}).subscribe(
        () => console.log('error logged on server'),
        error => {
          console.log(error);
          console.log('Fail to send error log to server');
        }
      )
    })
  }
}
