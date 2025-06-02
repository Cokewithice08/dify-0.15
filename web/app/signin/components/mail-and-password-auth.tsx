import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import { useContext } from 'use-context-selector'
import Button from '@/app/components/base/button'
import Toast from '@/app/components/base/toast'
import { emailRegex } from '@/config'
import { login } from '@/service/common'
import Input from '@/app/components/base/input'
import I18NContext from '@/context/i18n'

type MailAndPasswordAuthProps = {
  isInvite: boolean
  isEmailSetup: boolean
  allowRegistration: boolean
}

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/

export default function MailAndPasswordAuth({ isInvite, isEmailSetup, allowRegistration }: MailAndPasswordAuthProps) {
  const { t } = useTranslation()
  const { locale } = useContext(I18NContext)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const emailFromLink = decodeURIComponent(searchParams.get('email') || '')
  const [email, setEmail] = useState(emailFromLink)
  const [password, setPassword] = useState('')
  // 步骤1：解析 URL 参数
  // const urlsearchParams = new URLSearchParams(window.location.search)
  // console.log(urlsearchParams)
  // const consoleToken = urlsearchParams.get('console_token')
  // const refreshToken = urlsearchParams.get('refresh_token')

  // // 步骤2：验证并存储敏感数据
  // if (consoleToken && refreshToken) {
  //   // 安全存储到 sessionStorage（会话级存储）
  //   localStorage.setItem('console_token', consoleToken)
  //   localStorage.setItem('refresh_token', refreshToken)

  //   // 步骤3：清除 URL 中的敏感参数
  //   router.replace('/apps')
  // } else {
  //   useEffect(() => {
  //     window.location.href = `https://wfserver.gree.com/Sso/Oauth/Show?appID=0347f117-1b67-46a1-b4ec-a173f7bffa14&sourceUrl=http://10.23.197.232/signin`
  //   }, [])
  // }
  useEffect(() => {
    // 获取URL参数
    const urlSearchParams = new URLSearchParams(window.location.search);
    const consoleToken = urlSearchParams.get('console_token');
    const refreshToken = urlSearchParams.get('refresh_token');

    // 步骤2：验证并存储敏感数据
    if (consoleToken && refreshToken) {
      // 安全存储到 sessionStorage（会话级存储）
      sessionStorage.setItem('console_token', consoleToken);
      sessionStorage.setItem('refresh_token', refreshToken);

      // 步骤3：清除 URL 中的敏感参数
      router.replace('/apps');
    } else {
      // 如果没有获取到token，跳转到登录页面
      window.location.href = 'https://wfserver.gree.com/Sso/Oauth/Show?appID=0347f117-1b67-46a1-b4ec-a173f7bffa14&sourceUrl=http://10.23.197.232/signin';
    }
  }, [router]);

  const [isLoading, setIsLoading] = useState(false)
  const handleEmailPasswordLogin = async () => {
    if (!email) {
      Toast.notify({ type: 'error', message: t('login.error.emailEmpty') })
      return
    }
    if (!emailRegex.test(email)) {
      Toast.notify({
        type: 'error',
        message: t('login.error.emailInValid'),
      })
      return
    }
    if (!password?.trim()) {
      Toast.notify({ type: 'error', message: t('login.error.passwordEmpty') })
      return
    }
    if (!passwordRegex.test(password)) {
      Toast.notify({
        type: 'error',
        message: t('login.error.passwordInvalid'),
      })
      return
    }
    try {
      setIsLoading(true)
      const loginData: Record<string, any> = {
        email,
        password,
        language: locale,
        remember_me: true,
      }
      if (isInvite)
        loginData.invite_token = decodeURIComponent(searchParams.get('invite_token') as string)
      const res = await login({
        url: '/login',
        body: loginData,
      })
      if (res.result === 'success') {
        if (isInvite) {
          router.replace(`/signin/invite-settings?${searchParams.toString()}`)
        }
        else {
          localStorage.setItem('console_token', res.data.access_token)
          localStorage.setItem('refresh_token', res.data.refresh_token)
          router.replace('/apps')
        }
      }
      else if (res.code === 'account_not_found') {
        if (allowRegistration) {
          const params = new URLSearchParams()
          params.append('email', encodeURIComponent(email))
          params.append('token', encodeURIComponent(res.data))
          router.replace(`/reset-password/check-code?${params.toString()}`)
        }
        else {
          Toast.notify({
            type: 'error',
            message: t('login.error.registrationNotAllowed'),
          })
        }
      }
      else {
        Toast.notify({
          type: 'error',
          message: res.data,
        })
      }
    }

    finally {
      setIsLoading(false)
    }
  }

  const handleSSOLogin = () => {
    // 单点登录跳转逻辑
    window.location.href = `https://wfserver.gree.com/Sso/Oauth/Show?appID=0347f117-1b67-46a1-b4ec-a173f7bffa14&sourceUrl=http://10.23.197.232/signin`
  }


  return null
}
