import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export const POST = async (req: NextRequest) => {
    try {
        let event = await req.json();
        event = event.data;
        if (event.type === 'orders' && event.attributes.status === 'paid') {
            console.log('New order created:', event.id);
            const email = event.attributes.user_email;
            const { data: user, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('email', email)
                .single();
            if (user) {
                const { data, error: updateError } = await supabase
                    .from('user_profiles')
                    .update({
                        payment_status: 'paid',
                        product_id: event.id
                    })
                    .eq('id', user.id);

                if (updateError) {
                    console.error('Error updating user profile:', updateError);
                    return new Response(JSON.stringify({ error: 'Failed to update user profile' }), { status: 500 });
                }
                console.log('User profile updated successfully');
            } else {
                console.log('User not found for email:', email);
            }
        } else if (event.type === 'orders' && event.attributes.status === 'refunded') {
            console.log('Order refunded:', event.id);
        }
        return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
        console.error('Error handling LemonSqueezy webhook:', err);
        return new Response(JSON.stringify({ error: 'Failed to handle webhook' }), { status: 500 });
    }
}