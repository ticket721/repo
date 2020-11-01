import { CRUDExtension } from '@lib/common/crud/CRUDExtension.base';
import { Injectable } from '@nestjs/common';
import { PurchasesRepository } from '@lib/common/purchases/Purchases.repository';
import { Fee, Payment, Product, PurchaseEntity } from '@lib/common/purchases/entities/Purchase.entity';
import { BaseModel, InjectModel, InjectRepository, uuid } from '@iaminfinity/express-cassandra';
import { UserDto } from '@lib/common/users/dto/User.dto';
import { ServiceResponse } from '@lib/common/utils/ServiceResponse.type';
import { ModuleRef } from '@nestjs/core';
import { ProductCheckerServiceBase, PurchaseError } from '@lib/common/purchases/ProductChecker.base.service';
import { isNil, merge } from 'lodash';
import { PaymentError, PaymentHandlerBaseService } from '@lib/common/purchases/PaymentHandler.base.service';
import { TimeToolService } from '@lib/common/toolbox/Time.tool.service';
import { UsersService } from '@lib/common/users/Users.service';
import { ECAAG } from '@lib/common/utils/ECAAG.helper';
import { MINUTE } from '@lib/common/utils/time';

const CART_EXPIRATION = 15 * MINUTE;

@Injectable()
export class PurchasesService extends CRUDExtension<PurchasesRepository, PurchaseEntity> {
    /**
     * Dependency Injection
     *
     * @param purchasesRepository
     * @param purchaseEntity
     * @param moduleRef
     * @param timeToolService
     * @param usersService
     */
    constructor(
        @InjectRepository(PurchasesRepository)
        purchasesRepository: PurchasesRepository,
        @InjectModel(PurchaseEntity)
        purchaseEntity: BaseModel<PurchaseEntity>,
        private readonly moduleRef: ModuleRef,
        private readonly timeToolService: TimeToolService,
        private readonly usersService: UsersService,
    ) {
        super(
            purchaseEntity,
            purchasesRepository,
            /* istanbul ignore next */
            (te: PurchaseEntity) => {
                return new purchaseEntity(te);
            },
            /* istanbul ignore next */
            (te: PurchaseEntity) => {
                return new PurchaseEntity(te);
            },
        );
    }

    async findOne(purchaseId: string): Promise<ServiceResponse<PurchaseEntity>> {
        // Recover Purchase
        const purchaseRes = await this.search({
            id: purchaseId,
        });

        if (purchaseRes.error) {
            return {
                error: 'error_while_checking',
                response: null,
            };
        }

        if (purchaseRes.response.length === 0) {
            return {
                error: 'purchase_not_found',
                response: null,
            };
        }

        return {
            response: purchaseRes.response[0],
            error: null,
        };
    }

    private checkDuplicates(products: Product[]): boolean {
        for (let idx = 0; idx < products.length; ++idx) {
            const product: Product = products[idx];

            const duplicateIdx = products
                .slice(idx + 1)
                .findIndex(
                    (_product: Product): boolean => _product.type === product.type && _product.id === product.id,
                );

            if (duplicateIdx !== -1) {
                return true;
            }
        }

        return false;
    }

    private async recoverInterfaceId(purchase: PurchaseEntity): Promise<ServiceResponse<string>> {
        const product = purchase.products[0];

        const productHandler: ProductCheckerServiceBase = this.moduleRef.get(`product/${product.type}`, {
            strict: false,
        });

        return productHandler.interfaceId(product.group_id);
    }

    private async recoverFees(user: UserDto, purchase: PurchaseEntity): Promise<ServiceResponse<Fee[]>> {
        const ret: Fee[] = [];

        for (const product of purchase.products) {
            const productHandler: ProductCheckerServiceBase = this.moduleRef.get(`product/${product.type}`, {
                strict: false,
            });

            const feeRes = await productHandler.fees(user, purchase, product);

            if (feeRes.error) {
                return {
                    error: feeRes.error,
                    response: null,
                };
            }

            ret.push(feeRes.response);
        }

        return {
            response: ret.map(
                (feeDesc: Fee): Fee =>
                    !!feeDesc
                        ? feeDesc
                        : {
                            type: 'none',
                            price: 0,
                        },
            ),
            error: null,
        };
    }

