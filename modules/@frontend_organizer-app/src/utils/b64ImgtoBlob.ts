export const b64ImgtoBlob = (b64Data: string, sliceSize=512): Blob => {
    const contentType = b64Data.split(',')[0].match(/(image\/.+);/)[1];
    const data = b64Data.split(',')[1];
    const byteCharacters = atob(data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
}