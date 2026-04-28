export const strokeAssessmentData = [
  {
    id: 1,
    riskModifier: 'Neurological Status',
    required: false,
    riskExtra: {
      type: 'mrs',
      label: 'mRS',
      required: true,
      options: ['0', '1', '2', '3', '4', '5'],
    },
    currentStatus: {
      type: 'radio',
      options: ['Stable', 'Improved', 'Deteriorated'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Stroke Extension', 'New event', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: ['Repeat Imaging', 'Re-admission'],
    },
  },

  {
    id: 2,
    riskModifier: 'Echocardiography',
    currentStatus: {
      type: 'radio',
      options: ['Normal', 'Unavailable/Not done', 'Sub-Optimal'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Not performed', 'Report not available yet', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Arrange Echocardiography',
        'Chase Echocardiography report',
        'Cardiology input',
      ],
    },
  },

  {
    id: 3,
    riskModifier: 'Carotids',
    currentStatus: {
      type: 'radio',
      options: [
        'No significant stenosis',
        'Significant stenosis present',
        'Not needed / NA',
      ],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Not performed', 'Report not available yet', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Arrange Carotid Doppler / CTCA / MRA Neck',
        'Chase Doppler / CTCA / MRA report',
        'Vascular surgery referral',
      ],
    },
  },

  {
    id: 4,
    riskModifier: 'Seizures',
    currentStatus: {
      type: 'radio',
      options: ['None', 'Controlled', 'Suboptimal Control (Active seizures)'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: [
        'None',
        'Cost',
        'Awareness',
        'Non-adherence',
        'Medication side effects',
        'Other',
      ],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Seizure Counselling',
        'Start / Escalate AEDs',
        'Consider economical options',
        'Possible consequences of medication non-adherence explained',
      ],
    },
  },

  {
    id: 5,
    riskModifier: 'Spasticity',
    currentStatus: {
      type: 'radio',
      options: ['None', 'Spastic limb(s)'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Cost', 'Awareness', 'Access / Logistics issues', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Physical therapy referral',
        'Oral anti-spasticity medications',
        'Counselling regarding botulinum toxin',
      ],
    },
  },

  {
    id: 6,
    riskModifier: 'DVT',
    currentStatus: {
      type: 'radio',
      options: ['None', 'Concern for DVT Present'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: [
        'None',
        'Bleeding risk of anticoagulants',
        'Awareness',
        'Access / Logistics',
        'Other',
      ],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Counselling regarding DVT prophylaxis/treatment',
        'Arrange venous doppler',
      ],
    },
  },

  {
    id: 7,
    riskModifier: 'Bed / Pressure Sores',
    currentStatus: {
      type: 'radio',
      options: ['None', 'Sores present / developing'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Awareness', 'Access / Logistics', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Counselling regarding pressure sores prevention and management (frequent posture change, air mattress)',
      ],
    },
  },

  {
    id: 8,
    riskModifier: 'Infections',
    currentStatus: {
      type: 'radio',
      options: ['None', 'Concern for infections (UTI / Aspiration etc.)'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Indwelling urinary catheter', 'Dysphagia', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Start / Adjust Antibiotics',
        'Counselling regarding catheter care / swallowing',
        'Referral to relevant specialty (medicine, ID, urology, Speech therapy)',
      ],
    },
  },

  {
    id: 9,
    riskModifier: 'Antiplatelets',
    required: true,
    currentStatus: {
      type: 'radio',
      options: [
        'Optimal',
        'Not indicated (e.g. while on anticoagulation)',
        'Suboptimal',
      ],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Cost', 'Side Effects', 'Forgetfulness', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Consider economical options',
        'Switch formulation if GI / other side-effects Reinforce daily medication schedule',
        'Pill organizer / phone alarm advised; caregiver educated',
        'Possible consequences of missing and suboptimal dose of antiplatelets explained',
      ],
    },
  },

  {
    id: 10,
    riskModifier: 'Anticoagulation',
    currentStatus: {
      type: 'radio',
      options: [
        'Not Indicated',
        'Not anticoagulated',
        'On DOAC',
        'On Warfarin',
        'Non-Adherent',
      ],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: [
        'None',
        'Cost',
        'Bleeding fear',
        'Forgetfulness',
        'INR access',
        'Other',
      ],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Consider economical options',
        'Possible consequences of missing and suboptimal dose of anticoagulation explained',
        'INR diary (warfarin); missed-dose protocol explained',
        'Cardiology co-management',
        'INR Clinic',
      ],
    },
  },

  {
    id: 11,
    riskModifier: 'Statins',
    required: true,
    currentStatus: {
      type: 'radio',
      options: ['On statin', 'Not on statin'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Cost', 'Side effects', 'Forgetfulness / Awareness', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Consider economical options',
        'Adjust to max tolerated dose',
        'Switch to Rosuvastatin if myalgia',
        'Consider adding Ezetimibe 10 mg if LDL still above target',
        'Possible consequences of missing / suboptimal dose of statins explained',
      ],
    },
  },

  {
    id: 12,
    riskModifier: 'Blood Pressure Control',
    required: true,
    currentStatus: {
      type: 'radio',
      options: ['BP at target', 'BP above target', 'BP below target'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: [
        'None',
        'Cost',
        'Medication over/under dosed',
        'Medication non-adherence',
        'Dietary sodium excess',
        'White-coat effect',
        'Other',
      ],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Adjust Antihypertensives',
        'Consider economical options for Anti-Hypertensives',
        'Home BP log reviewed; twice-daily diary reinforced',
        'DASH diet + sodium < 2.3 g/day',
        'Ambulatory/Home BP Monitoring if white-coat suspected',
        'Possible consequences of missing / suboptimal doses of BP medications explained',
      ],
    },
  },

  {
    id: 13,
    riskModifier: 'Glycaemic Control',
    required: true,
    currentStatus: {
      type: 'radio',
      options: ['Optimal', 'Sub-optimal'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Cost', 'Fear of hypoglycemia', 'Lack of awareness', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Anti-diabetic Medication adjustment',
        'Endocrinology input',
        'Reinforce medication + diet',
        'Hypoglycemia recognition explained',
        'Possible consequences of missing / suboptimal doses of OHG medications explained',
      ],
    },
  },

  {
    id: 14,
    riskModifier: 'Swallowing',
    currentStatus: {
      type: 'radio',
      options: [
        'No dysphagia, orally fed',
        'Texture-modified diet',
        'On NG',
        'On PEG',
      ],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: [
        'None',
        'Aspiration Pneumonia',
        'No Speech Therapist access',
        'Patient / Family Beliefs',
        'Other',
      ],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: [
        'Speech therapy referral',
        'Counselled regarding PEG tube placement',
      ],
    },
  },

  {
    id: 15,
    riskModifier: 'Nutrition and BMI',
    currentStatus: {
      type: 'radio',
      options: ['Optimal', 'Overweight / Obese'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Motivation', 'Dysphagia', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: ['Nutritionist referral', 'Speech therapy referral'],
    },
  },

  {
    id: 16,
    riskModifier: 'Physical Therapy',
    currentStatus: {
      type: 'radio',
      options: ['Completed / Not required', 'Active PT', 'Not started'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Cost', 'Transport / Access issues', 'Fatigue', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: ['Physical therapy referral'],
    },
  },

  {
    id: 17,
    riskModifier: 'Occupational Therapy',
    currentStatus: {
      type: 'radio',
      options: ['Completed / Not required', 'Active OT', 'Not started'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Cost', 'Transport / Access issues', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: ['Occupational therapy referral'],
    },
  },

  {
    id: 18,
    riskModifier: 'Exercise and Activity',
    currentStatus: {
      type: 'radio',
      options: ['Optimal', 'Suboptimal'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Access / Logistics', 'Motivation', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: ['Counselled to remain physically active'],
    },
  },

  {
    id: 19,
    riskModifier: 'Mood disturbance / Anxiety / Stress',
    currentStatus: {
      type: 'radio',
      options: ['None', 'Present'],
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Cost', 'Awareness', 'Stigma', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: ['Adjustment of SSRIs', 'Psychiatry referral'],
    },
  },

  {
    id: 20,
    riskModifier: 'Tobacco / Smoking / other addiction',
    currentStatus: {
      type: 'checkbox',
      options: ['No Addiction', 'Non Smoker', 'Ex- Smoker', 'Other illicit drug use'],
      otherInput: true,
      otherInputLabel: 'Other illicit drug use',
      smallOtherInput: true,
    },
    barrierIdentified: {
      type: 'checkbox',
      options: ['None', 'Withdrawal reaction', 'Motivation', 'Other'],
      otherInput: true,
    },
    planEducation: {
      type: 'checkbox',
      options: ['Consult to quit / hazard of smoking and other addiction explain'],
    },
  },
]