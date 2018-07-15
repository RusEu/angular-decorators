import { OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';


export function memoize() {
  let _cache: {[key: string]: any} = {};

  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {

    const value = descriptor.value;

    function returnFromCache(...args) {
      const key = `methodName:${args.join('-')}`;

      if (!_cache[key]) {
        _cache[key] = value.apply(this, args);
        console.log(`set cache for method ${methodName}`);
      }

      return _cache[key];
    }

    descriptor.value = returnFromCache;
    return descriptor;

  };
}

export function timeIt(times: number = 1) {
  return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
    const value = descriptor.value;
    function measurePerformance(...args) {
      const self = this;
      const start: number = performance.now();
      const end: number = Array(times).fill(0).reduce((prev, curr) => {
        value.apply(self, args);
        return prev + performance.now();
      }, 0);
      const finalTime = (end - start) / 1000;
      console.log(`Average call to ${methodName} took ${(finalTime / 1000) / times} seconds.`);
      return value.apply(this, args);
    };
    descriptor.value = measurePerformance;
    return descriptor;
  };
}

export interface UnsubscribeOnDestroyClass<T> {
  d$: Subject<any>;
}

export function UnsubscribeOnDestroyDecorator() {

  return <T extends {new(...args: any[]): UnsubscribeOnDestroyClass<T>}>(target: T) => {

    return class extends target implements OnDestroy {

      d$ = new Subject();

      ngOnDestroy() {
        const ngOnDestroy: Function = target.prototype.ngOnDestroy;
        if (ngOnDestroy) {
          ngOnDestroy();
        }
        this.d$.next();
        this.d$.complete();
      }

    };

  };

}
