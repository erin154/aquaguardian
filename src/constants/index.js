export const ACTIVITIES = [
  { id: 'shower',     label: 'Shower',     icon: '🚿', avgGallons: 17,  goalGallons: 14 },
  { id: 'dishes',     label: 'Dishes',     icon: '🍽️', avgGallons: 6,   goalGallons: 4  },
  { id: 'sprinklers', label: 'Sprinklers', icon: '🌿', avgGallons: 60,  goalGallons: 40 },
  { id: 'laundry',    label: 'Laundry',    icon: '👕', avgGallons: 19,  goalGallons: 15 },
  { id: 'sink',       label: 'Sink',       icon: '🚰', avgGallons: 2,   goalGallons: 1  },
  { id: 'carwash',    label: 'Car Wash',   icon: '🚗', avgGallons: 40,  goalGallons: 25 },
]

export const SPIRIT_STAGES = [
  { min: 85, name: 'Ocean',   emoji: '🌊', label: 'legendary',  color: '#0C447C', bg: '#E6F1FB', border: '#378ADD' },
  { min: 70, name: 'Lake',    emoji: '💫', label: 'majestic',   color: '#0F6E56', bg: '#E1F5EE', border: '#1D9E75' },
  { min: 50, name: 'River',   emoji: '✨', label: 'thriving',   color: '#1D9E75', bg: '#E1F5EE', border: '#5DCAA5' },
  { min: 30, name: 'Creek',   emoji: '💧', label: 'healthy',    color: '#185FA5', bg: '#E6F1FB', border: '#85B7EB' },
  { min: 15, name: 'Droplet', emoji: '😟', label: 'stressed',   color: '#BA7517', bg: '#FAEEDA', border: '#EF9F27' },
  { min: 0,  name: 'Droplet', emoji: '🥺', label: 'suffering',  color: '#993C1D', bg: '#FAECE7', border: '#D85A30' },
]

export const RECOVERY_CHALLENGES = [
  { text: 'Take a shower under 5 minutes', reward: 15 },
  { text: 'Skip one dishwasher cycle — hand wash instead', reward: 12 },
  { text: 'Turn off the tap while brushing teeth', reward: 10 },
  { text: 'Water plants with leftover drinking water', reward: 10 },
  { text: 'Run the washing machine only when fully loaded', reward: 12 },
  { text: 'Fix a dripping tap in your home today', reward: 20 },
]

export const INSIGHT_CARDS = [
  (data) => ({ icon: '🛁', text: `Today you've used the equivalent of ${(data.todayTotal / 50).toFixed(1)} bathtubs of water.`, color: '#185FA5', bg: '#E6F1FB' }),
  (data) => ({ icon: '📊', text: `The average household uses 80–100 gallons per person per day. Your household logged ${data.todayTotal.toFixed(0)} gal today.`, color: '#0F6E56', bg: '#E1F5EE' }),
  (data) => ({ icon: '💰', text: `At your current pace, your estimated monthly water cost is $${(data.todayTotal * 30 * data.rate).toFixed(2)}.`, color: '#854F0B', bg: '#FAEEDA' }),
  (data) => ({ icon: '🌍', text: `Every 10 gallons saved is roughly one person's daily drinking water. You've logged ${data.todayTotal.toFixed(0)} gal today.`, color: '#3B6D11', bg: '#EAF3DE' }),
  (data) => ({ icon: '🔥', text: data.streak > 0 ? `${data.streak}-day streak! Your spirit gains strength every day you meet your goal.` : 'Start a streak today — meet your daily goal and your spirit begins to grow.', color: '#993C1D', bg: '#FAECE7' }),
]