import { CategoryEntity } from '@lib/common/categories/entities/Category.entity';

describe('Category Entity', function() {
    describe('constructor', function() {
        it('should build category entity from nothing', function() {
            const categoryEntity = new CategoryEntity();

            expect(categoryEntity).toEqual({});
        });

        it('should build category entity from raw category entity', function() {
            const rawCategoryEntity = {
                id: 'abcd',
                group_id: 'abcd',
                category_name: 'abcd',
                display_name: 'abcd',
                sale_begin: new Date(),
                sale_end: new Date(),
                seats: 100,
                price: 100,
                currency: 'eur',
                interface: 'stripe',
                status: 'preview',
                dates: [],
                created_at: new Date(),
                updated_at: new Date(),
                custom_percent_fee: 1,
                custom_static_fee: 2,
            } as CategoryEntity;

            const categoryEntity = new CategoryEntity(rawCategoryEntity);

            expect(categoryEntity).toEqual(rawCategoryEntity);
        });

        it('should build category entity from raw category entity without ids', function() {
            const rawCategoryEntity = {
                id: null,
                group_id: 'abcd',
                category_name: 'abcd',
                display_name: 'abcd',
                sale_begin: new Date(),
                sale_end: new Date(),
                seats: 100,
                price: 100,
                currency: 'eur',
                interface: 'stripe',
                status: 'preview',
                dates: [null],
                created_at: new Date(),
                updated_at: new Date(),
                custom_percent_fee: 1,
                custom_static_fee: 2,
            } as CategoryEntity;

            const categoryEntity = new CategoryEntity(rawCategoryEntity);

            expect(categoryEntity).toEqual(rawCategoryEntity);
        });
    });
});
