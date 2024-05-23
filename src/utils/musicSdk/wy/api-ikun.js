import { httpFetch } from '../../request'
import { requestMsg } from '../../message'
import { headers, timeout } from '../options'

const api_ikun = {
  getMusicUrl(songInfo, type) {
    const requestObj = httpFetch(`https://lxmusic.ikunshare.com:9763/url/wy/${songInfo.songmid}/${type}`, {
      method: 'get',
      timeout,
      headers,
      family: 4,
    })
    requestObj.promise = requestObj.promise.then(({ statusCode, body }) => {
      if (statusCode == 429) return Promise.reject(new Error(requestMsg.tooManyRequests))
      switch (body.code) {
        case 0: return Promise.resolve({ type, url: body.data })
        default: return Promise.reject(new Error(requestMsg.fail))
      }
    })
    return requestObj
  },
}

export default api_ikun