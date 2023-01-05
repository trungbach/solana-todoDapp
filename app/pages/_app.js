import Head from "next/head"
// import WalletConnectProvider from "../components/WalletConnectProvider"
import "../styles/global.css"
// Import the solana wallet css
import "@solana/wallet-adapter-react-ui/styles.css"

import dynamic from "next/dynamic"
const WalletConnectProvider = dynamic(
  () => import("../components/WalletConnectProvider"),
  { ssr: false }
)
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Todo App</title>
      </Head>
      <main>
        <WalletConnectProvider>
          <Component {...pageProps} />
        </WalletConnectProvider>
      </main>
    </>
  )
}

export default MyApp
