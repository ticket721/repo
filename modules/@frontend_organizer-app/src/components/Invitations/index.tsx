import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import styled, { useTheme }                                    from 'styled-components';
import { useToken }                                            from '@frontend/core/lib/hooks/useToken';
import { v4 }                                                                   from 'uuid';
import { useTranslation }                                                       from 'react-i18next';
import { EventsContext }                                                        from '../Fetchers/EventsFetcher';
import { useRequest }                                                           from '@frontend/core/lib/hooks/useRequest';
import { DatesSearchResponseDto }                                                         from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/dates/dto/DatesSearchResponse.dto';
import { isRequestError }                                                                       from '@frontend/core/lib/utils/isRequestError';
import { Error, FullPageLoading, TextInput, SelectInput, SelectOption, Button, Skeleton, Icon } from '@frontend/flib-react/lib/components';
import { useFormik }                                                                            from 'formik';
import { invitationGenerationValidationSchema } from './validation';
import { DateEntity }                   from '@common/sdk/lib/@backend_nest/libs/common/src/dates/entities/Date.entity';
import { useLazyRequest }               from '@frontend/core/lib/hooks/useLazyRequest';
import { getEnv }                       from '@frontend/core/lib/utils/getEnv';
import { useDispatch }                  from 'react-redux';
import { PushNotification }             from '@frontend/core/lib/redux/ducks/notifications';
import './locales';
import { CategoryEntity }               from '@common/sdk/lib/@backend_nest/libs/common/src/categories/entities/Category.entity';
import { getPrice }                     from '@frontend/core/lib/utils/prices';
import { formatShort }                  from '@frontend/core/lib/utils/date';
import { Theme }                        from '@frontend/flib-react/lib/config/theme';
import { EventsAttendeesResponseDto }   from '@common/sdk/lib/@backend_nest/apps/server/src/controllers/events/dto/EventsAttendeesResponse.dto';
import { InvitationsSearchResponseDto } from '../../../../@backend_nest/apps/server/src/controllers/invitations/dto/InvitationsSearchResponse.dto';
import { isNil }                        from 'lodash';
import { InvitationsDeleteResponseDto } from '@backend/nest/dist/apps/server/src/controllers/invitations/dto/InvitationsDeleteResponse.dto';
import {isEqual} from 'lodash';
import * as yup from 'yup';
// tslint:disable-next-line:no-var-requires
const {parse} = require('papaparse');

const InvitationsContainer = styled.div`
    padding: ${props => props.theme.regularSpacing};
    width: 100%;
`

const InvitationGeneratorContainer = styled.div`
    background-color: ${props => props.theme.darkBg};
    padding: ${props => props.theme.doubleSpacing};
    border-radius: ${props => props.theme.defaultRadius};
    margin: ${props => props.theme.regularSpacing};
    display: inline-block;
`

const InvitationGeneratorFormContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-bottom: ${props => props.theme.regularSpacing};
`

const InvitationGeneratorFormElementContainer = styled.div`
    max-width: 300px;
    width: 100%;
    margin: ${props => props.theme.regularSpacing};
