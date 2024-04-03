import { LIST_IDS } from '@/config/constant'
import { addListMusics } from '@/core/list'
import { playList, playNext } from '@/core/player/player'
import { addTempPlayList } from '@/core/player/tempPlayList'
import settingState from '@/store/setting/state'
import { getListMusicSync } from '@/utils/listManage'
import { confirmDialog, requestStoragePermission, shareMusic, toast } from '@/utils/tools'
import { addDislikeInfo, hasDislike } from '@/core/dislikeList'
import playerState from '@/store/player/state'
import RNFetchBlob from 'rn-fetch-blob'
import { getMusicUrl } from '@/core/music'

export const handlePlay = (musicInfo: LX.Music.MusicInfoOnline) => {
  void addListMusics(LIST_IDS.DEFAULT, [musicInfo], settingState.setting['list.addMusicLocationType']).then(() => {
    const index = getListMusicSync(LIST_IDS.DEFAULT).findIndex(m => m.id == musicInfo.id)
    if (index < 0) return
    void playList(LIST_IDS.DEFAULT, index)
  })
}

export function getFileExtension(url: string) {
  // 使用正则表达式匹配URL中的文件扩展名
  const match = url.match(/\.([0-9a-z]+)(?=[?#]|$)/i);

  // 如果匹配到扩展名，则返回该扩展名，否则返回默认值'mp3'
  return match ? match[1] : 'mp3';
}

// export const handelDownload = (musicInfo: LX.Music.MusicInfoOnline) => {
export const handelDownload = (musicInfo: any) => {
  let quality: LX.Quality = "128k"
  if (musicInfo.meta._qualitys['320k']) {
    quality = "320k"
  }
  return requestStoragePermission().then(async () => {
    getMusicUrl({ musicInfo, quality, isRefresh: true }).then(url => {
      console.log(url);
      const extension = getFileExtension(url);
      const fileName = musicInfo.name;
      const downloadDir = RNFetchBlob.fs.dirs.DownloadDir + "/lx.music";
      const path = `${downloadDir}/${fileName}.${extension}`
      const config = {
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: path,
          description: '正在下载文件...',
        },
      };
      RNFetchBlob.config(config)
        .fetch('GET', url)
        .then((res) => {
          console.log('文件下载成功！路径：', res.path());
          toast("文件下载成功!", 'long')
        })
        .catch((error) => {
          console.log('文件下载失败：', error);
        });
    });
  }).catch((e) => {
    return Promise.reject(e ?? "权限获取失败")
  })


}


export const handlePlayLater = (musicInfo: LX.Music.MusicInfoOnline, selectedList: LX.Music.MusicInfoOnline[], onCancelSelect: () => void) => {
  if (selectedList.length) {
    addTempPlayList(selectedList.map(s => ({ listId: '', musicInfo: s })))
    onCancelSelect()
  } else {
    addTempPlayList([{ listId: '', musicInfo }])
  }
}


export const handleShare = (musicInfo: LX.Music.MusicInfoOnline) => {
  shareMusic(settingState.setting['common.shareType'], settingState.setting['download.fileName'], musicInfo)
}

export const handleDislikeMusic = async (musicInfo: LX.Music.MusicInfoOnline) => {
  const confirm = await confirmDialog({
    message: global.i18n.t('lists_dislike_music_tip', { name: musicInfo.name }),
    cancelButtonText: global.i18n.t('cancel_button_text_2'),
    confirmButtonText: global.i18n.t('confirm_button_text'),
    bgClose: false,
  })
  if (!confirm) return
  await addDislikeInfo([{ name: musicInfo.name, singer: musicInfo.singer }])
  toast(global.i18n.t('lists_dislike_music_add_tip'))
  if (hasDislike(playerState.playMusicInfo.musicInfo)) {
    void playNext(true)
  }
}

