import { 
    createDefaultAuthorizationCache, 
    createDefaultChainSelector, 
    createDefaultWalletNotFoundHandler,
    registerMwa, 
} from '@solana-mobile/wallet-standard-mobile';

registerMwa({
    appIdentity: {
    name: 'EnSwapp',
    uri: 'https://enswapp.vercel.app/',
    icon: '/favicon.ico', // relative path resolves to https://solscore.vercel.app/favicon.ico
  },  
    authorizationCache: createDefaultAuthorizationCache(),
    chains: ['solana:devnet'],
    chainSelector: createDefaultChainSelector(),
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
    remoteHostAuthority: 'enswapp.vercel.app',
})