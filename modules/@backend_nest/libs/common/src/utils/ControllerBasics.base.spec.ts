import { deepEqual, instance, mock, when } from 'ts-mockito';
import { ControllerBasics } from '@lib/common/utils/ControllerBasics.base';
import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Repository } from '@iaminfinity/express-cassandra';

class FakeEntity {
    id: string;
    name: string;
}

const context: {
    controllerBasics: ControllerBasics<FakeEntity>;
    CRUDServiceMock: CRUDExtension<Repository<FakeEntity>, FakeEntity>;
} = {
    controllerBasics: null,
    CRUDServiceMock: null,
};

describe('Controller Basics', function() {
    beforeEach(async function() {
        context.controllerBasics = new ControllerBasics();
        context.CRUDServiceMock = mock(CRUDExtension);
    });

    it('holds a place', function() {
        console.log('like a placeholder');
    });
});
