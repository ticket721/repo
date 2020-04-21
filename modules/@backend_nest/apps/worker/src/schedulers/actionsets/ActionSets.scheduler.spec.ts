import { ActionSetsScheduler } from '@app/worker/schedulers/actionsets/ActionSets.scheduler';
import { ActionSetsService } from '@lib/common/actionsets/ActionSets.service';
import { ShutdownService } from '@lib/common/shutdown/Shutdown.service';
import { Job, JobOptions, Queue } from 'bull';
import { anything, capture, deepEqual, instance, mock, verify, when } from 'ts-mockito';
import { Schedule } from 'nest-schedule';
import { WinstonLoggerService } from '@lib/common/logger/WinstonLogger.service';
import { OutrospectionService } from '@lib/common/outrospection/Outrospection.service';

// describe('ActionSets Scheduler', function() {
//     const context: {
//         actionSetsScheduler: ActionSetsScheduler;
//         actionSetsServiceMock: ActionSetsService;
//         shutdownServiceMock: ShutdownService;
//         actionQueueMock: Queue;
//         scheduleMock: Schedule;
//         outrospectionServiceMock: OutrospectionService;
//     } = {
//         actionSetsScheduler: null,
//         actionSetsServiceMock: null,
//         shutdownServiceMock: null,
//         actionQueueMock: null,
//         scheduleMock: null,
//         outrospectionServiceMock: null,
//     };
//
//     beforeEach(async function() {
//         context.actionSetsServiceMock = mock(ActionSetsService);
//         context.actionQueueMock = mock<Queue>();
//         context.shutdownServiceMock = mock(ShutdownService);
//         context.scheduleMock = mock(Schedule);
//         context.outrospectionServiceMock = mock(OutrospectionService);
//         context.actionSetsScheduler = new ActionSetsScheduler(
//             instance(context.actionSetsServiceMock),
//             instance(context.shutdownServiceMock),
//             instance(context.actionQueueMock),
//             instance(context.scheduleMock),
//             new WinstonLoggerService('actionset'),
//             instance(context.outrospectionServiceMock),
//         );
//     });
//
// });