`

interface FormFields {
    email: string;
    dates: SelectOption[];
    count: number;
}

const InvitationsGenerator = () => {

    const token = useToken();
    const [uuid] = useState<string>(v4() + '@categories-fetch');
    const events = useContext(EventsContext);
    const [t] = useTranslation('invitations')

    const formik = useFormik<FormFields>({
        initialValues: {
            email: '',
            dates: [],
            count: 1
        },
        validationSchema: invitationGenerationValidationSchema,
        onSubmit: (values: FormFields) => console.log(values)
    })

    const datesResp = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                group_id: {
                    $eq: events.events[0].group_id,
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'desc',
                }],
            },
        ],
        refreshRate: 10,
    }, uuid);

    const generateInvitations = useLazyRequest('invitations.create', uuid);
    const dispatch = useDispatch();

    useEffect(() => {
        if (generateInvitations.response.data) {
            if (generateInvitations.response.error) {
                dispatch(PushNotification(t('creation_error'), 'error'));
            } else {
                dispatch(PushNotification(t('creation_success'), 'success'));
            }
        }
    }, [generateInvitations.response.loading]);

    if (isRequestError(datesResp)) {
        return <Error message={t('infos_fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={datesResp.force}/>;
    }

    if (datesResp.response.loading) {
        return <FullPageLoading/>;
    }

    const dates = datesResp.response.data.dates;

    return <InvitationGeneratorContainer>
        <h1>{t('generate_invitation_title')}</h1>
        <InvitationGeneratorFormContainer>
            <InvitationGeneratorFormElementContainer>
                <TextInput error={formik.errors.email} label={t('generate_invitation_email')} name={'email'} onChange={formik.handleChange} value={formik.values.email}/>
            </InvitationGeneratorFormElementContainer>
            <InvitationGeneratorFormElementContainer>
                <SelectInput
                    multiple={true}
                    label={t('generate_invitation_dates')}
                    name={'dates'}
                    options={
                        dates.map((d: DateEntity) => ({
                            label: d.metadata.name,
                            value: d.id
                        }))
                    }
                    error={formik.errors.dates as string}
                    value={formik.values.dates}
                    onChange={(values: SelectOption[]) => {
                        formik.setFieldValue('dates', values)
                    }}/>
            </InvitationGeneratorFormElementContainer>
            <InvitationGeneratorFormElementContainer>
                <TextInput error={formik.errors.count} label={t('generate_invitation_count')} name={'count'} onChange={
                    (e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.value.length) {
                            formik.setFieldValue('count', parseInt(e.target.value, 10))
                        } else {
                            formik.setFieldValue('count', e.target.value)
                        }
                    }
                } value={formik.values.count} options={{numeral: true}}/>
            </InvitationGeneratorFormElementContainer>
        </InvitationGeneratorFormContainer>
        <div
            style={{
                width: '33%',
                minWidth: 200
            }}
        >
            <Button
                title={t('generate_invitation_submit')}
                variant={formik.isValid && formik.values.email !== '' && formik.values.dates.length > 0 && formik.values.count > 0 ? 'primary' : 'disabled'}
                onClick={() => {
                    const randUuid = v4();
                    generateInvitations.lazyRequest([
                        events.events[0].id,
                        token,
                        {
                            dates: formik.values.dates.map((so: SelectOption) => so.value),
                            amount: formik.values.count,
                            owner: formik.values.email,
                            appUrl: getEnv().REACT_APP_USER_URL,
                            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                        },
                        randUuid
                    ]);
                    formik.resetForm();
                }}
            />
        </div>
    </InvitationGeneratorContainer>
}

const Bold = styled.span`
    font-weight: bold;
`

const Clickable = styled.span`

    cursor: pointer;

    &:hover {
        color: ${props => props.theme.primaryColor.hex};
    }
