import { prisma } from '@medthread/database';
import { extractSymptoms, extractSeverity } from './symptomExtractor.service';
import { startOfDay, subDays, subWeeks } from 'date-fns';// Comprehensive pincode to location mapping for major Indian cities and regions
const PINCODE_TO_STATE: Record<string, { state: string; city: string; district: string }> = {
  // Tamil Nadu
  '600026': { state: 'Tamil Nadu', city: 'Chennai', district: 'Chennai' },
  '600094': { state: 'Tamil Nadu', city: 'Chennai', district: 'Chennai' },
  '600001': { state: 'Tamil Nadu', city: 'Chennai', district: 'Chennai' },
  '600028': { state: 'Tamil Nadu', city: 'Chennai', district: 'Chennai' },
  '641001': { state: 'Tamil Nadu', city: 'Coimbatore', district: 'Coimbatore' },
  '620001': { state: 'Tamil Nadu', city: 'Tiruchirappalli', district: 'Tiruchirappalli' },
  '625001': { state: 'Tamil Nadu', city: 'Madurai', district: 'Madurai' },
  
  // Delhi
  '110001': { state: 'Delhi', city: 'New Delhi', district: 'Central Delhi' },
  '110002': { state: 'Delhi', city: 'New Delhi', district: 'Central Delhi' },
  '110016': { state: 'Delhi', city: 'New Delhi', district: 'South Delhi' },
  '110025': { state: 'Delhi', city: 'New Delhi', district: 'East Delhi' },
  '110034': { state: 'Delhi', city: 'New Delhi', district: 'North Delhi' },
  
  // Maharashtra
  '400001': { state: 'Maharashtra', city: 'Mumbai', district: 'Mumbai City' },
  '400002': { state: 'Maharashtra', city: 'Mumbai', district: 'Mumbai City' },
  '400050': { state: 'Maharashtra', city: 'Mumbai', district: 'Mumbai Suburban' },
  '411001': { state: 'Maharashtra', city: 'Pune', district: 'Pune' },
  '411014': { state: 'Maharashtra', city: 'Pune', district: 'Pune' },
  '440001': { state: 'Maharashtra', city: 'Nagpur', district: 'Nagpur' },
  
  // Karnataka
  '560001': { state: 'Karnataka', city: 'Bangalore', district: 'Bangalore Urban' },
  '560002': { state: 'Karnataka', city: 'Bangalore', district: 'Bangalore Urban' },
  '560025': { state: 'Karnataka', city: 'Bangalore', district: 'Bangalore Urban' },
  '575001': { state: 'Karnataka', city: 'Mangalore', district: 'Dakshina Kannada' },
  '580001': { state: 'Karnataka', city: 'Hubli', district: 'Dharwad' },
  
  // West Bengal
  '700001': { state: 'West Bengal', city: 'Kolkata', district: 'Kolkata' },
  '700016': { state: 'West Bengal', city: 'Kolkata', district: 'Kolkata' },
  '700091': { state: 'West Bengal', city: 'Kolkata', district: 'North 24 Parganas' },
  
  // Telangana
  '500001': { state: 'Telangana', city: 'Hyderabad', district: 'Hyderabad' },
  '500003': { state: 'Telangana', city: 'Hyderabad', district: 'Hyderabad' },
  '500016': { state: 'Telangana', city: 'Hyderabad', district: 'Hyderabad' },
  
  // Gujarat
  '380001': { state: 'Gujarat', city: 'Ahmedabad', district: 'Ahmedabad' },
  '380015': { state: 'Gujarat', city: 'Ahmedabad', district: 'Ahmedabad' },
  '395001': { state: 'Gujarat', city: 'Surat', district: 'Surat' },
  
  // Rajasthan
  '302001': { state: 'Rajasthan', city: 'Jaipur', district: 'Jaipur' },
  '302006': { state: 'Rajasthan', city: 'Jaipur', district: 'Jaipur' },
  '342001': { state: 'Rajasthan', city: 'Jodhpur', district: 'Jodhpur' },
  
  // Uttar Pradesh
  '226001': { state: 'Uttar Pradesh', city: 'Lucknow', district: 'Lucknow' },
  '208001': { state: 'Uttar Pradesh', city: 'Kanpur', district: 'Kanpur Nagar' },
  '282001': { state: 'Uttar Pradesh', city: 'Agra', district: 'Agra' },
  '221001': { state: 'Uttar Pradesh', city: 'Varanasi', district: 'Varanasi' },
  
  // Punjab
  '160001': { state: 'Punjab', city: 'Chandigarh', district: 'Chandigarh' },
  '141001': { state: 'Punjab', city: 'Ludhiana', district: 'Ludhiana' },
  '143001': { state: 'Punjab', city: 'Amritsar', district: 'Amritsar' },
  
  // Haryana
  '122001': { state: 'Haryana', city: 'Gurgaon', district: 'Gurgaon' },
  '134001': { state: 'Haryana', city: 'Ambala', district: 'Ambala' },
  
  // Kerala
  '682001': { state: 'Kerala', city: 'Kochi', district: 'Ernakulam' },
  '695001': { state: 'Kerala', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram' },
  '673001': { state: 'Kerala', city: 'Kozhikode', district: 'Kozhikode' },
  
  // Andhra Pradesh
  '530001': { state: 'Andhra Pradesh', city: 'Visakhapatnam', district: 'Visakhapatnam' },
  '520001': { state: 'Andhra Pradesh', city: 'Vijayawada', district: 'Krishna' },
  
  // Odisha
  '751001': { state: 'Odisha', city: 'Bhubaneswar', district: 'Khordha' },
  
  // Madhya Pradesh
  '462001': { state: 'Madhya Pradesh', city: 'Bhopal', district: 'Bhopal' },
  '452001': { state: 'Madhya Pradesh', city: 'Indore', district: 'Indore' },
  
  // Chhattisgarh
  '492001': { state: 'Chhattisgarh', city: 'Raipur', district: 'Raipur' },
  
  // Jharkhand
  '834001': { state: 'Jharkhand', city: 'Ranchi', district: 'Ranchi' },
  
  // Bihar
  '800001': { state: 'Bihar', city: 'Patna', district: 'Patna' },
  
  // Assam
  '781001': { state: 'Assam', city: 'Guwahati', district: 'Kamrup Metropolitan' },
};

function getLocationFromPincode(pincode: string | null): { state: string; city: string; district: string } | null {
  if (!pincode) return null;
  
  // Try exact match first
  if (PINCODE_TO_STATE[pincode]) {
    return PINCODE_TO_STATE[pincode];
  }
  
  // Try partial match (first 3 digits for region)
  const region = pincode.substring(0, 3);
  const regionMap: Record<string, { state: string; city: string; district: string }> = {
    // Tamil Nadu (600-699)
    '600': { state: 'Tamil Nadu', city: 'Chennai', district: 'Chennai' },
    '620': { state: 'Tamil Nadu', city: 'Tiruchirappalli', district: 'Tiruchirappalli' },
    '625': { state: 'Tamil Nadu', city: 'Madurai', district: 'Madurai' },
    '641': { state: 'Tamil Nadu', city: 'Coimbatore', district: 'Coimbatore' },
    
    // Delhi (110-119)
    '110': { state: 'Delhi', city: 'New Delhi', district: 'Central Delhi' },
    
    // Maharashtra (400-449)
    '400': { state: 'Maharashtra', city: 'Mumbai', district: 'Mumbai City' },
    '411': { state: 'Maharashtra', city: 'Pune', district: 'Pune' },
    '440': { state: 'Maharashtra', city: 'Nagpur', district: 'Nagpur' },
    
    // Karnataka (560-599)
    '560': { state: 'Karnataka', city: 'Bangalore', district: 'Bangalore Urban' },
    '575': { state: 'Karnataka', city: 'Mangalore', district: 'Dakshina Kannada' },
    '580': { state: 'Karnataka', city: 'Hubli', district: 'Dharwad' },
    
    // West Bengal (700-799)
    '700': { state: 'West Bengal', city: 'Kolkata', district: 'Kolkata' },
    
    // Telangana (500-509)
    '500': { state: 'Telangana', city: 'Hyderabad', district: 'Hyderabad' },
    
    // Gujarat (380-399)
    '380': { state: 'Gujarat', city: 'Ahmedabad', district: 'Ahmedabad' },
    '395': { state: 'Gujarat', city: 'Surat', district: 'Surat' },
    
    // Rajasthan (300-349)
    '302': { state: 'Rajasthan', city: 'Jaipur', district: 'Jaipur' },
    '342': { state: 'Rajasthan', city: 'Jodhpur', district: 'Jodhpur' },
    
    // Uttar Pradesh (200-299)
    '226': { state: 'Uttar Pradesh', city: 'Lucknow', district: 'Lucknow' },
    '208': { state: 'Uttar Pradesh', city: 'Kanpur', district: 'Kanpur Nagar' },
    '282': { state: 'Uttar Pradesh', city: 'Agra', district: 'Agra' },
    '221': { state: 'Uttar Pradesh', city: 'Varanasi', district: 'Varanasi' },
    
    // Punjab (140-169)
    '160': { state: 'Punjab', city: 'Chandigarh', district: 'Chandigarh' },
    '141': { state: 'Punjab', city: 'Ludhiana', district: 'Ludhiana' },
    '143': { state: 'Punjab', city: 'Amritsar', district: 'Amritsar' },
    
    // Haryana (120-139)
    '122': { state: 'Haryana', city: 'Gurgaon', district: 'Gurgaon' },
    '134': { state: 'Haryana', city: 'Ambala', district: 'Ambala' },
    
    // Kerala (680-699)
    '682': { state: 'Kerala', city: 'Kochi', district: 'Ernakulam' },
    '695': { state: 'Kerala', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram' },
    '673': { state: 'Kerala', city: 'Kozhikode', district: 'Kozhikode' },
    
    // Andhra Pradesh (515-535)
    '530': { state: 'Andhra Pradesh', city: 'Visakhapatnam', district: 'Visakhapatnam' },
    '520': { state: 'Andhra Pradesh', city: 'Vijayawada', district: 'Krishna' },
  };
  
  return regionMap[region] || null;
}

export async function runHeatmapAggregation(): Promise<void> {
  console.log('[HeatmapCron] Starting aggregation...');
  const today = startOfDay(new Date());
  const since = subDays(today, 30); // Look at last 30 days instead of just yesterday

  const posts = await prisma.post.findMany({
    where: { createdAt: { gte: since, lt: today } },
    include: {
      author: { select: { state: true, city: true, district: true, pincode: true } }
    }
  });

  const appointments = await prisma.appointment.findMany({
    where: { createdAt: { gte: since, lt: today } },
    include: {
      patient: { select: { state: true, city: true, district: true, pincode: true } }
    }
  });

  type StatAccum = { count: number; severities: number[] };
  const statMap = new Map<string, StatAccum>();

  function record(regionType: string, regionName: string | null, symptom: string, severity: number) {
    if (!regionName) return;
    const key = `${regionType}::${regionName}::${symptom}`;
    const cur = statMap.get(key) || { count: 0, severities: [] };
    cur.count += 1;
    cur.severities.push(severity);
    statMap.set(key, cur);
  }

  console.log(`[HeatmapCron] Processing ${posts.length} posts and ${appointments.length} appointments...`);

  for (const post of posts) {
    const symptoms = extractSymptoms(post.content || '');
    const severity = extractSeverity(post.content || '');
    
    if (symptoms.length > 0) {
      console.log(`[HeatmapCron] Found symptoms in post: ${symptoms.join(', ')}`);
      
      let { state, city, district } = post.author;
      
      // If location fields are null, try to get from pincode
      if (!state && post.author.pincode) {
        const location = getLocationFromPincode(post.author.pincode);
        if (location) {
          state = location.state;
          city = location.city;
          district = location.district;
          console.log(`[HeatmapCron] Resolved pincode ${post.author.pincode} to ${state}, ${city}`);
        }
      }
      
      for (const sym of symptoms) {
        // Record for all region types
        record('country', 'India', sym, severity); // Assuming India for now
        record('state', state, sym, severity);
        record('city', city, sym, severity);
        record('district', district, sym, severity);
        record('pincode', post.author.pincode, sym, severity);
      }
    }
  }

  for (const appt of appointments) {
    const text = [appt.chiefComplaint, appt.notes, appt.diagnosisTag, appt.reason].filter(Boolean).join(' ');
    const symptoms = extractSymptoms(text);
    const severity = extractSeverity(text);
    
    if (symptoms.length > 0) {
      console.log(`[HeatmapCron] Found symptoms in appointment: ${symptoms.join(', ')}`);
      
      let { state, city, district } = appt.patient;
      
      // If location fields are null, try to get from pincode
      if (!state && appt.patient.pincode) {
        const location = getLocationFromPincode(appt.patient.pincode);
        if (location) {
          state = location.state;
          city = location.city;
          district = location.district;
          console.log(`[HeatmapCron] Resolved pincode ${appt.patient.pincode} to ${state}, ${city}`);
        }
      }
      
      for (const sym of symptoms) {
        // Record for all region types
        record('country', 'India', sym, severity); // Assuming India for now
        record('state', state, sym, severity);
        record('city', city, sym, severity);
        record('district', district, sym, severity);
        record('pincode', appt.patient.pincode, sym, severity);
      }
    }
  }

  const fourWeeksAgo = subWeeks(today, 4);

  for (const [key, val] of statMap.entries()) {
    const [regionType, regionName, symptomTag] = key.split('::');
    const severityAvg = val.severities.reduce((a, b) => a + b, 0) / val.severities.length;

    const historical = await prisma.symptomHeatmapStat.aggregate({
      where: {
        regionType, regionName, symptomTag,
        reportDate: { gte: fourWeeksAgo, lt: subDays(today, 7) }
      },
      _avg: { caseCount: true }
    });

    // More realistic alert level calculation
    const totalCases = val.count;
    const avgSeverity = severityAvg;
    
    // Base thresholds on absolute numbers and severity, not just spike ratios
    let alertLevel = 'none';
    
    if (regionType === 'country') {
      // Country level: higher thresholds
      if (totalCases >= 100 && avgSeverity >= 3) alertLevel = 'outbreak';
      else if (totalCases >= 50 && avgSeverity >= 2.5) alertLevel = 'epidemic';
      else if (totalCases >= 25) alertLevel = 'watch';
    } else if (regionType === 'state') {
      // State level: moderate thresholds
      if (totalCases >= 50 && avgSeverity >= 3) alertLevel = 'outbreak';
      else if (totalCases >= 25 && avgSeverity >= 2.5) alertLevel = 'epidemic';
      else if (totalCases >= 15) alertLevel = 'watch';
    } else if (regionType === 'district' || regionType === 'city') {
      // District/City level: lower thresholds
      if (totalCases >= 20 && avgSeverity >= 3) alertLevel = 'outbreak';
      else if (totalCases >= 10 && avgSeverity >= 2.5) alertLevel = 'epidemic';
      else if (totalCases >= 7) alertLevel = 'watch';
    } else if (regionType === 'pincode') {
      // Pincode level: very localized thresholds
      if (totalCases >= 10 && avgSeverity >= 3.5) alertLevel = 'outbreak';
      else if (totalCases >= 6 && avgSeverity >= 3) alertLevel = 'epidemic';
      else if (totalCases >= 4) alertLevel = 'watch';
    }
    
    // Also consider spike ratio if we have historical data
    if (historical._avg.caseCount && historical._avg.caseCount > 0) {
      const spikeRatio = val.count / historical._avg.caseCount;
      if (spikeRatio >= 3.0 && totalCases >= 5) {
        // Upgrade alert level if there's a significant spike
        if (alertLevel === 'none') alertLevel = 'watch';
        else if (alertLevel === 'watch') alertLevel = 'epidemic';
        else if (alertLevel === 'epidemic') alertLevel = 'outbreak';
      }
    }

    await prisma.symptomHeatmapStat.upsert({
      where: {
        regionType_regionName_symptomTag_reportDate: {
          regionType, regionName, symptomTag, reportDate: today
        }
      },
      update: { caseCount: val.count, severityAvg, alertLevel },
      create: {
        regionType, regionName, symptomTag,
        caseCount: val.count, severityAvg, alertLevel,
        source: 'post+appointment', reportDate: today
      }
    });
  }

  console.log(`[HeatmapCron] Done. ${statMap.size} stat records written.`);
}