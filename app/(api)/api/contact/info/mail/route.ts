import { NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  const mails = [
    {
      mail: 'kuraykaraaslan@gmail.com',
    },
  ]

  return NextResponse.json({ message: 'Contact mails retrieved successfully', mails })
}
//
