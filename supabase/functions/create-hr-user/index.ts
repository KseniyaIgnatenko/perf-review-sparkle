import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.1'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
          },
          credentials: {
            email: 'hr@wink.ru',
            password: 'HR123!'
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