`

const download = (filename: string, text: string): void => {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

const copy = (value: string): Promise<void> => {
    return navigator.clipboard.writeText(value);
}

interface InvitationData {
    email: string;
    amount: number;
    dates: string[];
}

const uuidV4Regex = /^[A-F\d]{8}-[A-F\d]{4}-4[A-F\d]{3}-[89AB][A-F\d]{3}-[A-F\d]{12}$/i;

const getBatchInvitations = async (data: string[][], _dates: DateEntity[]): Promise<{error: any[], res: InvitationData[]}> => {
    const fields = ['email', 'amount', 'dates'];

    if (!isEqual(data[0], fields)) {
        console.log(data[0]);
        return {
            error: [
                'missing_headers',
                {}
            ],
            res: null
        };
    }

    const ALL = _dates.map(d => d.id);

    let idx = 0;
    const res = [];
    for (const invitation of data.slice(1)) {

        for (let checkIdx = 0; checkIdx < 3; ++checkIdx) {
            if (isNil(invitation[checkIdx])) {
                return {
                    error: [
                        'missing_field',
                        {
                            line: idx + 1,
                            field: fields[checkIdx]
                        }
                    ],
                    res: null
                }
            }
        }

        if (!(await yup.string().email().isValid(invitation[0]))) {
            return {
                error: [
                    'invalid_email',
                    {
                        line: idx + 1,
                        email: invitation[0]
                    }
                ],
                res: null
            }
        }

        if (!(await yup.number().min(1).isValid(invitation[1]))) {
            return {
                error: [
                    'invalid_amount',
                    {
                        line: idx + 1,
                        amount: invitation[1]
                    }
                ],
                res: null
            }
        }

        let dates = ALL;

        if (invitation[2] !== 'all') {
            dates = invitation[2].split(' ');
        }

        for (const date of dates) {
            console.log(date);
            if (!uuidV4Regex.test(date)) {
                return {
                    error: [
                        'invalid_date',
                        {
                            line: idx + 1,
                            date
                        }
                    ],
                    res: null
                }
            }
        }

        res.push({
            email: invitation[0],
            amount: parseInt(invitation[1], 10),
            dates
        })

        ++idx;
    }
    return {
        error: null,
        res
    }
}

const BatchInvitationGenerator = () => {
    const [t] = useTranslation('invitations')
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@categories-fetch');
    const events = useContext(EventsContext);
    const dispatch = useDispatch();
    const [file, setFile] = useState<{name: string; content: string;}>({name: null, content: null});
    const [randId, setRandId] = useState(v4());

    const datesResp = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                group_id: {
                    $eq: events.events[0].group_id,
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'desc',
                }],
            },
        ],
        refreshRate: 10,
    }, uuid);

    const generateInvitationsBatch = useLazyRequest('invitations.createBatch', uuid);
    
    useEffect(() => {
        if (generateInvitationsBatch.response.data) {
            if (generateInvitationsBatch.response.error) {
                dispatch(PushNotification(t('creation_error'), 'error'));
            } else {
                dispatch(PushNotification(t('creation_success'), 'success'));
            }
        }
    }, [generateInvitationsBatch.response.loading]);

    if (datesResp.response.loading) {
        return <FullPageLoading/>;
    }

    if (isRequestError(datesResp)) {
        return <Error message={t('infos_fetch_error')} retryLabel={t('common:retrying_in')} onRefresh={datesResp.force}/>;
    }

    return <InvitationGeneratorContainer>
        <h1>{t('generate_batch_invitation_title')}</h1>
        <p><Bold><Clickable
            onClick={
                () => {
                    download('invitationtemplate.csv', `email,amount,dates
example@example.com,2,${datesResp.response.data.dates.length ? datesResp.response.data.dates.map(d => d.id).join(' ') : ''}`)
                }
            }
        >Download the template CSV</Clickable></Bold> to generate several invitations at the same time.</p>
        <p>The <Bold>email</Bold> column should contain the email receiving the invitation(s).</p>
        <p>The <Bold>amount</Bold> column should contain the amount of invitations to generate for the given email.</p>
        <p>The <Bold>dates</Bold> column should contain the ids of the dates where the user has access separated by a space (or the value '<Bold>all</Bold>' for all dates).</p>
        <p>Below, you will find the list of date IDs to use, click to copy to clipboard: </p>
        <div
            style={{
                maxHeight: 500,
                overflow: 'scroll',
                backgroundColor: '#00000020',
                padding: 16,
                borderRadius: 8,
                marginTop: 16
            }}
        >
            {
                datesResp.response.data.dates.length
                    ? datesResp.response.data.dates.map((d: DateEntity, idx: number) => <p key={idx}>{d.metadata.name}:{'   '}<Bold><Clickable
                        onClick={() => {
                            copy(d.id).then(() => {
                                dispatch(PushNotification(t('clipboard_copy_success'), 'success'));
                            })
                        }}
                    >{d.id}</Clickable></Bold></p>)
                    : <p>You need to add dates to your event</p>
            }
        </div>
        {
            datesResp.response.data.dates.length

                ? <div
                    style={{
                        width: '100%',
                        marginTop: 16,
                        display: 'flex',
                        flexDirection: 'row'
                    }}
                >
                    <div
                        style={{
                            width: '40%',
                            margin: '5%'
                        }}
                    >
                        <TextInput
                            label={'Batch'}
                            name={'Batch'}
                            key={randId}
                            onChange={
                                (e: ChangeEvent<HTMLInputElement>) => {
                                    const reader = new FileReader();
                                    const files = e.target.files;
                                    reader.onload = (ev: ProgressEvent<FileReader>) => {
                                        setFile({
                                            name: files[0].name,
                                            content: ev.target.result.toString()
                                        });
                                    };
                                    reader.onerror = () => {
                                        dispatch(PushNotification(t('cannot_read_file'), 'error'))
                                    }
                                    reader.readAsText(e.target.files[0]);
                                }
                            }
                            type={'file'}
                        />
                    </div>
                    <div
                        style={{
                            width: '40%',
                            margin: '5%'
                        }}
                    >
                        <Button title={'Generate'} variant={file.content === null ? 'disabled' : 'primary'} onClick={() => {
                            try {
                                const parsed = parse(file.content);
                                getBatchInvitations(parsed.data, datesResp.response.data.dates)
                                    .then((res) => {
                                        if (res.error) {
                                            dispatch(PushNotification(t(...(res.error as [any])), 'error'))
                                        } else {
                                            const randUuid = v4();
                                            generateInvitationsBatch.lazyRequest([
                                                events.events[0].id,
                                                token,
                                                {
                                                    invitations: res.res.map(iv => ({owner: iv.email, dates: iv.dates, amount: iv.amount})),
                                                    appUrl: getEnv().REACT_APP_USER_URL,
                                                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                                                },
                                                randUuid
                                            ]);
                                        }
                                    })
                            } catch (e) {
                                dispatch(PushNotification(t('invalid_csv_format'), 'error'));
                            }
                            setFile({
                                name: null,
                                content: null
                            });
                            setRandId(v4());
                        }}/>
                    </div>
                </div>

                : null
        }
    </InvitationGeneratorContainer>
}

const InvitationsListingTableContainer = styled.div`
    padding: ${props => props.theme.doubleSpacing};
    width: 100%;
