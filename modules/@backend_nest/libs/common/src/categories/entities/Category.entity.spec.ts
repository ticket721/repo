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
                resale_begin: new Date(),
                resale_end: new Date(),
                scope: 'abcd',
                prices: [],
                seats: 100,
                reserved: 20,
                parent_id: 'abcd',
                parent_type: 'entity',
                created_at: new Date(),
                updated_at: new Date(),
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
                resale_begin: new Date(),
                resale_end: new Date(),
                scope: 'abcd',
                prices: [],
                seats: 100,
                reserved: 20,
                parent_id: null,
                parent_type: 'entity',
                created_at: new Date(),
                updated_at: new Date(),
            } as CategoryEntity;

            const categoryEntity = new CategoryEntity(rawCategoryEntity);

            expect(categoryEntity).toEqual(rawCategoryEntity);
        });
    });

    describe('checkCategoryErrors', function() {
        it('should fail sale ended error', function() {
            const now = new Date(Date.now());
            const saleEnded = new Date(now.getTime() - 1000);
            const error = CategoryEntity.checkCategoryErrors(
                now,
                {
                    sale_end: saleEnded,
                } as CategoryEntity,
                1,
            );

            expect(error).toEqual([
                {
                    category: {
                        sale_end: saleEnded,
                    },
                    reason: 'sale_ended',
                },
            ]);
        });

        it('should fail on sale not started', function() {
            const now = new Date(Date.now());
            const saleEnded = new Date(now.getTime() + 10000);
            const saleStarted = new Date(now.getTime() + 5000);
            const error = CategoryEntity.checkCategoryErrors(
                now,
                {
                    sale_end: saleEnded,
                    sale_begin: saleStarted,
                } as CategoryEntity,
                1,
            );

            expect(error).toEqual([
                {
                    category: {
                        sale_end: saleEnded,
                        sale_begin: saleStarted,
                    },
                    reason: 'sale_not_started',
                },
            ]);
        });

        it('should fail on unavailable category', function() {
            const now = new Date(Date.now());
            const saleEnded = new Date(now.getTime() + 10000);
            const saleStarted = new Date(now.getTime() - 5000);
            const error = CategoryEntity.checkCategoryErrors(
                now,
                {
                    sale_end: saleEnded,
                    sale_begin: saleStarted,
                    parent_type: null,
                } as CategoryEntity,
                1,
            );

            expect(error).toEqual([
                {
                    category: {
                        sale_end: saleEnded,
                        sale_begin: saleStarted,
                        parent_type: null,
                    },
                    reason: 'category_not_available',
                },
            ]);
        });

        it('category sold out', function() {
            const now = new Date(Date.now());
            const saleEnded = new Date(now.getTime() + 10000);
            const saleStarted = new Date(now.getTime() - 5000);
            const error = CategoryEntity.checkCategoryErrors(
                now,
                {
                    sale_end: saleEnded,
                    sale_begin: saleStarted,
                    parent_type: 'event',
                    seats: 10,
                    reserved: 10,
                } as CategoryEntity,
                1,
            );

            expect(error).toEqual([
                {
                    category: {
                        sale_end: saleEnded,
                        sale_begin: saleStarted,
                        parent_type: 'event',
                        seats: 10,
                        reserved: 10,
                    },
                    reason: 'category_sold_out',
                },
            ]);
        });

        it('all good', function() {
            const now = new Date(Date.now());
            const saleEnded = new Date(now.getTime() + 10000);
            const saleStarted = new Date(now.getTime() - 5000);
            const error = CategoryEntity.checkCategoryErrors(
                now,
                {
                    sale_end: saleEnded,
                    sale_begin: saleStarted,
                    parent_type: 'event',
                    seats: 10,
                    reserved: 0,
                } as CategoryEntity,
                1,
            );

            expect(error).toEqual([]);
        });
    });
});
