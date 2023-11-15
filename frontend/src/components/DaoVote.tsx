/* eslint-disable no-console */
import { ReactNode, useState } from 'react'
import { Dao, DaoClient } from '../contracts/DaoClient'
import { useWallet } from '@txnlab/use-wallet'
import algosdk from 'algosdk'
import * as algokit from '@algorandfoundation/algokit-utils'

/* Example usage
<DaoVote
  buttonClass="btn m-2"
  buttonLoadingNode={<span className="loading loading-spinner" />}
  buttonNode="Call vote"
  typedClient={typedClient}
  inFavor={inFavor}
  registeredASA={registeredASA}
/>
*/
type DaoVoteArgs = Dao['methods']['vote(pay,bool,asset)void']['argsObj']

type Props = {
  buttonClass: string
  buttonLoadingNode?: ReactNode
  buttonNode: ReactNode
  typedClient: DaoClient
  inFavor: DaoVoteArgs['inFavor']
  registeredASA: DaoVoteArgs['registeredASA']
  setState: () => Promise<void>
  algodClient: algosdk.Algodv2
}

const DaoVote = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false)
  const { activeAddress, signer } = useWallet()
  const sender = { signer, addr: activeAddress! }

  const callMethod = async () => {
    setLoading(true)
    console.log(`Calling vote`)

    const { appAddress } = await props.typedClient.appClient.getAppReference()

    const boxMBRPayment = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: sender.addr,
      to: appAddress,
      amount: 15_700,
      suggestedParams: await algokit.getTransactionParams(undefined, props.algodClient),
    })

    await props.typedClient.vote(
      {
        boxMBRPayment,
        inFavor: props.inFavor,
        registeredASA: props.registeredASA,
      },
      { sender, boxes: [algosdk.decodeAddress(sender.addr).publicKey] },
    )
    await props.setState()
    setLoading(false)
  }

  return (
    <button className={props.buttonClass} onClick={callMethod}>
      {loading ? props.buttonLoadingNode || props.buttonNode : props.buttonNode}
    </button>
  )
}

export default DaoVote