`;

const InvitationsListingTable = styled.table`
    width: 100%;
    border-spacing: 0;
    & > thead > tr > th {
        background-color: ${props => props.theme.darkBg};
        padding: ${props => props.theme.regularSpacing};
    }
    & > thead > tr > th:first-child {
        border-top-left-radius: ${props => props.theme.defaultRadius};
    }
    & > thead > tr > th:last-child {
        border-top-right-radius: ${props => props.theme.defaultRadius};
    }
    & > tbody > tr > td {
        background-color: ${props => props.theme.componentColorLight};
        padding: ${props => props.theme.regularSpacing};
        text-align: center;
    }
    & > tbody > tr > td.idx {
        font-weight: bold;
    }
    & > tbody > tr > td {
        background-color: ${props => props.theme.componentColorLight};
        padding: calc(1.5 * ${props => props.theme.regularSpacing});
        text-align: center;
    }
    & > tbody > tr:nth-child(odd) > td {
        background-color: ${props => props.theme.componentColor};
    }
    & > tbody > tr:last-child > td:first-child {
        border-bottom-left-radius: ${props => props.theme.defaultRadius};
    }
    & > tbody > tr:last-child > td:last-child {
        border-bottom-right-radius: ${props => props.theme.defaultRadius};
    }

    & > tbody > tr > td.dates {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        width: 100%;
        height: 100%;
    }

`;

interface InvitationsPageSelectorProps {
    size: number;
    total: number;
    page: number;
    setPage: (idx: number) => void;
}

const PagesContainer = styled.div`
    display: inline-block;
    margin: ${props => props.theme.smallSpacing};
`;

const Page = styled.a`
    text-decoration: none;
    padding: 12px;
    float: left;
    color: white;
    cursor: pointer;
    border-radius: 6px;
    &.selected {
        background: linear-gradient(0deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15)), linear-gradient(260deg, ${
            props => props.theme.primaryColor.hex
        }, ${
            props => props.theme.primaryColorGradientEnd.hex
        });
        font-weight: bold;
    }
