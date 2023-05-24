import { useTranslation } from '@pancakeswap/localization'
import { WalletModalV2 } from '@pancakeswap/ui-wallets'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { createWallets, getDocLink } from 'config/wallet'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useAuth from 'hooks/useAuth'
// @ts-ignore
// eslint-disable-next-line import/extensions
import { useActiveHandle } from 'hooks/useEagerConnect.bmp.ts'
import { useMemo, useState,useEffect } from 'react'
import { useConnect } from 'wagmi'
import Trans from './Trans'
import UAuth, { UserInfo } from '@uauth/js'
import { ConnectModal } from './ConnectModal'

const ConnectWalletButton = ({ children, ...props }: ButtonProps) => {
  const handleActive = useActiveHandle()
  const { login } = useAuth()
  const {    t,    currentLanguage: { code },  } = useTranslation()
  const { connectAsync } = useConnect()
  const { chainId } = useActiveChainId()
  const [open, setOpen] = useState(false)

  const docLink = useMemo(() => getDocLink(code), [code])

  const [selected, setSelected] = useState(null)
  const [connectModalOpen, setconnectModalOpen] = useState(false)

  const [uDauth, setUDauth] = useState<UAuth|undefined>()
  const [udUser, setUdUser] = useState<UserInfo | undefined>()

  useEffect(() => {
    const uD = new UAuth({
      clientID: "2fe60d33-5fa3-4d67-8af3-d8e54ab536d7",
      redirectUri: `${location.origin}`,
      scope: "openid wallet email profile:optional social:optional"
    })
    setUDauth(uD)
  }, [])

  const handleConnectButton = () => {
    async function check() {
      if (udUser == undefined) {
        setSelected(null)
        setconnectModalOpen(true)
        return
      } else if (udUser != undefined && uDauth != undefined) {
        await uDauth.logout()
        location.reload()
      }
      setSelected(null)
      setconnectModalOpen(true)
    }
    check()
  }

  useEffect(() => {
    const checkLogin = async () => {
      if (selected == 'UD' && udUser == undefined) {
        try {
          await uDauth.loginWithPopup()
          location.reload()
        } catch (error) {
          console.log(error)
        }
      } else if (selected == "NEZHA") {
        handleClick()
      }
    }
    checkLogin()
  },[selected, uDauth])

  useEffect(() => {
    if (uDauth != undefined && udUser == undefined) {
      try {
        uDauth.user()
          .then((user) => {
            setUdUser(user)
          })
          .catch((e) => {
            console.log(e)
          })
      } catch (err) {
        // console.log(err)
      }
    }
  }, [uDauth])

  const handleClick = () => {
    if (typeof __NEZHA_BRIDGE__ !== 'undefined') {
      handleActive()
    } else {
      setOpen(true)
    }
  }

  const wallets = useMemo(() => createWallets(chainId, connectAsync), [chainId, connectAsync])

  return (
    <>
      {udUser ? <Button onClick={() => {
        handleConnectButton()
      }}> {udUser.sub}</Button> : (
          <Button onClick={() => {
            handleConnectButton()
          }} {...props}>
            {children || <Trans> Connect Wallet</Trans>}
          </Button>
      )}

      <WalletModalV2
        docText={t('Learn How to Connect')}
        docLink={docLink}
        isOpen={open}
        wallets={wallets}
        login={login}
        onDismiss={() => setOpen(false)}
      />
      <ConnectModal connectModalOpen={connectModalOpen} setSelected={setSelected} setconnectModalOpen={setconnectModalOpen} />
    </>
    
  )
}

export default ConnectWalletButton
