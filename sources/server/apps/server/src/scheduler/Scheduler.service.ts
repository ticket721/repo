import { Injectable }             from '@nestjs/common';
import { Interval, NestSchedule }          from 'nest-schedule';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue }                      from 'bull';

@Injectable()
export class SchedulerService extends NestSchedule {

    constructor(@InjectQueue('queue') private readonly queue: Queue) {
        super();
    }

    @Interval(2000)
    async intervalJob() {

        //await this.queue.add('jean', {name: '0'});

        return true;
    }
}
