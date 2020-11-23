export const uploadImageWithSdk = async (token: string, file: File): Promise<string | false> => {
    const formData = new FormData();
    formData.append('images', file);
    const resp = await global.window.t721Sdk.images.upload(
        token,
        formData,
        {},
    );

    return resp.data.urls[0];
}
