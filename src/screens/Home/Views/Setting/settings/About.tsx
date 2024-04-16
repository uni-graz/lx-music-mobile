import { memo } from 'react'
import { View, TouchableOpacity } from 'react-native'

import Section from '../components/Section'

import { createStyle, openUrl } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import Text from '@/components/common/Text'

const qqGroupUrl = 'mqqopensdkapi://bizAgent/qm/qr?url=http%3A%2F%2Fqm.qq.com%2Fcgi-bin%2Fqm%2Fqr%3Ffrom%3Dapp%26p%3Dandroid%26jump_from%3Dwebapi%26k%3DDOAOUG8sbhCRkUArbBiLf6jnBBkFbdap'
const qqGroupWebUrl = 'https://qm.qq.com/cgi-bin/qm/qr?k=teJcLWyCwL--qL-qZ0mCZgfUoPyLyU-f&jump_from=webapi&authKey=Wf7/8upKqLw++3KY0KFqAZlaAtwnwsUQCotkAHAG3RQun61s6Lg/QvYiMkpymJEd'

export default memo(() => {
  const theme = useTheme()
  const t = useI18n()
  const openHomePage = () => {
    void openUrl('https://github.com/ikun0014/lx-music-mobile#readme')
  }
  const goToQQGroup = () => {
    openUrl(qqGroupUrl).catch(() => {
      void openUrl(qqGroupWebUrl)
    })
  }

  const textLinkStyle = {
    ...styles.text,
    textDecorationLine: 'underline',
    color: theme['c-primary-font'],
    // fontSize: 14,
  } as const


  return (
    <Section title={t('setting_about')}>
      <View style={styles.part}>
        <Text style={styles.text} >本软件完全免费，代码已开源，开源地址：</Text>
        <TouchableOpacity onPress={openHomePage}>
          <Text style={textLinkStyle}>https://github.com/ikun0014/lx-music-mobile</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.part}>
        <Text style={styles.text}>有问题可加企鹅群 </Text>
        <TouchableOpacity onPress={goToQQGroup}><Text style={textLinkStyle}>607047319</Text></TouchableOpacity>
        <Text style={styles.text}> 反馈。</Text>
      </View>
    </Section>
  )
})

const styles = createStyle({
  part: {
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 14,
    textAlignVertical: 'bottom',
  },
  boldText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlignVertical: 'bottom',
  },
  throughText: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    textAlignVertical: 'bottom',
  },
  btn: {
    flexDirection: 'row',
  },
})
