'use client'
import dynamic from 'next/dynamic'
import App from '../components/trial'

const DynamicHeader = dynamic(() => import('../components/trial'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
})

export default function Home() {
  return <App />
}
