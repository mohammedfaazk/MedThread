// Language detection and translation service for VitaVoice

import { SUPPORTED_LANGUAGES } from '@/config/constants';

type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

// Common medical terms and UI translations
const translations: Record<LanguageCode, Record<string, string>> = {
    en: {
        // Greetings
        'greeting': 'Hello! I am Kendall, your healthcare assistant.',
        'how_can_help': 'How can I help you today?',
        'welcome_back': 'Welcome back!',

        // Symptom questions
        'main_problem': 'What is the main problem?',
        'when_started': 'When did it start?',
        'severity_question': 'How severe is it on a scale of 1-10?',
        'any_fever': 'Do you have fever?',
        'any_pain': 'Are you experiencing pain?',
        'breathing_ok': 'Is breathing normal?',

        // Common symptoms
        'fever': 'Fever',
        'headache': 'Headache',
        'cough': 'Cough',
        'cold': 'Cold',
        'body_ache': 'Body ache',
        'stomach_pain': 'Stomach pain',
        'diarrhea': 'Diarrhea',
        'vomiting': 'Vomiting',
        'weakness': 'Weakness',
        'dizziness': 'Dizziness',

        // Recommendations
        'rest_advice': 'Please take adequate rest',
        'hydration': 'Drink plenty of water',
        'see_doctor': 'Please consult a doctor',
        'emergency_call': 'This is an emergency. Call 108 immediately',

        // UI elements
        'speak_now': 'Speak now...',
        'listening': 'Listening...',
        'processing': 'Processing...',
        'send': 'Send',
        'cancel': 'Cancel',
        'continue': 'Continue',
        'back': 'Back',
        
        // Home screen
        'good_morning': 'Good Morning',
        'good_afternoon': 'Good Afternoon',
        'good_evening': 'Good Evening',
        'health_services': 'Health Services',
        'view_all': 'View All',
        'medications': 'Medications',
        'vaccines': 'Vaccines',
        'appointments': 'Appointments',
        'symptoms': 'Symptoms',
        'diet_plan': 'Diet Plan',
        'history': 'History',
        'emergency': 'Emergency',
        'need_emergency': 'Need Emergency Help?',
        'call_108': 'Call 108',
        'daily_insight': 'Daily Insight',
        'stay_hydrated': 'Stay hydrated! Drinking water boosts your energy levels.',
        'view_health_tips': 'View Health Tips',
        
        // Settings screen
        'settings': 'Settings',
        'language_voice': 'Language & Voice',
        'app_language': 'App Language',
        'voice_speed': 'Voice Speed',
        'voice_gender': 'Voice Gender',
        'autoplay_responses': 'Auto-play Responses',
        'notifications': 'Notifications',
        'health_reminders': 'Health Reminders',
        'appearance': 'Appearance',
        'text_size': 'Text Size',
        'dark_mode': 'Dark Mode',
        'data_storage': 'Data & Storage',
        'offline_mode': 'Offline Mode',
        'app_is_online': 'App is online',
        'app_is_offline': 'App is running offline',
        'storage_used': 'Storage Used',
        'clear_cache': 'Clear Cache',
        'privacy_security': 'Privacy & Security',
        'data_encryption': 'Data Encryption',
        'backup_data': 'Backup Data',
        'enabled': 'Enabled',
        'about': 'About',
        'app_version': 'App Version',
        'privacy_policy': 'Privacy Policy',
        'terms_of_service': 'Terms of Service',
        'select_language': 'Select Language',
        'clear_all_data': 'Clear All Data?',
        'clear_data_warning': 'This will remove all your local data, including login session and health records. This action cannot be undone.',
        'clear_data': 'Clear Data',
        'female': 'Female',
        'male': 'Male',
        'slow': 'Slow',
        'fast': 'Fast',
        'select_language_header': 'Select Language',
        
        // Chat screen
        'kendall': 'Kendall',
        'online': 'Online',
        'offline_mode_label': 'Offline Mode',
        'disable_audio': 'Disable audio',
        'enable_audio': 'Enable audio',
        'emergency_detected': 'Emergency detected! Redirecting to emergency services...',
        
        // Additional screens
        'health_education': 'Health Education',
        'all_topics': 'All Topics',
        'key_points': 'key points',
        'no_topics_found': 'No topics found',
        'search_health_topics': 'Search health topics...',
        'allergies': 'Allergies',
        'add_allergy': 'Add Allergy',
        'select_allergy': 'Select an allergy...',
        'vaccination_tracker': 'Vaccination Tracker',
        'medication_manager': 'Medication Manager',
        'diet_nutrition': 'Diet & Nutrition',
        'symptom_checker': 'Symptom Checker',
        'profile': 'Profile',
        'your_healthcare_companion': 'Your Healthcare Companion',
        'voice_enabled': 'Voice Enabled',
        'multi_language': 'Multi-Language',
        'offline_ready': 'Offline Ready',
        
        // Login/Signup screens
        'welcome_to': 'Welcome to VitaVoice',
        'login_title': 'Welcome Back',
        'login_subtitle': 'Login to access your health records',
        'email': 'Email',
        'enter_email': 'Enter your email',
        'password': 'Password',
        'enter_password': 'Enter your password',
        'forgot_password': 'Forgot password?',
        'login': 'Login',
        'login_failed': 'Login failed',
        'login_biometrics': 'Login with Biometrics',
        'demo_mode': 'Demo Mode (Skip Login)',
        'new_user': 'New user?',
        'signup': 'Sign up',
        'secure_encrypted': 'Your data is securely encrypted',
        'create_account': 'Create Account',
        'full_name': 'Full Name',
        'confirm_password': 'Confirm Password',
        'terms_agree': 'I agree to the Terms of Service',
        'already_have_account': 'Already have an account?',
        
        // Appointments
        // Appointments
        'doctor_appointments': 'Doctor Appointments',
        'book_appointment': 'Book Appointment',
        'upcoming_appointments': 'Upcoming Appointments',
        'select_doctor': 'Select Doctor',
        'select_date': 'Select Date',
        'available_slots': 'Available Slots',
        'select_time': 'Select Time',
        'book_new_appointment': 'Book New Appointment',
        'cancel_appointment': 'Cancel',
        'no_slots_available': 'No slots available for this date',
        'confirm_booking': 'Confirm Booking',
        'appointment_confirmed': 'Appointment Confirmed!',
        'no_appointments': 'No appointments scheduled',
        'done': 'Done',
        
        // Other screens
        'add': 'Add',
        'edit': 'Edit',
        'delete': 'Delete',
        'save': 'Save',
        'close': 'Close',
        'next': 'Next',
        'previous': 'Previous',
        'confirm': 'Confirm',
        'no_data': 'No data available',
        'loading': 'Loading...',

    },
    ta: {
        'greeting': 'வணக்கம்! நான் கெண்டல், உங்கள் சுகாதார உதவியாளர்.',
        'how_can_help': 'இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?',
        'welcome_back': 'மீண்டும் வரவேற்கிறோம்!',
        'main_problem': 'முக்கிய பிரச்சனை என்ன?',
        'when_started': 'இது எப்போது தொடங்கியது?',
        'severity_question': '1-10 அளவில் எவ்வளவு கடுமையானது?',
        'any_fever': 'காய்ச்சல் உள்ளதா?',
        'any_pain': 'வலி இருக்கிறதா?',
        'breathing_ok': 'சுவாசம் சாதாரணமாக உள்ளதா?',
        'fever': 'காய்ச்சல்',
        'headache': 'தலைவலி',
        'cough': 'இருமல்',
        'cold': 'சளி',
        'body_ache': 'உடல் வலி',
        'stomach_pain': 'வயிற்று வலி',
        'diarrhea': 'வயிற்றுப்போக்கு',
        'vomiting': 'வாந்தி',
        'weakness': 'பலவீனம்',
        'dizziness': 'தலைசுற்றல்',
        'rest_advice': 'தயவுசெய்து போதுமான ஓய்வு எடுங்கள்',
        'hydration': 'நிறைய தண்ணீர் குடியுங்கள்',
        'see_doctor': 'தயவுசெய்து மருத்துவரை அணுகவும்',
        'emergency_call': 'இது அவசரம். உடனடியாக 108 ஐ அழைக்கவும்',
        'speak_now': 'இப்போது பேசுங்கள்...',
        'listening': 'கேட்கிறது...',
        'processing': 'செயலாக்குகிறது...',
        'send': 'அனுப்பு',
        'cancel': 'ரத்து செய்',
        'continue': 'தொடர்',
        'back': 'பின்',
        'good_morning': 'காலை வணக்கம்',
        'good_afternoon': 'மதிய வணக்கம்',
        'good_evening': 'மாலை வணக்கம்',
        'health_services': 'சுகாதார சேவைகள்',
        'view_all': 'அனைத்தையும் காண்க',
        'medications': 'மருந்துகள்',
        'vaccines': 'தடுப்பூசிகள்',
        'appointments': 'அப்பாயிண்ட்மென்ட்',
        'symptoms': 'அறிகுறிகள்',
        'diet_plan': 'உணவு திட்டம்',
        'history': 'வரலாறு',
        'emergency': 'அவசரம்',
        'need_emergency': 'அவசர உதவி தேவையா?',
        'call_108': '108 என்ற எண் அழைக்கவும்',
        'daily_insight': 'தினசரி நுண்ணறிவு',
        'stay_hydrated': 'நீரேற்றமாக இருங்கள்! நீரை குடிப்பது உங்கள் ஆற்றল் பெருக்குகிறது.',
        'view_health_tips': 'சுகாதார உதிர்வுகளைக் காண்க',        
        // Settings screen - Tamil
        'settings': 'அமைப்புகள்',
        'language_voice': 'மொழி & குரல்',
        'app_language': 'ஆப் மொழி',
        'voice_speed': 'குரல் வேகம்',
        'voice_gender': 'குரல் பாலினம்',
        'autoplay_responses': 'தானாக-விளையாட்டு பதிலிகள்',
        'notifications': 'அறிவிப்புகள்',
        'health_reminders': 'சுகாதார நினைவூட்டல்கள்',
        'appearance': 'தோற்றம்',
        'text_size': 'உரை அளவு',
        'dark_mode': 'இருண்ட பயன்முறை',
        'data_storage': 'தரவு & சேமிப்பு',
        'offline_mode': 'ஆஃப்லைன் பயன்முறை',
        'app_is_online': 'ஆப் ஆன்லைனில் உள்ளது',
        'app_is_offline': 'ஆப் ஆஃப்லைனில் இயங்கிறது',
        'storage_used': 'பயன்படுத்தப்பட்ட சேமிப்பு',
        'clear_cache': 'கேச் அழி',
        'privacy_security': 'தனியுரிமை & பாதுகாப்பு',
        'data_encryption': 'தரவு குறியாக்கம்',
        'backup_data': 'தரவு பிரதி',
        'enabled': 'செயல்படுத்தப்பட்டது',
        'about': 'பற்றி',
        'app_version': 'ஆப் பதிப்பு',
        'privacy_policy': 'தனியுரிமை கொள்கை',
        'terms_of_service': 'சேவையின் நிபந்தனைகள்',
        'select_language': 'மொழியைத் தேர்ந்தெடுக்க',
        'clear_all_data': 'அனைத்து தரவை அழிக்க வேண்டுமா?',
        'clear_data_warning': 'இது உங்கள் அனைத்து உள்ளூர் தரவை அகற்றும். இந்த செயல் செய்ய முடியாது.',
        'clear_data': 'தரவு அழி',
        'female': 'பெண்ணுக்கு',
        'male': 'ஆண்',
        'slow': 'மெதுவாக',
        'fast': 'வேகமாக',
        'select_language_header': 'மொழியைத் தேர்ந்தெடுக்க',
        
        // Chat screen - Tamil
        'kendall': 'கெண்டல்',
        'online': 'ஆன்லைன்',
        'offline_mode_label': 'ஆஃப்லைன் பயன்முறை',
        'disable_audio': 'ஆடியோ முடக்க',
        'enable_audio': 'ஆடியோ செயல்படுத்த',
        'emergency_detected': 'அவசரம் கண்டறியப்பட்டது! அவசர சேவைகளுக்கு திருப்பிவிடப்படுகிறது...',
        
        // Additional screens - Tamil
        'health_education': 'சுகாதார கல்வி',
        'all_topics': 'அனைத்து தலைப்புகளும்',
        'key_points': 'முக்கிய புள்ளிகள்',
        'no_topics_found': 'எந்த தலைப்புகளும் கண்டுபிடிக்கப்படவில்லை',
        'search_health_topics': 'சுகாதார தலைப்புகளைத் தேடுங்கள்...',
        'allergies': 'ஒவ்வாமை',
        'add_allergy': 'ஒவ்வாமை சேர்க்கவும்',
        'select_allergy': 'ஒவ்வாமை தேர்ந்தெடுக்கவும்...',
        'vaccination_tracker': 'தடுப்பூசி ট்র்যাக்கர்',
        'medication_manager': 'மருந்து மேலாண்மை',
        'diet_nutrition': 'உணவு & ஊட்டச்சத்து',
        'symptom_checker': 'அறிகுறி சோதனையாளர்',
        'profile': 'சுயவிவரம்',
        'your_healthcare_companion': 'உங்கள் சுகாதார உடன்பயனி',
        'voice_enabled': 'குரல் இயக்கப்பட்டது',
        'multi_language': 'பல மொழி',
        'offline_ready': 'ஆஃப்லைனுக்கு தயாரிக்கப்பட்டது',
        
        // Login/Signup screens
        'welcome_to': 'விடாவாய்சுக்கு வரவேற்கிறோம்',
        'login_title': 'மீண்டும் வரவேற்கிறோம்',
        'login_subtitle': 'உங்கள் சுகாதார பதிவுகளை அணுக உள்நுழையவும்',
        'email': 'மின்னஞ்சல்',
        'enter_email': 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
        'password': 'கடவுச்சொல்',
        'enter_password': 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
        'forgot_password': 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
        'login': 'உள்நுழைய',
        'login_failed': 'உள்நுழைய தோல்வியடைந்தது',
        'login_biometrics': 'உயிர்சேன்சாரியுடன் உள்நுழையவும்',
        'demo_mode': 'டெமோ பயன்முறை (உள்நுழைவை தவிர்க்கவும்)',
        'new_user': 'புதிய பயனாளர்?',
        'signup': 'பதிவுசெய்',
        'secure_encrypted': 'உங்கள் தரவு பாதுகாப்பாக குறியாக்கப்பட்டுள்ளது',
        'create_account': 'கணக்கை உருவாக்கவும்',
        'full_name': 'முழு பெயர்',
        'confirm_password': 'கடவுச்சொல்லை உறுதிசெய்க',
        'terms_agree': 'நான் சேவையின் நிபந்தனைகளுக்கு ஒப்புக்கொள்கிறேன்',
        'already_have_account': 'ஏற்கனவே கணக்கு உள்ளதா?',
        
        // Appointments
        'doctor_appointments': 'மருத்துவர் அப்பாயிண்ட்மென்ட்கள்',
        'book_appointment': 'அப்பாயிண்ட்மென்ட் பதிவு செய்க',
        'upcoming_appointments': 'வரவிருக்கும் அப்பாயிண்ட்மென்ட்கள்',
        'select_doctor': 'மருத்துவரைத் தேர்ந்தெடுக்கவும்',
        'select_date': 'தேதியைத் தேர்ந்தெடுக்கவும்',
        'available_slots': 'கிடைக்கும் பெட்டியங்கள்',
        'select_time': 'நேரத்தைத் தேர்ந்தெடுக்கவும்',
        'book_new_appointment': 'புதிய அப்பாயிண்ட்மென்ட் பதிவு செய்க',
        'cancel_appointment': 'ரத்து செய்க',
        'no_slots_available': 'இந்த தேதிக்கு ஸ்லாட் கிடைக்கவில்லை',
        'confirm_booking': 'பதிவுசெய்வதை உறுதிசெய்க',
        'appointment_confirmed': 'அப்பாயிண்ட்மென்ட் உறுதிசெய்யப்பட்டது!',
        'no_appointments': 'அப்பாயிண்ட்மென்ட்கள் திட்டமிடப்படவில்லை',
        'done': 'செய்யப்பட்டது',
        
        // Other screens
        'add': 'சேர்க்க',
        'edit': 'திருத்த',
        'delete': 'நீக்க',
        'save': 'சேமிக்க',
        'close': 'மூடு',
        'next': 'அடுத்த',
        'previous': 'முந்தைய',
        'confirm': 'உறுதிசெய்',
        'no_data': 'தரவு கிடைக்கவில்லை',
        'loading': 'ஏற்றுகிறது...',

    },
    te: {
        'greeting': 'నమస్కారం! నేను విటావాయిస్, మీ ఆరోగ్య సహాయకుడిని.',
        'how_can_help': 'ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?',
        'welcome_back': 'తిరిగి స్వాగతం!',
        'main_problem': 'ముఖ్య సమస్య ఏమిటి?',
        'when_started': 'ఇది ఎప్పుడు ప్రారంభమైంది?',
        'severity_question': '1-10 స్కేల్‌లో ఎంత తీవ్రంగా ఉంది?',
        'any_fever': 'జ్వరం ఉందా?',
        'any_pain': 'నొప్పి అనుభవిస్తున్నారా?',
        'breathing_ok': 'శ్వాస సాధారణంగా ఉందా?',
        'fever': 'జ్వరం',
        'headache': 'తలనొప్పి',
        'cough': 'దగ్గు',
        'cold': 'జలుబు',
        'body_ache': 'శరీర నొప్పి',
        'stomach_pain': 'కడుపు నొప్పి',
        'diarrhea': 'విరేచనాలు',
        'vomiting': 'వాంతులు',
        'weakness': 'బలహీనత',
        'dizziness': 'తల తిరగడం',
        'rest_advice': 'దయచేసి తగినంత విశ్రాంతి తీసుకోండి',
        'hydration': 'చాలా నీరు త్రాగండి',
        'see_doctor': 'దయచేసి వైద్యుడిని సంప్రదించండి',
        'emergency_call': 'ఇది అత్యవసరం. వెంటనే 108కి కాల్ చేయండి',
        'speak_now': 'ఇప్పుడు మాట్లాడండి...',
        'listening': 'వింటోంది...',
        'processing': 'ప్రాసెస్ చేస్తోంది...',
        'send': 'పంపు',
        'cancel': 'రద్దు',
        'continue': 'కొనసాగించు',
        'back': 'వెనుకకు',
    },
    hi: {
        'greeting': 'नमस्ते! मैं विटावॉइस हूं, आपका स्वास्थ्य सहायक।',
        'how_can_help': 'आज मैं आपकी कैसे मदद कर सकता हूं?',
        'welcome_back': 'वापसी पर स्वागत है!',
        'main_problem': 'मुख्य समस्या क्या है?',
        'when_started': 'यह कब शुरू हुआ?',
        'severity_question': '1-10 के पैमाने पर यह कितना गंभीर है?',
        'any_fever': 'क्या बुखार है?',
        'any_pain': 'क्या दर्द हो रहा है?',
        'breathing_ok': 'क्या सांस लेना सामान्य है?',
        'fever': 'बुखार',
        'headache': 'सिरदर्द',
        'cough': 'खांसी',
        'cold': 'सर्दी',
        'body_ache': 'शरीर दर्द',
        'stomach_pain': 'पेट दर्द',
        'diarrhea': 'दस्त',
        'vomiting': 'उल्टी',
        'weakness': 'कमजोरी',
        'dizziness': 'चक्कर आना',
        'rest_advice': 'कृपया पर्याप्त आराम करें',
        'hydration': 'खूब पानी पिएं',
        'see_doctor': 'कृपया डॉक्टर से परामर्श करें',
        'emergency_call': 'यह आपातकाल है। तुरंत 108 पर कॉल करें',
        'speak_now': 'अब बोलें...',
        'listening': 'सुन रहा है...',
        'processing': 'प्रोसेस कर रहा है...',
        'send': 'भेजें',
        'cancel': 'रद्द करें',
        'continue': 'जारी रखें',
        'back': 'पीछे',
    },
    bn: {
        'greeting': 'নমস্কার! আমি ভিটাভয়েস, আপনার স্বাস্থ্য সহায়ক।',
        'how_can_help': 'আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?',
        'welcome_back': 'আবার স্বাগতম!',
        'main_problem': 'মূল সমস্যা কী?',
        'when_started': 'এটি কখন শুরু হয়েছিল?',
        'severity_question': '১-১০ স্কেলে এটি কতটা গুরুতর?',
        'any_fever': 'জ্বর আছে কি?',
        'any_pain': 'ব্যথা অনুভব করছেন?',
        'breathing_ok': 'শ্বাস-প্রশ্বাস কি স্বাভাবিক?',
        'fever': 'জ্বর',
        'headache': 'মাথাব্যথা',
        'cough': 'কাশি',
        'cold': 'সর্দি',
        'body_ache': 'শরীর ব্যথা',
        'stomach_pain': 'পেট ব্যথা',
        'diarrhea': 'ডায়রিয়া',
        'vomiting': 'বমি',
        'weakness': 'দুর্বলতা',
        'dizziness': 'মাথা ঘোরা',
        'rest_advice': 'দয়া করে পর্যাপ্ত বিশ্রাম নিন',
        'hydration': 'প্রচুর পানি পান করুন',
        'see_doctor': 'দয়া করে ডাক্তারের পরামর্শ নিন',
        'emergency_call': 'এটি জরুরি। অবিলম্বে ১০৮ এ কল করুন',
        'speak_now': 'এখন বলুন...',
        'listening': 'শুনছি...',
        'processing': 'প্রক্রিয়াকরণ...',
        'send': 'পাঠান',
        'cancel': 'বাতিল',
        'continue': 'চালিয়ে যান',
        'back': 'পিছনে',
    },
    kn: {
        'greeting': 'ನಮಸ್ಕಾರ! ನಾನು ವಿಟಾವಾಯ್ಸ್, ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಹಾಯಕ.',
        'how_can_help': 'ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
        'welcome_back': 'ಮತ್ತೆ ಸ್ವಾಗತ!',
        'main_problem': 'ಮುಖ್ಯ ಸಮಸ್ಯೆ ಏನು?',
        'when_started': 'ಇದು ಯಾವಾಗ ಪ್ರಾರಂಭವಾಯಿತು?',
        'severity_question': '1-10 ಮಾಪಕದಲ್ಲಿ ಇದು ಎಷ್ಟು ತೀವ್ರವಾಗಿದೆ?',
        'any_fever': 'ಜ್ವರ ಇದೆಯೇ?',
        'any_pain': 'ನೋವು ಅನುಭವಿಸುತ್ತಿದ್ದೀರಾ?',
        'breathing_ok': 'ಉಸಿರಾಟ ಸಾಮಾನ್ಯವಾಗಿದೆಯೇ?',
        'fever': 'ಜ್ವರ',
        'headache': 'ತಲೆನೋವು',
        'cough': 'ಕೆಮ್ಮು',
        'cold': 'ಶೀತ',
        'body_ache': 'ದೇಹ ನೋವು',
        'stomach_pain': 'ಹೊಟ್ಟೆ ನೋವು',
        'diarrhea': 'ಅತಿಸಾರ',
        'vomiting': 'ವಾಂತಿ',
        'weakness': 'ದೌರ್ಬಲ್ಯ',
        'dizziness': 'ತಲೆತಿರುಗುವಿಕೆ',
        'rest_advice': 'ದಯವಿಟ್ಟು ಸಾಕಷ್ಟು ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ',
        'hydration': 'ಸಾಕಷ್ಟು ನೀರು ಕುಡಿಯಿರಿ',
        'see_doctor': 'ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ',
        'emergency_call': 'ಇದು ತುರ್ತು. ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ',
        'speak_now': 'ಈಗ ಮಾತನಾಡಿ...',
        'listening': 'ಕೇಳುತ್ತಿದೆ...',
        'processing': 'ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತಿದೆ...',
        'send': 'ಕಳುಹಿಸಿ',
        'cancel': 'ರದ್ದುಮಾಡಿ',
        'continue': 'ಮುಂದುವರಿಸಿ',
        'back': 'ಹಿಂದೆ',
    },
    ml: {
        'greeting': 'നമസ്കാരം! ഞാൻ വിറ്റാവോയ്സ്, നിങ്ങളുടെ ആരോഗ്യ സഹായി.',
        'how_can_help': 'ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?',
        'welcome_back': 'തിരികെ സ്വാഗതം!',
        'main_problem': 'പ്രധാന പ്രശ്നം എന്താണ്?',
        'when_started': 'ഇത് എപ്പോൾ ആരംഭിച്ചു?',
        'severity_question': '1-10 സ്കെയിലിൽ ഇത് എത്ര ഗുരുതരമാണ്?',
        'any_fever': 'പനി ഉണ്ടോ?',
        'any_pain': 'വേദന അനുഭവപ്പെടുന്നുണ്ടോ?',
        'breathing_ok': 'ശ്വാസോച്ഛ്വാസം സാധാരണമാണോ?',
        'fever': 'പനി',
        'headache': 'തലവേദന',
        'cough': 'ചുമ',
        'cold': 'ജലദോഷം',
        'body_ache': 'ശരീരവേദന',
        'stomach_pain': 'വയറുവേദന',
        'diarrhea': 'വയറിളക്കം',
        'vomiting': 'ഛർദ്ദി',
        'weakness': 'ബലഹീനത',
        'dizziness': 'തലകറക്കം',
        'rest_advice': 'ദയവായി മതിയായ വിശ്രമം എടുക്കുക',
        'hydration': 'ധാരാളം വെള്ളം കുടിക്കുക',
        'see_doctor': 'ദയവായി ഡോക്ടറെ സമീപിക്കുക',
        'emergency_call': 'ഇത് അടിയന്തരമാണ്. ഉടൻ 108 ലേക്ക് വിളിക്കുക',
        'speak_now': 'ഇപ്പോൾ സംസാരിക്കുക...',
        'listening': 'കേൾക്കുന്നു...',
        'processing': 'പ്രോസസ്സ് ചെയ്യുന്നു...',
        'send': 'അയയ്ക്കുക',
        'cancel': 'റദ്ദാക്കുക',
        'continue': 'തുടരുക',
        'back': 'പിന്നോട്ട്',
    },
};