`;
const InvitationsPageSelector: React.FC<InvitationsPageSelectorProps> = (props: InvitationsPageSelectorProps): JSX.Element => {

    const totalPages = props.total === 0 ? 1 : Math.ceil(props.total / props.size);
    const range = [...new Array(totalPages)].map((_, idx) => idx);

    const [
        pre,
        current,
        post,
    ] = [
        range.slice(0, props.page - 2 < 0 ? 0 : props.page - 2),
        range.slice(props.page - 2 < 0 ? 0 : props.page - 2, props.page + 3),
        range.slice(props.page + 3),
    ];

    return <PagesContainer>
        <Page
            onClick={() => props.setPage(props.page === 0 ? 0 : props.page - 1)}
        >&laquo;</Page>
        {
            pre.length > 0
                ?
                <Page>...</Page>

                :
                null

        }
        {
            current.map((pagenum) => (
                <Page
                    onClick={() => props.setPage(pagenum)}
                    key={pagenum + 1}
                    className={pagenum === props.page ? 'selected' : undefined}
                >{pagenum + 1}</Page>
            ))
        }
        {
            post.length > 0
                ?
                <Page>...</Page>

                :
                null

        }
        <Page
            onClick={() => props.setPage(props.page + 1 === totalPages ? props.page : props.page + 1)}
        >&raquo;</Page>
    </PagesContainer>;
};

interface InvitationsPageSizeProps {
    size: number;
    setSize: (size: number) => void;
    setPage: (page: number) => void;
}

const InvitationsPageSize: React.FC<InvitationsPageSizeProps> = (props: InvitationsPageSizeProps): JSX.Element => {

    const sizes = [10, 20, 50];
    const [t] = useTranslation('attendees');

    return <div
        style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center'
        }}
    >
        <span>{t('results_per_page')}</span>
        <PagesContainer>
            {
                sizes.map((val) => (
                    <Page
                        key={val}
                        onClick={() => {
                            props.setPage(0);
                            props.setSize(val);
                        }}
                        className={val === props.size ? 'selected' : undefined}
                    >
                        {val}
                    </Page>
                ))
            }
        </PagesContainer>
    </div>;
};

const InvitationsTotalContainer = styled.div`
    padding: ${props => props.theme.regularSpacing};
`;

interface DatesTagsProps {
    dateIds: string[];
    dates: DateEntity[];
}

const DateTagContainer = styled.div`
    background-color: #ffffff10;
    border-radius: ${props => props.theme.defaultRadius};
    padding: ${props => props.theme.smallSpacing};
    margin: ${props => props.theme.smallSpacing};
`

const DatesTags = (props: DatesTagsProps): JSX.Element => {
    return <>
        {
            props.dateIds.map((id: string) => {
                const dateIdx = props.dates.findIndex((d: DateEntity) => d.id === id);
                if (dateIdx === -1) {
                    return <DateTagContainer>
                        <p>?</p>
                    </DateTagContainer>
                }
                const date = props.dates[dateIdx];
                return <DateTagContainer>
                    <p>{date.metadata.name}</p>
                </DateTagContainer>
            })
        }
    </>
}

const DeleteIcon = styled(Icon)`
    color: ${props => props.theme.errorColor.hex}80 !important;

    &:hover {
        color: ${props => props.theme.errorColor.hex}ff !important;
    }
