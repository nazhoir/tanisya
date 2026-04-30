'use client'

import { Button } from '@tanisya/ui/components/button'
import { Input } from '@tanisya/ui/components/input'
import { Label } from '@tanisya/ui/components/label'

const ForgotPasswordForm = () => {
  return (
    <form className='space-y-4' onSubmit={e => e.preventDefault()}>
      {/* Email */}
      <div className='space-y-1'>
        <Label className='leading-5' htmlFor='userEmail'>
          Email address*
        </Label>
        <Input type='email' id='userEmail' placeholder='Enter your email address' />
      </div>

      <Button className='w-full' type='submit'>
        Send Reset Link
      </Button>
    </form>
  )
}

export default ForgotPasswordForm
