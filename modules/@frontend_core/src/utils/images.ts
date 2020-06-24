export const getImgPath = (id: string): string =>
    // tslint:disable-next-line:max-line-length
    `${process.env.REACT_APP_T721_SERVER_PROTOCOL}://${process.env.REACT_APP_T721_SERVER_HOST}:${process.env.REACT_APP_T721_SERVER_PORT}/static/${id}`;
