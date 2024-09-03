import { NextRequest } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export const POST = async (req: NextRequest) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 500 });
  }

  // Get the headers
  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  // Handle the webhook
  const { id, email_addresses, ...attributes } = evt.data;

  if (evt.type === 'user.created' || evt.type === 'user.updated') {
    const primaryEmail = email_addresses.find(email => email.id === attributes.primary_email_address_id);
    
    if (primaryEmail) {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          clerk_user_id: id,
          email: primaryEmail.email_address,
          first_name: attributes.first_name,
          last_name: attributes.last_name,
        }, {
          onConflict: 'clerk_user_id'
        });
      if (error) {
        console.error('Error upserting user:', error);
        return new Response('Error upserting user', { status: 500 });
      }
      console.log('User upserted successfully:', data);
    }
  }

  return new Response('', { status: 200 });
};