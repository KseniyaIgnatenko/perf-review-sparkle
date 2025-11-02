import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, newPassword } = await req.json()

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, error: 'Email and newPassword are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Check if user has admin role
    const { data: roleData, error: adminRoleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (adminRoleError || !roleData) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden: Admin role required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Find user by email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const targetUser = existingUsers?.users.find(u => u.email === email)
    
    if (!targetUser) {
      return new Response(
        JSON.stringify({ success: false, error: `User with email ${email} not found` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Update user password
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    )

    if (updateError) {
      throw new Error(`Failed to update password: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Password updated successfully for ${email}`,
        data: {
          user_id: targetUser.id,
          email: email
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