`

const InvitationsListing = (): JSX.Element => {
    const [t] = useTranslation('invitations')
    const [currentPage, setCurrentPage] = useState(0);
    const [currentSize, setCurrentSize] = useState(10);
    const [total, setTotal] = useState(0);
    const theme = useTheme() as Theme;
    const events = useContext(EventsContext);
    const token = useToken();
    const [uuid] = useState<string>(v4() + '@categories-fetch');
    const dispatch = useDispatch();

    const invitationsResp = useRequest<InvitationsSearchResponseDto>({
        method: 'invitations.search',
        args: [
            events.events[0].id,
            token,
            {
                $page_size: currentSize,
                $page_index: currentPage,
                $sort: [{
                    $field_name: 'updated_at',
                    $order: 'desc'
                }]
            }
        ],
        refreshRate: 10,
    }, uuid);

    const datesResp = useRequest<DatesSearchResponseDto>({
        method: 'dates.search',
        args: [
            token,
            {
                group_id: {
                    $eq: events.events[0].group_id,
                },
                $sort: [{
                    $field_name: 'created_at',
                    $order: 'desc',
                }],
            },
        ],
        refreshRate: 10,
    }, uuid);

    const deleteInvitationLazyRequest = useLazyRequest<InvitationsDeleteResponseDto>('invitations.delete', uuid);

    useEffect(() => {
        if (!isNil(invitationsResp.response?.data?.total) && invitationsResp.response.data.total !== total) {
            setTotal(invitationsResp.response.data.total)
        }
    }, [invitationsResp.response, total])

    useEffect(() => {

        if (!deleteInvitationLazyRequest.response.loading) {
            if (deleteInvitationLazyRequest.response.data) {
                dispatch(PushNotification(t('delete_invitation_success'), 'success'));
                invitationsResp.force();
            } else if (deleteInvitationLazyRequest.response.error) {
                dispatch(PushNotification(t('delete_invitation_failure'), 'error'));
            }
        }

    }, [deleteInvitationLazyRequest.response.loading])

    if (isRequestError(invitationsResp) || isRequestError(datesResp)) {
        return <Error message={t('fetch_error')} retryLabel={'common:retrying_in'} onRefresh={
            () => {
                invitationsResp.force();
                datesResp.force();
            }
        }/>;
    }

    const invitations = invitationsResp.response.loading && !invitationsResp.response.data ? [] : invitationsResp.response.data.invitations;

    return <>
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 32
            }}
        >
            <InvitationsPageSelector size={currentSize} total={total} page={currentPage} setPage={setCurrentPage}/>
            <InvitationsPageSize size={currentSize} setSize={setCurrentSize} setPage={setCurrentPage}/>
        </div>
        <InvitationsListingTableContainer>
            <InvitationsListingTable>
                <thead>
                <tr>
                    <th>#</th>
                    <th>{t('email')}</th>
                    <th>{t('dates')}</th>
                    <th>{t('creation_date')}</th>
                    <th>{t('last_transfer_date')}</th>
                    <th>{t('delete')}</th>
                </tr>
                </thead>
                <tbody>
                {

                    invitationsResp.response.loading

                        ? [...(new Array(currentSize))].map((_, idx) => (
                            <tr key={`loading-${idx + currentPage * currentSize}`}>
                                <td>
                                    <Skeleton ready={false} type={'text'} rows={1} showLoadingAnimation={true} color={theme.textColorDarker}>
                                    </Skeleton>
                                </td>
                                <td>
                                    <Skeleton ready={false} type={'text'} rows={1} showLoadingAnimation={true} color={theme.textColorDarker}>
                                    </Skeleton>
                                </td>
                                <td>
                                    <Skeleton ready={false} type={'text'} rows={1} showLoadingAnimation={true} color={theme.textColorDarker}>
                                    </Skeleton>
                                </td>
                                <td>
                                    <Skeleton ready={false} type={'text'} rows={1} showLoadingAnimation={true} color={theme.textColorDarker}>
                                    </Skeleton>
                                </td>
                                <td>
                                    <Skeleton ready={false} type={'text'} rows={1} showLoadingAnimation={true} color={theme.textColorDarker}>
                                    </Skeleton>
                                </td>
                                <td>
                                    <Skeleton ready={false} type={'text'} rows={1} showLoadingAnimation={true} color={theme.textColorDarker}>
                                    </Skeleton>
                                </td>
                            </tr>
                        ))


                        : (
                            invitations.length > 0

                                ? invitations.map((invitation, idx) => (
                                    <tr key={idx + currentPage * currentSize}>
                                        <td className={'idx'}>{(total - (idx + currentPage * currentSize))}</td>
                                        <td className={'email'}>{invitation.owner}</td>
                                        <td className={'dates'}>{
                                            datesResp.response.loading

                                                ? <Skeleton ready={false} type={'text'} rows={1} showLoadingAnimation={true} color={theme.textColorDarker}>
                                                </Skeleton>

                                                : <DatesTags dateIds={invitation.dates} dates={datesResp.response?.data.dates || []}/>
                                        }</td>
                                        <td className={'creation_date'}>{formatShort(new Date(invitation.created_at))}</td>
                                        <td className={'last_transfer_date'}>{formatShort(new Date(invitation.updated_at))}</td>
                                        <td className={'delete'}>
                                            <div
                                                style={{
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => {
                                                    deleteInvitationLazyRequest.lazyRequest([
                                                        events.events[0].id,
                                                        token,
                                                        {
                                                            invitations: [invitation.id]
                                                        }
                                                    ])
                                                }}
                                            >
                                                <DeleteIcon
                                                    icon={'delete'}
                                                    size={'20px'}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))

                                : <tr key={'empty'}>
                                    <td>{t('no_invitations')}</td>
                                    <td/>
                                    <td/>
                                    <td/>
                                    <td/>
                                    <td/>
                                </tr>
                        )
                }
                </tbody>
            </InvitationsListingTable>
        </InvitationsListingTableContainer>
        <InvitationsTotalContainer>
            <span>Total: </span>
            <span
                style={{
                    fontWeight: 'bold',
                }}
            >{total}</span>
        </InvitationsTotalContainer>
    </>
}

export const Invitations = (): JSX.Element => {

    return <InvitationsContainer>
        <div
            style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'row'
            }}
        >
            <InvitationsGenerator/>
            <BatchInvitationGenerator/>
        </div>
        <InvitationsListing/>
    </InvitationsContainer>
}
