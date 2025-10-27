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

    // 1. Проверяем, существует ли уже пользователь с таким email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    let userId: string
    let isNewUser = false

    const existingUser = existingUsers?.users.find(u => u.email === 'employee@wink.ru')
    
    if (existingUser) {
      // Если пользователь существует, используем его ID
      userId = existingUser.id
      console.log('User already exists, using existing user:', userId)
    } else {
      // Создаем нового пользователя
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: 'employee@wink.ru',
        password: 'Test123!',
        email_confirm: true,
        user_metadata: {
          full_name: 'Сидоров Иван Петрович'
        }
      })

      if (userError) {
        throw new Error(`Failed to create user: ${userError.message}`)
      }

      userId = userData.user.id
      isNewUser = true
      console.log('Created new user:', userId)
    }

    // 2. Обновляем профиль пользователя (устанавливаем отдел)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        department_id: 'd1a2b3c4-5678-9012-3456-789012345678', // Отдел разработки
        full_name: 'Сидоров Иван Петрович'
      })
      .eq('id', userId)

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`)
    }

    // 2.5. Ensure employee role is set in user_roles table
    const { error: setRoleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'employee'
      })

    if (setRoleError) {
      throw new Error(`Failed to set user role: ${setRoleError.message}`)
    }

    // 3. Создаем тестовую цель
    const { data: goalData, error: goalError } = await supabaseAdmin
      .from('goals')
      .insert({
        user_id: userId,
        title: 'Освоение новых технологий',
        description: 'Изучить React Query и TypeScript для улучшения качества кода',
        period: 'Q1 2025',
        due_date: '2025-03-31',
        status: 'on_review',
        progress: 0
      })
      .select()
      .single()

    if (goalError) {
      throw new Error(`Failed to create goal: ${goalError.message}`)
    }

    // 4. Создаем задачи к цели
    const tasks = [
      { title: 'Пройти курс по React Query', is_done: false },
      { title: 'Изучить TypeScript best practices', is_done: false },
      { title: 'Применить новые знания в проекте', is_done: false }
    ]

    const { error: tasksError } = await supabaseAdmin
      .from('goal_tasks')
      .insert(
        tasks.map(task => ({
          goal_id: goalData.id,
          title: task.title,
          is_done: task.is_done
        }))
      )

    if (tasksError) {
      throw new Error(`Failed to create tasks: ${tasksError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Тестовый сотрудник успешно создан',
        data: {
          user: {
            id: userId,
            email: 'employee@wink.ru',
            full_name: 'Сидоров Иван Петрович',
            is_new: isNewUser
          },
          goal: {
            id: goalData.id,
            title: goalData.title,
            status: goalData.status,
            tasks_count: tasks.length
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
