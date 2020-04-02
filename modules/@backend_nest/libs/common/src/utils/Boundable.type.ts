import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';

/**
 * Boundable abstract class. Used in services offering bind and unbind machnisms
 */
export class Boundable<EntityType> {
    /**
     * Bind category to parent entity
     *
     * @param id
     * @param entity
     * @param entityId
     */
    bind: (id: string, entity: string, entityId: string) => Promise<ServiceResponse<EntityType>>;
    /**
     * Removes binding to the entity
     *
     * @param id
     */
    unbind: (id: string) => Promise<ServiceResponse<EntityType>>;
    /**
     * Checks if entity is bound
     *
     * @param category
     */
    isBound: (category: EntityType) => boolean;
}
