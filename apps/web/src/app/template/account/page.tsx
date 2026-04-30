import { Tabs, TabsList, TabsTrigger } from '@tanisya/ui/components/tabs'
import UserGeneral from '@/components/shadcn-studio/blocks/account-settings-01/account-settings-01'


const tabs = [
  { name: 'General', value: 'general' },
  { name: 'Preferences', value: 'preferences' },
  { name: 'Users', value: 'users' }
]

const AccountSettings01Block = () => {
  return (
    <div className='w-full py-8'>
      <div className='mx-auto min-h-screen max-w-7xl px-4 sm:px-6 lg:px-8'>
        <Tabs defaultValue='general' className='gap-4'>
          <TabsList className='h-fit! w-full rounded-none border-b bg-transparent p-0 sm:justify-start'>
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='data-[state=active]:border-primary dark:data-[state=active]:border-primary rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none! sm:flex-0 dark:data-[state=active]:bg-transparent'
              >
                {tab.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className='mt-4'>
          <UserGeneral />
        </div>
      </div>
    </div>
  )
}

const AccountPage = () => {
  return (
    <div className='flex flex-col'>
      <AccountSettings01Block />
    </div>
  )
}

export default AccountPage