class LanguageService {
    private currentLanguage: LanguageCode = 'en';

    /**
     * Detect language from text input
     */
    detectLanguage(text: string): LanguageCode {
        // Simple detection based on Unicode ranges
        const tamilRange = /[\u0B80-\u0BFF]/;
        const teluguRange = /[\u0C00-\u0C7F]/;
        const hindiRange = /[\u0900-\u097F]/;
        const bengaliRange = /[\u0980-\u09FF]/;
        const kannadaRange = /[\u0C80-\u0CFF]/;
        const malayalamRange = /[\u0D00-\u0D7F]/;

        if (tamilRange.test(text)) return 'ta';
        if (teluguRange.test(text)) return 'te';
        if (hindiRange.test(text)) return 'hi';
        if (bengaliRange.test(text)) return 'bn';
        if (kannadaRange.test(text)) return 'kn';
        if (malayalamRange.test(text)) return 'ml';

        return 'en';
    }

    /**
     * Set current language
     */
    setLanguage(lang: LanguageCode): void {
        this.currentLanguage = lang;
        localStorage.setItem('vitavoice_language', lang);
    }

    /**
     * Get current language
     */
    getLanguage(): LanguageCode {
        const saved = localStorage.getItem('vitavoice_language') as LanguageCode;
        if (saved && saved in SUPPORTED_LANGUAGES) {
            this.currentLanguage = saved;
        }
        return this.currentLanguage;
    }

    /**
     * Translate a key to current language
     */
    translate(key: string, lang?: LanguageCode): string {
        const targetLang = lang || this.currentLanguage;
        return translations[targetLang]?.[key] || translations.en[key] || key;
    }

    /**
     * Get all translations for current language
     */
    getAllTranslations(lang?: LanguageCode): Record<string, string> {
        const targetLang = lang || this.currentLanguage;
        return translations[targetLang] || translations.en;
    }

    /**
     * Get language info
     */
    getLanguageInfo(lang?: LanguageCode) {
        const targetLang = lang || this.currentLanguage;
        return SUPPORTED_LANGUAGES[targetLang];
    }

    /**
     * Get all supported languages
     */
    getSupportedLanguages() {
        return Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
            code: code as LanguageCode,
            name: info.name,
            nativeName: info.nativeName,
        }));
    }

    /**
     * Check if text contains emergency keywords
     */
    containsEmergencyKeywords(text: string, lang?: LanguageCode): boolean {
        const targetLang = lang || this.detectLanguage(text);
        const keywords = EMERGENCY_KEYWORDS[targetLang] || [];
        const lowerText = text.toLowerCase();

        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }
}

export const languageService = new LanguageService();
export type { LanguageCode };
