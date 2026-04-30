import OnboardingFeed from '@/components/shadcn-studio/blocks/onboarding-feed-01/onboarding-feed-01'



const OnboardingFeed01Block = () => {
  return (
    <div className='py-8 sm:py-16 lg:py-24'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-center'>
          <OnboardingFeed />
        </div>
      </div>
    </div>
  )
}

const OnboardingPage = () => {
  return (
    <div className='flex flex-col'>
      <OnboardingFeed01Block />
    </div>
  )
}

export default OnboardingPage
