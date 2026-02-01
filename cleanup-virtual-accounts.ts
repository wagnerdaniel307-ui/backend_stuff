import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = 'purpleskyies01@gmail.com'
  
  try {
    // 1. Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: {
          include: {
            virtualAccounts: true
          }
        }
      }
    })

    if (!user || !user.wallet) {
      console.log(`❌ User or wallet not found for ${email}.`)
      return
    }

    console.log(`🔍 Found user: ${user.firstName} ${user.lastName} (${user.id})`)
    console.log(`🔍 Wallet ID: ${user.wallet.id}`)

    // 2. Clear virtual accounts for this wallet
    const deleteCount = await prisma.virtualAccount.deleteMany({
      where: {
        walletId: user.wallet.id
      }
    })

    console.log(`✅ Deleted ${deleteCount.count} obsolete virtual account(s) for ${email}.`)
    console.log(`🚀 You can now trigger 'POST /api/v1/wallets/virtual-accounts' from the app to regenerate them using the Production Squad API.`)

  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
