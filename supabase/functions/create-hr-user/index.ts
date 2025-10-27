import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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

    // 1. Проверяем, существует ли уже пользователь HR
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    let userId: string
    let isNewUser = false

    const existingUser = existingUsers?.users.find(u => u.email === 'hr@wink.ru')
    
    if (existingUser) {
      userId = existingUser.id
      console.log('HR user already exists:', userId)
    } else {
      // Создаем нового HR пользователя
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: 'hr@wink.ru',
        password: 'HR123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Смирнова Анна Сергеевна'
        }
      })

      if (userError) {
        throw new Error(`Failed to create HR user: ${userError.message}`)
      }

      userId = userData.user.id
      isNewUser = true
      console.log('Created new HR user:', userId)
    }

    // 2. Обновляем профиль пользователя (устанавливаем роль HR)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: 'Смирнова Анна Сергеевна',
        role: 'hr',
        is_active: true
      })

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    // 2.5. Ensure HR role is set in user_roles table
    const { error: setRoleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'hr'
      })

    if (setRoleError) {
      throw new Error(`Failed to set user role: ${setRoleError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'HR пользователь успешно создан',
        data: {
          user: {
            id: userId,
            email: 'hr@wink.ru',
            full_name: 'Смирнова Анна Сергеевна',
            role: 'hr',
            is_new: isNewUser
          }
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