    async checkout(
        user: UserDto,
        purchase: PurchaseEntity,
        payload: any,
    ): Promise<ServiceResponse<[PurchaseEntity, PurchaseError[], PaymentError]>> {
        const paymentInterfaceIdRes = await this.recoverInterfaceId(purchase);

        if (paymentInterfaceIdRes.error) {
            return {
                error: paymentInterfaceIdRes.error,
                response: null,
            };
        }

        const paymentFeesRes = await this.recoverFees(user, purchase);

        if (paymentFeesRes.error) {
            return {
                error: paymentInterfaceIdRes.error,
                response: null,
            };
        }

        const checkoutResult = await this.runCheckout(
            user,
            purchase,
            payload,
            paymentInterfaceIdRes.response,
            paymentFeesRes.response,
        );

        if (checkoutResult.error) {
            return {
                error: checkoutResult.error,
                response: null,
            };
        }

        return {
            error: null,
            response: [checkoutResult.response[0], checkoutResult.response[1], checkoutResult.response[2]],
        };
    }

    private async drySetCartProducts(
        user: UserDto,
        purchase: PurchaseEntity,
        products: Product[],
    ): Promise<ServiceResponse<[PurchaseEntity, PurchaseError[]]>> {
        const errors: PurchaseError[] = [];

        if (this.checkDuplicates(products)) {
            return {
                error: 'duplicate_products',
                response: null,
            };
        }

        let editedPurchase = {
            ...purchase,
            products: [],
            payment_interface: null,
            price: null,
            currency: null,
        };

        for (const product of products) {
            let error: PurchaseError = null;

            const productHandler: ProductCheckerServiceBase = this.moduleRef.get(`product/${product.type}`, {
                strict: false,
            });

            if (isNil(productHandler)) {
                error = {
                    reason: 'unknown_product',
                    context: {
                        type: product.type,
                    },
                };
            }

            const checkResult: ServiceResponse<Partial<PurchaseEntity>> = await productHandler.add(
                user,
                editedPurchase,
                product,
            );

            if (checkResult.error) {
                error = {
                    reason: checkResult.error,
                    context: {
                        type: product.type,
                    },
                };
            }

            editedPurchase = merge({}, editedPurchase, checkResult.response);

            errors.push(error);
        }

        const errorCount = errors.filter((err: PurchaseError): boolean => err !== null).length;

        if (errorCount > 0) {
            return {
                error: null,
                response: [null, errors],
            };
        } else {
            return {
                error: null,
                response: [purchase, errors],
            };
        }
    }

    async setCartProducts(
        user: UserDto,
        purchase: PurchaseEntity,
        products: Product[],
    ): Promise<ServiceResponse<[PurchaseEntity, PurchaseError[]]>> {
        if (purchase.payment && purchase.payment.status !== 'waiting' && !(await this.isExpired(purchase))) {
            return {
                error: 'payment_in_progress',
                response: null,
            };
        }

        let edits: Partial<PurchaseEntity> = {};
        const errors: PurchaseError[] = [];

        if (this.checkDuplicates(products)) {
            return {
                error: 'duplicate_products',
                response: null,
            };
        }

        let editedPurchase = {
            ...purchase,
            products: [],
            payment_interface: null,
            price: null,
            currency: null,
        };

        if (products.length === 0) {
            edits = {
                products: [],
                payment_interface: null,
                price: null,
                currency: null
            }
        } else {

            for (const product of products) {
                let error: PurchaseError = null;

                const productHandler: ProductCheckerServiceBase = this.moduleRef.get(`product/${product.type}`, {
                    strict: false,
                });

                if (isNil(productHandler)) {
                    error = {
                        reason: 'unknown_product',
                        context: {
                            type: product.type,
                        },
                    };
                }

                const checkResult: ServiceResponse<Partial<PurchaseEntity>> = await productHandler.add(
                    user,
                    editedPurchase,
                    product,
                );

                if (checkResult.error) {
                    error = {
                        reason: checkResult.error,
                        context: {
                            type: product.type,
                        },
                    };
                }

                edits = merge({}, edits, checkResult.response);
                editedPurchase = merge({}, editedPurchase, checkResult.response);

                errors.push(error);
            }

        }

        const errorCount = errors.filter((err: PurchaseError): boolean => err !== null).length;

        if (errorCount > 0) {
            return {
                error: null,
                response: [null, errors],
            };
        } else {
            const needsDelete: boolean = !!purchase.payment;

            const purchaseUpdateRes = await this.update(
                {
                    id: purchase.id,
                },
                {
                    ...edits,
                    payment: null,
                    fees: [],
                    checked_out_at: null,
                },
            );

            if (purchaseUpdateRes.error) {
                return {
                    error: 'cannot_update_purchase_entity',
                    response: null,
                };
            }

            const updatedPurchaseEntityRes = await this.findOne(purchase.id);

            if (updatedPurchaseEntityRes.error) {
                return {
                    error: 'cannot_retried_updated_entity',
                    response: null,
                };
            }

            if (needsDelete) {
                const paymentInterfaceIdRes = await this.recoverInterfaceId(purchase);

                if (paymentInterfaceIdRes.error) {
                    return {
                        error: paymentInterfaceIdRes.error,
                        response: null,
                    };
                }

                const cancelRes = await this.cancelPayment(purchase.payment, paymentInterfaceIdRes.response);

                if (cancelRes.error) {
                    return {
                        error: cancelRes.error,
                        response: null,
                    };
                }
            }

            return {
                error: null,
                response: [updatedPurchaseEntityRes.response, errors],
            };
        }
    }

