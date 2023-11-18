import React, {useState, useEffect} from 'react'
import Popover from 'react-bootstrap/Popover'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import {logHtml} from '../actions'
import BIFCoreSDK from 'bifcore-sdk-nodejs'

export const InputTooltip = ({text, enabled = true, children}: any) => {
  if (!enabled) {
    return children
  }

  return (
    <OverlayTrigger
      placement="bottom-start"
      trigger={['hover', 'focus']}
      overlay={
        <Popover className="bg-light" id="popover-basic">
          <Popover.Content>{text}</Popover.Content>
        </Popover>
      }
    >
      {children}
    </OverlayTrigger>
  )
}

export function NetworkUI(props: {bif: any; setBif: any}) {
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState('Disconnected')
  const [nodeUrl, setNodeUrl] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [balance, setBalance] = useState(0)

  const {bif, setBif} = props

  useEffect(() => {
    setNodeUrl(bif.nodeUrl)
    setPrivateKey(bif.privateKey)
    setStatus(bif.status)
    setBalance(bif.balance)
  }, [])

  const onEdit = () => {
    setEditing(true)
  }
  const onCancel = () => {
    setEditing(false)
    setNodeUrl(bif.nodeUrl)
    setPrivateKey(bif.privateKey)
  }
  const onSave = async () => {
    await getAccountBalance()
  }

  const getAccountBalance = async () => {
    setStatus('Connecting...')

    const sdk = new BIFCoreSDK({
      host: nodeUrl,
    })
    const resp = await sdk.account.getAccountBalance({address: sdk.keypair.privateKeyManagerByKey(privateKey).encAddress})
    if (resp.errorCode != 0) {
      setStatus('Disconnected')
      logHtml(JSON.stringify(resp.errorDesc))
      return
    }

    setStatus('Connected')
    setBalance(resp.result.balance)
    setEditing(false)
    setBif({
      nodeUrl,
      privateKey,
      status: 'Connected',
      balance: resp.result.balance,
    })
  }

  const onRefresh = async () => {
    await getAccountBalance()
  }

  return (
    <form id="network-form" style={networkStyle}>
      <div style={txMetaRowStyle}>
        <div style={labelStyle}>节点地址</div>
        <InputTooltip enabled={editing} text="星火链网节点地址，比如：http://test.bifcore.bitfactory.cn">
          <input className="form-control" id="node-url" type="text" disabled={!editing} value={nodeUrl} onChange={(e) => setNodeUrl(e.target.value)} />
        </InputTooltip>
      </div>

      <div style={txMetaRowStyle}>
        <div style={labelStyle}>私钥</div>
        <InputTooltip enabled={editing} text="星火链网私钥，比如：priSPKqSR8vTVJ1y8Wu1skBNWMHPeu8nkaerZNKEzkRq3KJix4">
          <textarea className="form-control" id="private-key" disabled={!editing} value={privateKey} onChange={(e) => setPrivateKey(e.target.value)} />
        </InputTooltip>
      </div>
      <div style={txMetaRowStyle}>
        <div style={labelStyle}>账户余额：{balance ? balance / 100000000 : 0} XHT</div>
      </div>
      {editing ? (
        <div style={txMetaRowRightStyle}>
          <i style={iconStyle} className="fa fa-times" onClick={() => onCancel()} />
          <i style={iconStyle} className="fa fa-save" onClick={() => onSave()} />
        </div>
      ) : (
        <div style={txMetaRowRightStyle}>
          <div id="connection-status" style={statusStyle(status)}>
            {status}
          </div>
          <i style={iconStyle} className="fa fa-sync" onClick={() => onRefresh()} />
          <i style={iconStyle} className="fa fa-edit" onClick={() => onEdit()} />
        </div>
      )}
    </form>
  )
}

export const bootstrapSelectStyle: any = {
  paddingRight: '20px !important',
}

export const networkStyle: any = {
  display: 'flex',
  alignItems: 'flex-end',
  flexDirection: 'column',
  width: '100%',
}

export const iconStyle: any = {
  cursor: 'pointer',
  minWidth: 28,
  textAlign: 'center',
  fontSize: 16,
  padding: 8,
  verticalAlign: 'center',
  textDecoration: 'none',
}

export const txMetaRowStyle: any = {
  paddingTop: 4,
  width: '100%',
}

export const txMetaRowRightStyle: any = {
  display: 'flex',
  alignItems: 'center',
  paddingTop: 4,
  justifyContent: 'flex-end',
}

export const labelStyle: any = {
  fontSize: 12,
  whiteSpace: 'nowrap',
  minWidth: 60,
}

export const statusStyle = (status: string) => {
  let color
  if (status === 'Connected') {
    color = 'green'
  } else if (status === 'Connecting...') {
    color = 'yellow'
  } else {
    color = 'red'
  }
  return {
    color,
    fontSize: 11,
    marginRight: 8,
  }
}