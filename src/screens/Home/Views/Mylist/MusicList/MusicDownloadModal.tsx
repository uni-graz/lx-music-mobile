import { useState, useRef, useImperativeHandle, forwardRef, useMemo, useEffect } from 'react'
import { View } from 'react-native'

import ConfirmAlert, { type ConfirmAlertType } from '@/components/common/ConfirmAlert'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import CheckBox from '@/components/common/CheckBox'
import { handelDownload } from './listAction'
import { getOtherSource } from '@/core/music/utils'

interface TitleType {
  updateTitle: (musicInfo: SelectInfo['musicInfo']) => void
}
const Title = forwardRef<TitleType, {}>((props, ref) => {
  const [title, setTitle] = useState('')
  useImperativeHandle(ref, () => ({
    updateTitle(musicInfo) {
      setTitle(global.i18n.t('download_music_title', { name: musicInfo.name }))
    },
  }))

  return (
    <Text style={{ marginBottom: 5 }}>{title}</Text>
  )
})

interface PositionInputType {
  getText: () => string
  setText: (text: string) => void
  focus: () => void
}

export interface SelectInfo {
  musicInfo: LX.Music.MusicInfo
  selectedList: LX.Music.MusicInfo[]
  index: number
  listId: string
  single: boolean
}
const initSelectInfo = {}

interface MusicDownloadModalProps {
  onDownloadInfo: (info: SelectInfo) => void
}

export interface MusicDownloadModalType {
  show: (listInfo: any) => void
}


export default forwardRef<MusicDownloadModalType, MusicDownloadModalProps>(({ onDownloadInfo }, ref) => {
  const alertRef = useRef<ConfirmAlertType>(null)
  const titleRef = useRef<TitleType>(null)
  const inputRef = useRef<PositionInputType>(null)
  const selectedInfo = useRef<SelectInfo>(initSelectInfo as SelectInfo)
  const [selectedQuality, setSelectedQuality] = useState<LX.Quality>("128k");
  const [playQualityList, setPlayQualityList] = useState<MusicOption[]>([]);
  const [visible, setVisible] = useState(false)

  interface QualityMap {
    [key: string]: MusicOption;
  }

  const calcQualitys = () => {
    setPlayQualityList([])
    const map = new Map();
    map.set("128k", "标准音质");
    map.set("320k", "高品音质");
    map.set("flac", "无损音质");
    map.set("flac24bit", "Hi-Res音质");
    const qualitys = selectedInfo.current?.musicInfo.meta.qualitys;

    let qualityMap: QualityMap = {};
    for (let index = 0; index < qualitys.length; index++) {
      const element = qualitys[index];
      const temp: MusicOption = {
        id: element.type,
        name: map.has(element.type) ? map.get(element.type) : "未知",
        size: element.size,
        key: element.type,
      }
      qualityMap[element.type] = temp;
    }
    setPlayQualityList(Object.values(qualityMap));
    if (Object.values(qualityMap).length == map.size) {
      return;
    }
    getOtherSource(selectedInfo.current?.musicInfo, true).then(res => {
      if (res.length == 0) {
        setPlayQualityList(Object.values(qualityMap));
        return;
      }
      for (let index = 0; index < res.length; index++) {
        const element = res[index];
        let qualitys = element.meta.qualitys
        for (let index = 0; index < qualitys.length; index++) {
          const element = qualitys[index];
          if (element.type in qualityMap) {
            continue;
          }
          const tem: MusicOption = {
            id: element.type,
            name: map.has(element.type) ? map.get(element.type) : "未知",
            size: element.size,
            key: element.type,
          }
          qualityMap[element.type] = tem;
          if (Object.values(qualityMap).length == map.size) {
            setPlayQualityList(Object.values(qualityMap));
            return;
          }
        }
      }

    }).catch(err => {

    })
  }

  const handleShow = () => {
    alertRef.current?.setVisible(true)
    requestAnimationFrame(() => {
      titleRef.current?.updateTitle(selectedInfo.current.musicInfo)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    })
  }
  useImperativeHandle(ref, () => ({
    show(listInfo) {
      selectedInfo.current = listInfo

      if (visible) {
        calcQualitys();
        handleShow()
      }
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          handleShow()
        })
      }
    },
  }))

  const handleDownloadMusic = () => {
    setSelectedQuality("128k");
    alertRef.current?.setVisible(false)
    handelDownload(selectedInfo.current?.musicInfo, selectedQuality);
    onDownloadInfo(selectedInfo.current);
  }

  interface MusicOption {
    id: LX.Quality;
    name: string;
    size?: string | null;
    key?: string
  }

  const useActive = (id: LX.Quality) => {
    const isActive = useMemo(() => selectedQuality == id, [selectedQuality, id])
    return isActive
  }

  const Item = ({ id, name }: {
    id: LX.Quality
    name: string
  }) => {
    const isActive = useActive(id)
    return <CheckBox marginRight={8} check={isActive} label={name} onChange={() => { setSelectedQuality(id) }} need />
  }

  return (
    visible
      ? <ConfirmAlert
        ref={alertRef}
        onConfirm={handleDownloadMusic}
        onHide={() => inputRef.current?.setText('')}
      >
        <View style={styles.content}>
          <Title ref={titleRef} />
          <View style={styles.list}>
            {
              playQualityList.map((item) => <Item name={item.name + "" + "(" + item.size + ")"} id={item.id} key={item.key} />)
            }
          </View>
        </View>
      </ConfirmAlert>
      : null
  )
})

const styles = createStyle({
  content: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column',
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 260,
    borderRadius: 4,
  },
  list: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
  },
})