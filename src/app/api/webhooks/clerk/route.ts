import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as unknown as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  const { id } = evt.data
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data

    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    if (!email) {
      return new Response('Error: No email provided in Clerk event', { status: 400 })
    }

    try {
      let user = await prisma.user.findUnique({ where: { clerkId } });
      if (user) {
        user = await prisma.user.update({
          where: { clerkId },
          data: {
            email,
            name,
            profilePicture: image_url,
          }
        });
      } else {
        user = await prisma.user.create({
          data: {
            clerkId,
            email,
            name,
            profilePicture: image_url,
            profile: {
              create: {}
            }
          }
        });
      }
      console.log('User created/updated in DB via upsert:', user.id)
    } catch (error) {
      console.error('Error creating/updating user in DB:', error)
      return new Response('Error creating user', { status: 500 })
    }
  }

  if (eventType === 'user.updated') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data
    const email = email_addresses[0]?.email_address
    const name = [first_name, last_name].filter(Boolean).join(' ') || null

    if (!email) {
      return new Response('Error: No email provided in Clerk event', { status: 400 })
    }

    try {
      await prisma.user.update({
        where: { clerkId },
        data: {
          email,
          name,
          profilePicture: image_url,
        }
      })
      console.log('User updated in DB:', clerkId)
    } catch (error) {
      console.error('Error updating user in DB:', error)
      return new Response('Error updating user', { status: 500 })
    }
  }

  if (eventType === 'user.deleted') {
    const { id: clerkId } = evt.data

    if (clerkId) {
        try {
        await prisma.user.delete({
            where: { clerkId }
        })
        console.log('User deleted from DB:', clerkId)
        } catch (error) {
        console.error('Error deleting user in DB:', error)
        return new Response('Error deleting user', { status: 500 })
        }
    }
  }

  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
