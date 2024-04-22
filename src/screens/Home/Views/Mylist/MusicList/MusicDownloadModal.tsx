import { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react'
import { View } from 'react-native'

import ConfirmAlert, { type ConfirmAlertType } from '@/components/common/ConfirmAlert'
import Text from '@/components/common/Text'
import { createStyle } from '@/utils/tools'
import CheckBox from '@/components/common/CheckBox'
import { useSettingValue } from '@/store/setting/hook'
import { updateSetting } from '@/core/common'
import { handelDownload } from './listAction'

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
  show: (listInfo: SelectInfo) => void
}


export default forwardRef<MusicDownloadModalType, MusicDownloadModalProps>(({ onDownloadInfo }, ref) => {
  const alertRef = useRef<ConfirmAlertType>(null)
  const titleRef = useRef<TitleType>(null)
  const inputRef = useRef<PositionInputType>(null)
  const selectedInfo = useRef<SelectInfo>(initSelectInfo as SelectInfo)
  const [selectedQuality, setSselectedQuality] = useState<LX.Quality>("128k");
  const [visible, setVisible] = useState(false)

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
      console.log(selectedInfo);

      if (visible) handleShow()
      else {
        setVisible(true)
        requestAnimationFrame(() => {
          handleShow()
        })
      }
    },
  }))

  const handleDownloadMusic = () => {
    alertRef.current?.setVisible(false)
    // onDownloadInfo(selectedInfo.current, selectedQuality)
    handelDownload(selectedInfo.current?.musicInfo, selectedQuality);
  }

  const playQualityList = useMemo(() => {
    return ['128k', '320k', 'flac', 'flac24bit'] as LX.Quality[]
  }, [])


  const useActive = (id: LX.Quality) => {
    const isActive = useMemo(() => selectedQuality == id, [selectedQuality, id])
    return isActive
  }

  const Item = ({ id, name }: {
    id: LX.Quality
    name: string
  }) => {
    const isActive = useActive(id)
    return <CheckBox marginRight={8} check={isActive} label={name} onChange={() => { setSselectedQuality(id) }} need />
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
              playQualityList.map((q) => <Item name={q} id={q} key={q} />)
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
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})