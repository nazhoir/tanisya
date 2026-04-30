import ForgotPassword from '@/components/shadcn-studio/blocks/forgot-password-01/forgot-password-01'



const ForgotPassword01Block = () => {
  return <ForgotPassword />
}

const ForgotPasswordPage = () => {
  return (
    <div className='flex flex-col'>
      <ForgotPassword01Block />
    </div>
  )
}

export default ForgotPasswordPage
