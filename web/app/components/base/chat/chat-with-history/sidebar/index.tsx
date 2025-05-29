import {
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { useChatWithHistoryContext } from '../context'
import List from './list'
import AppIcon from '@/app/components/base/app-icon'
import Button from '@/app/components/base/button'
import { Edit05 } from '@/app/components/base/icons/src/vender/line/general'
import type { ConversationItem } from '@/models/share'
import Confirm from '@/app/components/base/confirm'
import RenameModal from '@/app/components/base/chat/chat-with-history/sidebar/rename-modal'
import MenuButton from './menu-button'

const Sidebar = () => {
  const { t } = useTranslation()
  const {
    appData,
    pinnedConversationList,
    conversationList,
    handleNewConversation,
    currentConversationId,
    handleChangeConversation,
    handlePinConversation,
    handleUnpinConversation,
    conversationRenaming,
    handleRenameConversation,
    handleDeleteConversation,
    isMobile,
  } = useChatWithHistoryContext()
  const [showConfirm, setShowConfirm] = useState<ConversationItem | null>(null)
  const [showRename, setShowRename] = useState<ConversationItem | null>(null)
  // 步骤1：解析 URL 参数
  const urlsearchParams = new URLSearchParams(window.location.search)
  const greeMail = urlsearchParams.get('gree_mail')
  const pathname = window.location.pathname
  const origin = window.location.origin

  if (greeMail) {
    localStorage.setItem('gree_mail', greeMail)
    window.history.replaceState({}, '', pathname)
  }
  const turnUrl = "https://wfserver.gree.com/Sso/Oauth/Show?appID=0347f117-1b67-46a1-b4ec-a173f7bffa14&sourceUrl=" + origin + pathname


  const handleOperate = useCallback((type: string, item: ConversationItem) => {
    if (type === 'pin')
      handlePinConversation(item.id)

    if (type === 'unpin')
      handleUnpinConversation(item.id)

    if (type === 'delete')
      setShowConfirm(item)

    if (type === 'rename')
      setShowRename(item)
  }, [handlePinConversation, handleUnpinConversation])
  const handleCancelConfirm = useCallback(() => {
    setShowConfirm(null)
  }, [])
  const handleDelete = useCallback(() => {
    if (showConfirm)
      handleDeleteConversation(showConfirm.id, { onSuccess: handleCancelConfirm })
  }, [showConfirm, handleDeleteConversation, handleCancelConfirm])
  const handleCancelRename = useCallback(() => {
    setShowRename(null)
  }, [])
  const handleRename = useCallback((newName: string) => {
    if (showRename)
      handleRenameConversation(showRename.id, newName, { onSuccess: handleCancelRename })
  }, [showRename, handleRenameConversation, handleCancelRename])

  const gree_mail = localStorage.getItem('gree_mail')


  return (
    <div className='shrink-0 h-full flex flex-col w-[240px] border-r border-r-gray-100'>
      {
        !isMobile && (
          <div className='shrink-0 flex p-4'>
            <AppIcon
              className='mr-3'
              size='small'
              iconType={appData?.site.icon_type}
              icon={appData?.site.icon}
              background={appData?.site.icon_background}
              imageUrl={appData?.site.icon_url}
            />
            <div className='py-1 text-base font-semibold text-gray-800'>
              {appData?.site.title}
            </div>
          </div>
        )
      }
      <div className='shrink-0 p-4'>
        <Button
          variant='secondary-accent'
          className='justify-start w-full'
          onClick={handleNewConversation}
        >
          <Edit05 className='mr-2 w-4 h-4' />
          {t('share.chat.newChat')}
        </Button>
      </div>
      <div className='grow px-4 py-2 overflow-y-auto'>
        {
          !!pinnedConversationList.length && (
            <div className='mb-4'>
              <List
                isPin
                title={t('share.chat.pinnedTitle') || ''}
                list={pinnedConversationList}
                onChangeConversation={handleChangeConversation}
                onOperate={handleOperate}
                currentConversationId={currentConversationId}
              />
            </div>
          )
        }
        {
          !!conversationList.length && (
            <List
              title={(pinnedConversationList.length && t('share.chat.unpinnedTitle')) || ''}
              list={conversationList}
              onChangeConversation={handleChangeConversation}
              onOperate={handleOperate}
              currentConversationId={currentConversationId}
            />
          )
        }
      </div>

      {/* 左下角单点登录和用户信息按钮 */}
      <div className='shrink-0 p-4'>
        {!gree_mail && (
          <a href={turnUrl} className='flex items-center gap-3 p-4'>
            <AppIcon
              className='shrink-0'
              size='small'
              iconType={appData?.site.icon_type}
              icon={appData?.site.icon}
              background={appData?.site.icon_background}
              imageUrl={appData?.site.icon_url}
            />
            <span className='text-sm'>未登录</span>
          </a>
        )}
        {
          gree_mail && (
            <MenuButton />
          )
        }
      </div>






      {appData?.site.copyright && (
        <div className='px-4 pb-4 text-xs text-gray-400'>
          © {(new Date()).getFullYear()} {appData?.site.copyright}
        </div>
      )}
      {!!showConfirm && (
        <Confirm
          title={t('share.chat.deleteConversation.title')}
          content={t('share.chat.deleteConversation.content') || ''}
          isShow
          onCancel={handleCancelConfirm}
          onConfirm={handleDelete}
        />
      )}
      {showRename && (
        <RenameModal
          isShow
          onClose={handleCancelRename}
          saveLoading={conversationRenaming}
          name={showRename?.name || ''}
          onSave={handleRename}
        />
      )}
    </div>
  )
}

export default Sidebar
