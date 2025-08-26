-- Sample data for the Waterlily survey intake system
-- Run this in your Supabase SQL editor after creating the schema

-- Insert a comprehensive long-term care intake survey
INSERT INTO surveys (slug, title, description) VALUES 
('intake-2024', 'Long-Term Care Intake Assessment 2024', 'This comprehensive assessment helps us understand your demographic, health, financial, and care needs to provide personalized long-term care recommendations and cost estimates.');

-- Get the survey ID for questions
DO $$
DECLARE
    survey_id uuid;
BEGIN
    SELECT id INTO survey_id FROM surveys WHERE slug = 'intake-2024';
    
    -- Insert comprehensive questions for long-term care assessment
    INSERT INTO questions (survey_id, ui_order, question_text, help_text, input_type, options, required) VALUES
    
    -- Personal Information Section
    (survey_id, 1, 'What is your full legal name?', 'Please enter your name exactly as it appears on official documents (driver''s license, passport, etc.)', 'text', NULL, true),
    
    (survey_id, 2, 'What is your date of birth?', 'This helps us calculate your age and determine eligibility for age-specific programs and benefits', 'date', NULL, true),
    
    (survey_id, 3, 'What is your gender?', 'This information helps us provide personalized care recommendations and connect you with appropriate resources', 'radio', 
     '[{"label":"Male","value":"male"},{"label":"Female","value":"female"},{"label":"Non-binary","value":"non-binary"},{"label":"Prefer not to say","value":"prefer-not-to-say"}]', 
     true),
    
    (survey_id, 4, 'What is your current marital status?', 'This helps us understand your support network and financial situation for care planning', 'select', 
     '[{"label":"Single (never married)","value":"single"},{"label":"Married","value":"married"},{"label":"Divorced","value":"divorced"},{"label":"Widowed","value":"widowed"},{"label":"Separated","value":"separated"},{"label":"Domestic Partnership","value":"domestic-partnership"}]', 
     true),
    
    (survey_id, 5, 'What is your current living situation?', 'This helps us understand your housing needs and potential modifications required', 'select', 
     '[{"label":"Single-family home","value":"single-family"},{"label":"Apartment/Condo","value":"apartment"},{"label":"Townhouse","value":"townhouse"},{"label":"Assisted living facility","value":"assisted-living"},{"label":"Nursing home","value":"nursing-home"},{"label":"Living with family","value":"with-family"},{"label":"Independent living community","value":"independent-living"},{"label":"Other","value":"other"}]', 
     true),
    
    -- Contact Information
    (survey_id, 6, 'What is your primary phone number?', 'We will use this to contact you about your assessment and care recommendations', 'text', NULL, true),
    
    (survey_id, 7, 'What is your email address?', 'We will send you a copy of your assessment and care plan via email', 'text', NULL, true),
    
    (survey_id, 8, 'What is your current address?', 'Please provide your complete residential address for care planning purposes', 'text', NULL, true),
    
    -- Financial Information
    (survey_id, 9, 'What is your annual household income?', 'This helps us determine eligibility for financial assistance programs and recommend appropriate care options', 'select', 
     '[{"label":"Under $25,000","value":"under-25k"},{"label":"$25,000 - $50,000","value":"25k-50k"},{"label":"$50,000 - $75,000","value":"50k-75k"},{"label":"$75,000 - $100,000","value":"75k-100k"},{"label":"$100,000 - $150,000","value":"100k-150k"},{"label":"Over $150,000","value":"over-150k"},{"label":"Prefer not to say","value":"prefer-not-to-say"}]', 
     true),
    
    (survey_id, 10, 'Do you have long-term care insurance?', 'This helps us understand your financial preparedness for care costs', 'radio', 
     '[{"label":"Yes, I have a policy","value":"yes"},{"label":"No, I don''t have coverage","value":"no"},{"label":"I''m not sure","value":"unsure"},{"label":"I''m in the process of getting coverage","value":"in-process"}]', 
     true),
    
    (survey_id, 11, 'What is the approximate value of your assets (excluding your home)?', 'This includes savings, investments, retirement accounts, and other liquid assets', 'select', 
     '[{"label":"Under $50,000","value":"under-50k"},{"label":"$50,000 - $100,000","value":"50k-100k"},{"label":"$100,000 - $250,000","value":"100k-250k"},{"label":"$250,000 - $500,000","value":"250k-500k"},{"label":"Over $500,000","value":"over-500k"},{"label":"Prefer not to say","value":"prefer-not-to-say"}]', 
     false),
    
    (survey_id, 12, 'Do you own your home?', 'Home ownership can affect eligibility for certain programs and care options', 'radio', 
     '[{"label":"Yes, I own my home","value":"own"},{"label":"No, I rent","value":"rent"},{"label":"I live with family","value":"with-family"},{"label":"Other arrangement","value":"other"}]', 
     true),
    
    -- Health Information
    (survey_id, 13, 'How would you rate your current overall health status?', 'Please be honest about your general health condition', 'radio', 
     '[{"label":"Excellent","value":"excellent"},{"label":"Good","value":"good"},{"label":"Fair","value":"fair"},{"label":"Poor","value":"poor"},{"label":"Very Poor","value":"very-poor"}]', 
     true),
    
    (survey_id, 14, 'Do you have any of the following health conditions?', 'Select all that apply. This helps us understand your care needs and recommend appropriate services', 'checkbox', 
     '[{"label":"Alzheimer''s Disease or Dementia","value":"alzheimers"},{"label":"Arthritis","value":"arthritis"},{"label":"Cancer","value":"cancer"},{"label":"Chronic Obstructive Pulmonary Disease (COPD)","value":"copd"},{"label":"Diabetes","value":"diabetes"},{"label":"Heart Disease","value":"heart-disease"},{"label":"High Blood Pressure","value":"hypertension"},{"label":"Multiple Sclerosis","value":"ms"},{"label":"Parkinson''s Disease","value":"parkinsons"},{"label":"Stroke","value":"stroke"},{"label":"Vision Problems","value":"vision"},{"label":"Hearing Problems","value":"hearing"},{"label":"Mental Health Conditions","value":"mental-health"},{"label":"None of the above","value":"none"}]', 
     false),
    
    (survey_id, 15, 'Do you currently take any prescription medications?', 'This helps us understand your medication management needs', 'radio', 
     '[{"label":"Yes, multiple medications","value":"multiple"},{"label":"Yes, 1-3 medications","value":"few"},{"label":"No, I don''t take any","value":"none"},{"label":"I''m not sure","value":"unsure"}]', 
     true),
    
    (survey_id, 16, 'Do you have any mobility limitations?', 'This helps us assess your mobility needs and recommend appropriate care services', 'checkbox', 
     '[{"label":"Difficulty walking","value":"walking"},{"label":"Uses a cane","value":"cane"},{"label":"Uses a walker","value":"walker"},{"label":"Uses a wheelchair","value":"wheelchair"},{"label":"Difficulty with stairs","value":"stairs"},{"label":"Balance problems","value":"balance"},{"label":"No mobility limitations","value":"none"}]', 
     false),
    
    -- Activities of Daily Living (ADLs)
    (survey_id, 17, 'Do you need assistance with any of the following activities?', 'Select all activities where you currently need help', 'checkbox', 
     '[{"label":"Bathing or showering","value":"bathing"},{"label":"Dressing","value":"dressing"},{"label":"Eating","value":"eating"},{"label":"Using the toilet","value":"toileting"},{"label":"Getting in and out of bed","value":"transferring"},{"label":"Walking or moving around","value":"ambulating"},{"label":"I don''t need help with any of these","value":"none"}]', 
     false),
    
    (survey_id, 18, 'Do you need assistance with any of the following instrumental activities?', 'Select all activities where you currently need help', 'checkbox', 
     '[{"label":"Managing medications","value":"medications"},{"label":"Managing finances","value":"finances"},{"label":"Shopping for groceries","value":"shopping"},{"label":"Preparing meals","value":"cooking"},{"label":"Housekeeping","value":"housekeeping"},{"label":"Laundry","value":"laundry"},{"label":"Transportation","value":"transportation"},{"label":"I don''t need help with any of these","value":"none"}]', 
     false),
    
    -- Current Care Situation
    (survey_id, 19, 'Do you currently receive any formal care services?', 'This includes services from professional caregivers, agencies, or facilities', 'checkbox', 
     '[{"label":"Home health aide","value":"home-health"},{"label":"Personal care assistant","value":"personal-care"},{"label":"Skilled nursing care","value":"skilled-nursing"},{"label":"Physical therapy","value":"physical-therapy"},{"label":"Occupational therapy","value":"occupational-therapy"},{"label":"Speech therapy","value":"speech-therapy"},{"label":"Meal delivery services","value":"meal-delivery"},{"label":"Transportation services","value":"transportation"},{"label":"No formal services","value":"none"}]', 
     false),
    
    (survey_id, 20, 'How many hours of care do you currently receive per week?', 'Include both formal and informal care from family or friends', 'number', NULL, false),
    
    (survey_id, 21, 'Who currently provides most of your care?', 'This helps us understand your current support network', 'select', 
     '[{"label":"I care for myself independently","value":"self"},{"label":"Spouse or partner","value":"spouse"},{"label":"Adult child","value":"adult-child"},{"label":"Other family member","value":"family"},{"label":"Friend or neighbor","value":"friend"},{"label":"Professional caregiver","value":"professional"},{"label":"Multiple people","value":"multiple"},{"label":"No one currently","value":"none"}]', 
     true),
    
    -- Care Preferences
    (survey_id, 22, 'What type of care setting would you prefer?', 'This helps us recommend appropriate care options', 'select', 
     '[{"label":"Stay in my own home with support","value":"home"},{"label":"Move to an assisted living facility","value":"assisted-living"},{"label":"Move to a nursing home","value":"nursing-home"},{"label":"Move in with family","value":"with-family"},{"label":"Independent living community","value":"independent-living"},{"label":"I''m not sure","value":"unsure"}]', 
     true),
    
    (survey_id, 23, 'What are your primary concerns about long-term care?', 'Select all that apply', 'checkbox', 
     '[{"label":"Cost of care","value":"cost"},{"label":"Quality of care","value":"quality"},{"label":"Losing independence","value":"independence"},{"label":"Being a burden on family","value":"burden"},{"label":"Not being able to stay in my home","value":"home"},{"label":"Loneliness or isolation","value":"loneliness"},{"label":"Safety concerns","value":"safety"},{"label":"Other","value":"other"}]', 
     false),
    
    (survey_id, 24, 'When do you anticipate needing long-term care services?', 'This helps us plan for your future care needs', 'select', 
     '[{"label":"I need services now","value":"now"},{"label":"Within the next 6 months","value":"6-months"},{"label":"Within the next year","value":"1-year"},{"label":"Within the next 2-5 years","value":"2-5-years"},{"label":"More than 5 years from now","value":"5-plus-years"},{"label":"I''m not sure","value":"unsure"}]', 
     true),
    
    -- Emergency Contact
    (survey_id, 25, 'Who should we contact in case of an emergency?', 'Please provide the name and relationship of your emergency contact', 'text', NULL, true),
    
    (survey_id, 26, 'What is your emergency contact''s phone number?', 'We will only use this in emergency situations', 'text', NULL, true),
    
    -- Additional Information
    (survey_id, 27, 'Is there anything else you would like us to know about your situation?', 'Please share any additional information that might be relevant to your care planning', 'text', NULL, false);
END $$;
