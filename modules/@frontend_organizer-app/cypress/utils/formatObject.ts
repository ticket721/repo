export const makeAxiosPromise = (data, status = 200) => {
  return Promise.resolve({data, status, statusText: `${status}`, headers: '', config: {}})
}