    async updatePaymentStatus(user: UserDto, purchase: PurchaseEntity): Promise<ServiceResponse<PurchaseEntity>> {
        if (purchase.payment !== null && purchase.payment.status === 'waiting') {
            const paymentInterfaceIdRes = await this.recoverInterfaceId(purchase);

            if (paymentInterfaceIdRes.error) {
                return {
                    error: paymentInterfaceIdRes.error,
                    response: null,
                };
            }

            const paymentHandler: PaymentHandlerBaseService = this.moduleRef.get(
                `payment/${purchase.payment_interface}`,
                {
                    strict: false,
                },
            );

            const paymentRes = await paymentHandler.fetch(purchase.payment, paymentInterfaceIdRes.response);

            if (paymentRes.error) {
                return {
                    error: paymentRes.error,
                    response: null,
                };
            }

            if (paymentRes.response) {
                const purchaseUpdateRes = await this.update(
                    {
                        id: purchase.id,
                    },
                    {
                        payment: paymentRes.response,
                    },
                );

                if (purchaseUpdateRes.error) {
                    return {
                        error: purchaseUpdateRes.error,
                        response: null,
                    };
                }

                purchase.payment = paymentRes.response;
            }

            return {
                error: null,
                response: purchase,
            };
        }
        return {
            error: null,
            response: purchase,
        };
    }

    async checkCartStatus(user: UserDto, purchase: PurchaseEntity): Promise<ServiceResponse<PurchaseError[]>> {
        const errors: PurchaseError[] = [];

        if (await this.isExpired(purchase)) {
            return {
                error: null,
                response: [...(new Array(purchase.products.length))].map((): PurchaseError => ({
                    reason: 'cart_expired',
                    context: {}
                }))
            }
        }

        for (let idx = 0; idx < purchase.products.length; ++idx) {
            const productHandler: ProductCheckerServiceBase = this.moduleRef.get(
                `product/${purchase.products[idx].type}`,
                {
                    strict: false,
                },
            );

            if (isNil(productHandler)) {
                errors.push({
                    reason: 'unknown_product',
                    context: {
                        type: purchase.products[idx].type,
                    },
                });
            }

            const checkResult: ServiceResponse<PurchaseError> = await productHandler.check(user, purchase, idx);

            if (checkResult.error) {
                errors.push({
                    reason: 'unexpected_error',
                    context: {
                        error: checkResult.error,
                    },
                });
            }

            if (checkResult.response) {
                errors.push(checkResult.response);
            }

            errors.push(null);
        }

        return {
            error: null,
            response: errors,
        };
    }

    private async cancelPayment(payment: Payment, paymentInterfaceId: string): Promise<ServiceResponse<void>> {
        const paymentHandler: PaymentHandlerBaseService = this.moduleRef.get(`payment/${payment.type}`, {
            strict: false,
        });

        return paymentHandler.cancel(payment, paymentInterfaceId);
    }

    async isExpired(purchase: PurchaseEntity): Promise<boolean> {
        if (purchase.checked_out_at && purchase.payment && purchase.payment.status === 'waiting') {
            const now = this.timeToolService.now();

            return now.getTime() - new Date(purchase.checked_out_at).getTime() > CART_EXPIRATION;
        }

        return false;
    }

