import { useMemo, useState, useEffect } from 'react'
import { View, ScrollView, Alert } from 'react-native'
import { Navigation } from 'react-native-navigation'

import Button from '@/components/common/Button'
import { createStyle, openUrl } from '@/utils/tools'
import { useSettingValue } from '@/store/setting/hook'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'
import ModalContent from './ModalContent'
import { exitApp } from '@/utils/nativeModules/utils'
import { updateSetting } from '@/core/common'
import { checkUpdate } from '@/core/version'

const Content = () => {

  return (
    <View style={styles.main}>
      <Text style={styles.title} size={18} >警告</Text>
      <ScrollView style={styles.content} keyboardShouldPersistTaps={'always'}>
        <Text selectable style={styles.text} >这不是官方版本的LX Music，且不在任何公开平台发布（Github除外）。{'\n'}</Text>
      </ScrollView>
    </View>
  )
}

const Footer = ({ componentId }: { componentId: string }) => {
  const theme = useTheme()
  const isAgreePact = useSettingValue('common.isAgreePact')
  // const checkUpdate = useDispatch('common', 'checkUpdate')
  const [time, setTime] = useState(1)

  const handleRejct = () => {
    exitApp()
    // Navigation.dismissOverlay(componentId)
  }

  const handleConfirm = () => {
    let _isAgreePact = isAgreePact
    if (!isAgreePact) updateSetting({ 'common.isAgreePact': true })
    void Navigation.dismissOverlay(componentId)
    if (!_isAgreePact) {
      setTimeout(() => {
        Alert.alert(
          '',
          Buffer.from('e69cace8bdafe4bbb6e5ae8ce585a8e5858de8b4b9e4b894e5bc80e6ba90efbc8ce5a682e69e9ce4bda0e698afe88ab1e992b1e8b4ade4b9b0e79a84efbc8ce8afb7e79bb4e68ea5e7bb99e5b7aee8af84efbc810a0a5468697320736f667477617265206973206672656520616e64206f70656e20736f757263652e', 'hex').toString(),
          [{
            text: Buffer.from('e5a5bde79a8420284f4b29', 'hex').toString(),
            onPress: () => {
              void checkUpdate()
            },
          }],
        )
      }, 2e3)
    }
  }


  const confirmBtn = useMemo(() => {
    if (isAgreePact) return { disabled: false, text: '关闭' }
    return time ? { disabled: true, text: `同意（${time}）` } : { disabled: false, text: '同意' }
  }, [isAgreePact, time])

  useEffect(() => {
    if (isAgreePact) return
    const timeoutTools = {
      timeout: null as NodeJS.Timeout | null,
      start() {
        this.timeout = setTimeout(() => {
          setTime(time => {
            time--
            if (time > 0) this.start()
            return time
          })
        }, 1000)
      },
      clear() {
        if (!this.timeout) return
        clearTimeout(this.timeout)
      },
    }
    timeoutTools.start()
    return () => {
      timeoutTools.clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {
        isAgreePact
          ? null
          : (
            <Text selectable style={styles.tip} size={13}>若你（使用者）接受以上协议，请点击下面的“接受”按钮签署本协议，若不接受，请点击“不接受”后退出软件并清除本软件的所有数据。</Text>
          )
      }
      <View style={styles.btns}>
        {
          isAgreePact
            ? null
            : (
              <Button style={{ ...styles.btn, backgroundColor: theme['c-button-background'] }} onPress={handleRejct}>
                <Text color={theme['c-button-font']}>不同意</Text>
              </Button>
            )
        }
        <Button disabled={confirmBtn.disabled} style={{ ...styles.btn, backgroundColor: theme['c-button-background'] }} onPress={handleConfirm}>
          <Text color={theme['c-button-font']}>{confirmBtn.text}</Text>
        </Button>
      </View>
    </>
  )
}

const PactModal = ({ componentId }: { componentId: string }) => {
  return (
    <ModalContent>
      <Content />
      <Footer componentId={componentId} />
    </ModalContent>
  )
}

const styles = createStyle({
  main: {
    // flexGrow: 0,
    flexShrink: 1,
    marginTop: 15,
    marginBottom: 10,
  },
  content: {
    flexGrow: 0,
    marginLeft: 5,
    marginRight: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  title: {
    textAlign: 'center',
    marginBottom: 15,
  },
  part: {
    marginBottom: 10,
  },
  text: {
    fontSize: 14,
    textAlignVertical: 'bottom',
    marginBottom: 5,
  },
  bold: {
    fontSize: 14,
    textAlignVertical: 'bottom',
    fontWeight: 'bold',
  },
  tip: {
    textAlignVertical: 'bottom',
    fontWeight: 'bold',
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
  },
  btns: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 15,
    paddingLeft: 15,
    // paddingRight: 15,
  },
  btn: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    alignItems: 'center',
    borderRadius: 4,
    marginRight: 15,
  },
})

export default PactModal

