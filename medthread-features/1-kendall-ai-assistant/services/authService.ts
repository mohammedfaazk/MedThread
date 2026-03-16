import { supabase } from '@/config/supabase'

/* =========================
   TYPES
========================= */

export interface UserCredentials {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  full_name: string
  age: number
  phone_number: string;          
  blood_type: string;    
  gender: 'male' | 'female' | 'other'
  marital_status: string
  checkup_reason: string
  specific_problem: string
  taking_medicines: boolean
  medicine_names: string
  allergies: string[]
  other_allergy: string
  had_surgery: boolean
  surgery_details: string
  head_mind_symptoms: string[]
  eye_ear_mouth_symptoms: string[]
  chest_heart_symptoms: string[]
  stomach_digestive_symptoms: string[]
  urinary_symptoms: string[]
  habits: string[]
  other_habit: string
  diet: string
  activity_level: string
  family_history: string[]
  mental_wellbeing: string[]
}

export interface UserProfile {
  id: string
  email: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  bloodType: string
  phoneNumber: string
  allergies: string[]
  chronicConditions: string[]
  createdAt: string
}

/* =========================
   AUTH SERVICE
========================= */

class AuthService {
  /* -------------------------
     SIGNUP
  ------------------------- */
  async signup(formData: SignupData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.full_name,
          },
        },
      })

      if (authError) throw authError
      if (!data.user) throw new Error('User not created')

      const user = data.user

      const { error: insertError } = await supabase
        .from('patient_health_records')
        .insert({
          user_id: user.id,
          email: formData.email,
          full_name: formData.full_name,
          age: formData.age,
          phone_number: formData.phone_number,         
          blood_type: formData.blood_type, 
          gender: formData.gender,
          marital_status: formData.marital_status,
          checkup_reason: formData.checkup_reason,
          specific_problem: formData.specific_problem,
          taking_medicines: formData.taking_medicines,
          medicine_names: formData.medicine_names,
          allergies: formData.allergies,
          other_allergy: formData.other_allergy,
          had_surgery: formData.had_surgery,
          surgery_details: formData.surgery_details,
          head_mind_symptoms: formData.head_mind_symptoms,
          eye_ear_mouth_symptoms: formData.eye_ear_mouth_symptoms,
          chest_heart_symptoms: formData.chest_heart_symptoms,
          stomach_digestive_symptoms: formData.stomach_digestive_symptoms,
          urinary_symptoms: formData.urinary_symptoms,
          habits: formData.habits,
          other_habit: formData.other_habit,
          diet: formData.diet,
          activity_level: formData.activity_level,
          family_history: formData.family_history,
          mental_wellbeing: formData.mental_wellbeing,
        })

      if (insertError) throw insertError

      return { success: true }
    } catch (error: any) {
      console.error('Signup error:', error)
      return { success: false, error: error.message || 'Signup failed' }
    }
  }

  /* -------------------------
     LOGIN
  ------------------------- */
  async login(credentials: UserCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  /* -------------------------
     LOGOUT
  ------------------------- */
  async logout() {
    await supabase.auth.signOut()
  }

  /* -------------------------
     GET CURRENT USER (PROFILE)
  ------------------------- */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) return null

      const userId = session.user.id

      const { data, error } = await supabase
        .from('patient_health_records')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error || !data) return null

      return {
        id: userId,
        email: data.email,
        name: data.full_name,
        age: data.age,
        gender: data.gender,
        bloodType: data.blood_type || '',
        phoneNumber: data.phone_number || '',
        allergies: data.allergies || [],
        chronicConditions: data.chronic_conditions || [],
        createdAt: data.created_at,
      }
    } catch (err) {
      console.error('getCurrentUser error:', err)
      return null
    }
  }

  /* -------------------------
     UPDATE PROFILE
  ------------------------- */
  async updateProfile(profile: Partial<UserProfile>): Promise<boolean> {
    try {
      if (!profile.id) return false
      const { error } = await supabase
        .from('patient_health_records')
        .update({
          full_name: profile.name,
          age: profile.age,
          gender: profile.gender,
          blood_type: profile.bloodType,
          phone_number: profile.phoneNumber,
          allergies: profile.allergies,
          chronic_conditions: profile.chronicConditions,
        })
        .eq('user_id', profile.id)

      if (error) throw error
      return true
    } catch (err) {
      console.error('updateProfile error:', err)
      return false
    }
  }
  /* -------------------------
   GET PATIENT HEALTH RECORD ID
------------------------- */
async getPatientHealthRecordId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return null

    const { data, error } = await supabase
      .from('patient_health_records')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (error || !data) return null
    return data.id
  } catch (err) {
    console.error('getPatientHealthRecordId error:', err)
    return null
  }
}
}

export const authService = new AuthService()
