import { NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  const phones = [
    {
      CountryCode: 'tr',
      PhoneNumber: '+90 545 922 3554',
      noSpacePhoneNumber: '+905459223554',
      hasWhatsapp: false,
      hasTelegram: false,
    },
  ]

  return NextResponse.json({ message: 'Contact phones retrieved successfully', phones })
}
//
