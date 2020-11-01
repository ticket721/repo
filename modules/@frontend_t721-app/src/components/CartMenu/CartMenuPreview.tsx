import React, { useContext, useEffect, useRef, useState } from 'react';
import { CartContext }                                    from '../Cart/CartContext';
import { Product }                     from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/entities/Purchase.entity';
import { useRequest }                  from '@frontend/core/lib/hooks/useRequest';
import { CategoriesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/categories/dto/CategoriesSearchResponse.dto';
import { DatesSearchResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { CategoryEntity }               from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { DateEntity }                      from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { v4 }                       from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { T721AppState }                    from '../../redux';
import { Error, FullPageLoading, Icon }    from '@frontend/flib-react/lib/components';
import styled, { useTheme }                from 'styled-components';
import { getPrice }                        from '../../utils/prices';
import { formatShort }                     from '@frontend/core/lib/utils/date';
import { useTranslation }                  from 'react-i18next';
import { Theme }                           from '@frontend/flib-react/lib/config/theme';
import { useLazyRequest }                  from '@frontend/core/lib/hooks/useLazyRequest';
import { PurchasesSetProductsResponseDto } from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/purchases/dto/PurchasesSetProductsResponse.dto';
import { isNil }                           from 'lodash';
import { PushNotification }                from '@frontend/core/lib/redux/ducks/notifications';
import { PurchaseError }                   from '@common/sdk/lib/@backend_nest/libs/common/src/purchases/ProductChecker.base.service';

const CategoryCount = styled.span`
  margin: 0;
  font-weight: 300;
`;

const CategoryTitle = styled.span`
  margin: 0;
  font-weight: 600;
`;

const TotalTitle = styled.span`
  margin: 0;
  font-weight: 600;
`;

const CartElementContainer = styled.div`
  margin: 0;
  padding: ${props => props.theme.regularSpacing};
  border-bottom: 1px solid ${props => props.theme.componentColor};
`

const DateIcon = styled.img`
  width: 60px;
  height: 60px;
  border-radius: ${props => props.theme.defaultRadius};
`

interface DateTitleProps {
    color: string;
}

const DateTitle = styled.span<DateTitleProps>`
  color: ${props => props.color};
  display: block;
  margin: 0;
  font-weight: 600;
`;

const DateDate = styled.span`
  opacity: 0.5;
  display: block;
  margin: 0;
  margin-top: ${props => props.theme.smallSpacing};
  font-weight: 300;
`

const TotalContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-ttems: center;
  padding: ${props => props.theme.regularSpacing};
`

const ButtonDiv = styled.div`
  border-radius: 20%;
  width: 25px;
  height: 25px;
  margin-top: ${props => props.theme.regularSpacing};
  margin-right: ${props => props.theme.regularSpacing};
  display: flex;
  justify-content: center;
  align-items: center;
`

const ErrorText = styled.span`
  color: ${props => props.theme.errorColor.hex};
  margin-top: ${props => props.theme.regularSpacing};
`

const OnlineIcon = styled(Icon)`
  margin-right: ${props => props.theme.smallSpacing};
  display: inline;
`

interface CartMenuCategoryDatesPreviewProps {
    category: CategoryEntity;
    product: Product;
    error: PurchaseError;
    setChildrenLoading: (loading: boolean) => void;
}

const generateErrorMessage = (t: any, error: PurchaseError): string => {
    return t(error.reason, error.context);
}

const CartMenuCategoryDatesPreview: React.FC<CartMenuCategoryDatesPreviewProps> = (props: CartMenuCategoryDatesPreviewProps): JSX.Element => {
    const [t] = useTranslation('cart');
    const [uuid] = useState(v4());
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));
    const theme = useTheme() as Theme;
    const cart = useContext(CartContext);
    const [capturedTimesstamp, setTimestamp] = useState(null);
    const dispatch = useDispatch();

    const datesFetch = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [token, {
            id: {
                $in: props.category.dates,
            },
            status: {
                $eq: 'live'
            }
        }],
        refreshRate: 5,
    }, `CartMenuCategoryDatesPreview@${uuid}`);

    const setProductsLazyRequest = useLazyRequest<PurchasesSetProductsResponseDto>('purchases.setProducts', uuid);

    const onEditProducts = (type: string) => {
        let products;
        const uselessUuid = v4();
        switch (type) {
            case 'add': {

                products = cart.cart.products.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    type: item.type
                })).map((item) => {
                    if (item.id === props.product.id) {
                        return {
                            id: item.id,
                            quantity: item.quantity + 1,
                            type: item.type
                        }
                    }
                    return item;
                });

                break ;
            }
            case 'remove': {

                products = cart.cart.products.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    type: item.type
                })).map((item) => {
                    if (item.id === props.product.id) {
                        return {
                            id: item.id,
                            quantity: item.quantity - 1,
                            type: item.type
                        }
                    }
                    return item;
                }).filter((item) => {
                    return item.quantity > 0;
                })

                break ;
            }
            case 'delete': {
                products = cart.cart.products.map((item) => ({
                    id: item.id,
                    quantity: item.quantity,
                    type: item.type
                })).filter((item) => {
                    return item.id !== props.product.id
                })


                break ;
            }
        }
        props.setChildrenLoading(true);
        setTimestamp(cart.last_update);
        setProductsLazyRequest.lazyRequest([
            token,
            {
                products
            },
            uselessUuid
        ]);

    }

    const onRemoveProducts = onEditProducts.bind(null, 'remove');
    const onAddProducts = onEditProducts.bind(null, 'add');
    const onDeleteProducts = onEditProducts.bind(null, 'delete');

    useEffect(() => {
        if (setProductsLazyRequest.response.called) {
            if (setProductsLazyRequest.response.error) {
                props.setChildrenLoading(false);
                setTimestamp(null);
            } else if (setProductsLazyRequest.response.data) {
                props.setChildrenLoading(false);

                const data = setProductsLazyRequest.response.data;
                if (data.errors.filter((elem): boolean => !isNil(elem)).length > 0) {
                    const errors = data.errors.filter((elem): boolean => !isNil(elem))
                    for (const error of errors) {
                        dispatch(PushNotification(generateErrorMessage(t, error), 'error'))
                    }
                    setTimestamp(null);
                } else {
                    cart.force();
                }

            }
        }
    }, [setProductsLazyRequest.response.data, setProductsLazyRequest.response.error, setProductsLazyRequest.response.called]);

    if (datesFetch.response.loading) {
        return <FullPageLoading
            width={250}
            height={250}
        />;
    }

    if (datesFetch.response.error || datesFetch.response.data.dates.length === 0) {
        return <Error message={'category_fetch_error'} retryLabel={'common:retrying_in'} onRefresh={datesFetch.force}/>;
    }

    const dates = datesFetch.response.data.dates;

    return <CartElementContainer>
        <div
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row'
            }}

        >
            <div>
                <CategoryCount>{props.product.quantity} x </CategoryCount>
                <CategoryTitle>{props.category.display_name}</CategoryTitle>
            </div>
            <CategoryCount>{getPrice(props.category, t('free'), props.product.quantity)}</CategoryCount>
        </div>
        <div
            style={{
                margin: 8,
                marginBottom: 0
            }}
        >
            {
                dates.map((date: DateEntity, idx: number) => (
                    <div key={idx} style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        padding: 8
                    }}>
                        <DateIcon src={date.metadata.avatar}/>
                        <div style={{
                            marginLeft: 8
                        }}>
                            <DateTitle color={date.metadata.signature_colors[0]}>{date.online ? <OnlineIcon icon={'live'} color={date.metadata.signature_colors[0]} size={'16px'} /> : null}{date.metadata.name}</DateTitle>
                            <DateDate>{formatShort(date.timestamps.event_end)}</DateDate>
                        </div>
                    </div>
                ))
            }
        </div>
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center'
            }}
        >
            {
                props.error === null

                    ?
                    <>
                        <ButtonDiv
                            onClick={onRemoveProducts}
                            style={{
                                backgroundColor: theme.darkBg
                            }}
                        >
                            <Icon
                                icon={'remove'}
                                color={'white'}
                                size={'15px'}
                            />

                        </ButtonDiv>
                        <ButtonDiv
                            onClick={onAddProducts}
                            style={{
                                backgroundColor: theme.darkBg
                            }}
                        >
                            <Icon
                                icon={'add'}
                                color={'white'}
                                size={'15px'}
                            />

                        </ButtonDiv>
                    </>

                    :
                    null
            }
            <ButtonDiv
                onClick={onDeleteProducts}
                style={{
                    backgroundColor: theme.errorColor.hex
                }}
            >
                <Icon
                    icon={'delete'}
                    color={'white'}
                    size={'15px'}
                />

            </ButtonDiv>
            {
                props.error !== null

                    ?
                    <>
                        <ErrorText>{props.error.reason}</ErrorText>
                    </>

                    :
                    null
            }

        </div>
    </CartElementContainer>;
};

interface CartMenuCategoryPreview {
    category: Product;
    error: PurchaseError;
    setChildrenLoading: (loading: boolean) => void;
}

const CartMenuCategoryPreview: React.FC<CartMenuCategoryPreview> = (props: CartMenuCategoryPreview): JSX.Element => {

    const [uuid] = useState(v4());
    const { token } = useSelector((state: T721AppState) => ({ token: state.auth.token?.value }));

    const categoryFetch = useRequest<CategoriesSearchResponseDto>({
        method: 'categories.search',
        args: [token, {
            id: {
                $eq: props.category.id,
            },
        }],
        refreshRate: 5,
    }, `CartMenuCategoryPreview@${uuid}`);

    if (categoryFetch.response.loading) {
        return <FullPageLoading
            width={250}
            height={250}
        />;
    }

    if (categoryFetch.response.error || categoryFetch.response.data.categories.length === 0) {
        return <Error message={'category_fetch_error'} retryLabel={'common:retrying_in'} onRefresh={categoryFetch.force}/>;
    }

    const category = categoryFetch.response.data.categories[0];

    return <CartMenuCategoryDatesPreview category={category} product={props.category} error={props.error} setChildrenLoading={props.setChildrenLoading}/>;
};

interface CartMenuProductDisplay {
    product: Product;
    error: PurchaseError;
    setChildrenLoading: (loading: boolean) => void;
}

const CartMenuProductPreview: React.FC<CartMenuProductDisplay> = (props: CartMenuProductDisplay): JSX.Element => {
    switch (props.product.type) {
        case 'category': {
            return <CartMenuCategoryPreview error={props.error} category={props.product} setChildrenLoading={props.setChildrenLoading}/>;
        }
        default: {
            return null;
        }
    }
};

interface CartMenuPreview {
    setChildrenLoading: (loading: boolean) => void;
}

export const CartMenuPreview: React.FC<CartMenuPreview> = (props: CartMenuPreview): JSX.Element => {
    const [t] = useTranslation('cart');
    const cart = useContext(CartContext);
    const cartContentRef = useRef(null)

    useEffect(() => {
        if (cart.open && cartContentRef.current) {
            cartContentRef.current.scrollTop = 0;
        }
    }, [cart.open, cartContentRef]);

    if (!cart.cart || cart.cart.products.length === 0) {
        return null;
    } else {
        return <div
            ref={cartContentRef}
            id={'cart-content'}
            style={{
                overflow: 'scroll',
                height: 'calc(100% - 50px)',
                paddingBottom: 80
            }}>
            {cart.cart.products.map((product: Product, idx: number) => <CartMenuProductPreview product={product} error={cart.errors[idx]} key={idx} setChildrenLoading={props.setChildrenLoading}/>)}
            <TotalContainer>
                <TotalTitle>{t('total')}</TotalTitle>
                <p>{getPrice(cart.cart as any, t('free'))}</p>
            </TotalContainer>
        </div>;
    }

};
