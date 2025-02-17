import { redirect } from 'next/navigation';
import { GenerationalContextParser } from '@/lib/GenerationalContextParser'

export default function Home() {
  redirect('/onboarding/step-one')
}