    private async runCheckout(
        user: UserDto,
        purchase: PurchaseEntity,
        payload: any,
        paymentInterfaceId: string,
        feeDescriptions: Fee[],
    ): Promise<ServiceResponse<[PurchaseEntity, PurchaseError[], PaymentError]>> {
        if (purchase.payment === null) {
            const dryCheckResults = await this.drySetCartProducts(user, purchase, purchase.products);

            if (dryCheckResults.error) {
                return {
                    error: dryCheckResults.error,
                    response: null,
                };
            }

            if (dryCheckResults.response[1].filter((err: PurchaseError): boolean => err !== null).length >= 1) {
                return {
                    error: null,
                    response: [dryCheckResults.response[0], dryCheckResults.response[1], null],
                };
            }

            const paymentHandler: PaymentHandlerBaseService = this.moduleRef.get(
                `payment/${purchase.payment_interface}`,
                {
                    strict: false,
                },
            );

            const paymentRes = await paymentHandler.onCheckout(
                user,
                purchase,
                payload,
                paymentInterfaceId,
                feeDescriptions,
            );

            if (paymentRes.error) {
                return {
                    error: paymentRes.error,
                    response: null,
                };
            }

            if (paymentRes.response[2] !== null) {
                return {
                    error: null,
                    response: [purchase, null, paymentRes.response[2]],
                };
            } else {
                const checkoutUpdateRes = await this.update(
                    {
                        id: purchase.id,
                    },
                    {
                        payment: paymentRes.response[0],
                        fees: paymentRes.response[1],
                        checked_out_at: this.timeToolService.now(),
                    },
                );

                if (checkoutUpdateRes.error) {
                    return {
                        error: checkoutUpdateRes.error,
                        response: null,
                    };
                }

                const updatedPurchaseEntityRes = await this.findOne(purchase.id);

                if (updatedPurchaseEntityRes.error) {
                    return {
                        error: updatedPurchaseEntityRes.error,
                        response: null,
                    };
                }

                return {
                    error: null,
                    response: [updatedPurchaseEntityRes.response, null, null],
                };
            }
        } else {
            return {
                error: null,
                response: [purchase, null, null],
            };
        }
    }

    async close(user: UserDto, purchase: PurchaseEntity): Promise<ServiceResponse<PurchaseError[]>> {
        const errors: PurchaseError[] = [];

        const paymentHandler: PaymentHandlerBaseService = this.moduleRef.get(`payment/${purchase.payment_interface}`, {
            strict: false,
        });

        const paymentInterfaceIdRes = await this.recoverInterfaceId(purchase);

        if (paymentInterfaceIdRes.error) {
            return {
                error: paymentInterfaceIdRes.error,
                response: null,
            };
        }

        if (await this.isExpired(purchase)) {
            const cancelRes = await paymentHandler.cancel(purchase.payment, paymentInterfaceIdRes.response);

            if (cancelRes.error) {
                return {
                    error: cancelRes.error,
                    response: null,
                };
            }

            purchase.products.forEach(() => {
                errors.push({
                    reason: 'cart_expired',
                    context: {},
                });
            });
        } else {
            const paymentCompleteRes = await paymentHandler.onComplete(
                user,
                purchase.payment,
                paymentInterfaceIdRes.response,
            );

            if (paymentCompleteRes.error) {
                purchase.products.forEach(() => {
                    errors.push({
                        reason: 'cart_expired',
                        context: {},
                    });
                });

                return {
                    error: null,
                    response: errors,
                };
            }

            for (let idx = 0; idx < purchase.products.length; ++idx) {
                const product = purchase.products[idx];

                const productHandler: ProductCheckerServiceBase = this.moduleRef.get(`product/${product.type}`, {
                    strict: false,
                });

                if (purchase.payment.status === 'confirmed') {
                    const confirmationRes = await productHandler.ok(user, purchase, idx);

                    if (confirmationRes.error) {
                        errors.push({
                            reason: confirmationRes.error,
                            context: {},
                        });
                    } else {
                        errors.push(null);
                    }
                } else if (purchase.payment.status === 'rejected') {
                    const confirmationRes = await productHandler.ko(user, purchase, idx);

                    if (confirmationRes.error) {
                        errors.push({
                            reason: confirmationRes.error,
                            context: {},
                        });
                    } else {
                        errors.push(confirmationRes.response);
                    }
                }
            }
        }

        const purchaseUpdateRes = await this.update(
            {
                id: purchase.id,
            },
            {
                closed_at: this.timeToolService.now(),
            },
        );

        if (purchaseUpdateRes.error) {
            return {
                error: purchaseUpdateRes.error,
                response: null,
            };
        }

        const userEntityRes = await this.usersService.findById(user.id);

        if (userEntityRes.error) {
            return {
                error: userEntityRes.error,
                response: null,
            };
        }

        const newPurchaseEntityRes = await this.create({
            owner: userEntityRes.response.id,
            fees: [],
            products: [],
            currency: null,
            payment: null,
            payment_interface: null,
            checked_out_at: null,
            price: null,
        });

        if (newPurchaseEntityRes.error) {
            return {
                error: newPurchaseEntityRes.error,
                response: null,
            };
        }

        const userUpdateRes = await this.usersService.update({
            id: user.id,
            current_purchase: uuid(newPurchaseEntityRes.response.id) as any,
            past_purchases: [
                ...ECAAG<string>(userEntityRes.response.past_purchases),
                userEntityRes.response.current_purchase,
            ],
        });

        if (userUpdateRes.error) {
            return {
                error: userUpdateRes.error,
                response: null,
            };
        }

        return {
            error: null,
            response: errors,
        };
    }
}
