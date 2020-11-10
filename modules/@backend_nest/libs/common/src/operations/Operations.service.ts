import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Injectable } from '@nestjs/common';
import { OperationsRepository } from '@lib/common/operations/Operations.repository';
import { OperationEntity } from '@lib/common/operations/entities/Operation.entity';
import { BaseModel, InjectModel, InjectRepository } from '@iaminfinity/express-cassandra';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Operation service
 */
@Injectable()
export class OperationsService extends CRUDExtension<OperationsRepository, OperationEntity> {
    /**
     * Dependency Injection
     *
     * @param operationsRepository
     * @param operationEntity
     */
    constructor(
        @InjectRepository(OperationsRepository)
        operationsRepository: OperationsRepository,
        @InjectModel(OperationEntity)
        operationEntity: BaseModel<OperationEntity>,
    ) {
        super(
            operationEntity,
            operationsRepository,
            /* istanbul ignore next */
            (te: OperationEntity) => {
                return new operationEntity(te);
            },
            /* istanbul ignore next */
            (te: OperationEntity) => {
                return new OperationEntity(te);
            },
        );
    }

    /**
     * Find an operation by its id
     *
     * @param operationId
     */
    async findOne(operationId: string): Promise<ServiceResponse<OperationEntity>> {
        // Recover Operation
        const operationRes = await this.search({
            id: operationId,
        });

        if (operationRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (operationRes.response.length === 0) {
            return {
                error: 'operation_not_found',
                response: null,
            };
        }

        return {
            response: operationRes.response[0],
            error: null,
        };
    }
}
