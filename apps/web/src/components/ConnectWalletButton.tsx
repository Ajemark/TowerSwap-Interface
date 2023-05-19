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

  const [uDauth, setUDauth] = useState<UAuth>()
  const [udUser, setUdUser] = useState<UserInfo>()

  useEffect(() => {
    const uD = new UAuth({
      clientID: "37a2f337-c4b9-465d-86df-efa58498ac20",
      redirectUri: `${location.origin}`,
      scope: "openid wallet email profile:optional social:optional"
    })
    setUDauth(uD)
  }, [])

  useEffect(() => {
    async () =>{
      if(selected == 'UD' && udUser == undefined && uDauth != undefined){
        try {
          await uDauth.loginWithPopup()
          location.reload()
        } catch (error) {
          console.log(error)
        }
      } else handleClick()
    }
  },[selected])

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

      <Button onClick={()=> setconnectModalOpen(true)} {...props}>
        {children || <Trans>Connect Wallet</Trans>}
      </Button>
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
