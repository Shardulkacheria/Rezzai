import { NextResponse } from 'next/server';

// Map Adzuna results to our dashboard shape
function mapJobs(adzunaItems = []) {
  return adzunaItems.map((item) => ({
    id: item.id || Math.random().toString(36).slice(2),
    title: item.title || '',
    company: (item.company && item.company.display_name) || '',
    location: (item.location && item.location.display_name) || '',
    type: (item.contract_type || item.contract_time || '—'),
    salary: item.salary_min && item.salary_max
      ? `${Math.round(item.salary_min)} - ${Math.round(item.salary_max)}`
      : (item.salary_is_predicted === '1' ? 'Estimated' : '—'),
    description: item.description || '',
    requirements: [],
    postedDate: item.created || '',
    applicationUrl: item.redirect_url || '',
    skills: [],
    companyLogo: ''
  }));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = (searchParams.get('location') || '').trim();
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const countryOverride = (searchParams.get('country') || '').trim();
    const what = (searchParams.get('what') || '').trim(); // optional keyword; default blank for location-only

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;
    if (!appId || !appKey) {
      return NextResponse.json({ error: 'Missing ADZUNA_APP_ID or ADZUNA_APP_KEY' }, { status: 500 });
    }

    // Extract city and state/country from location for better matching
    const locationParts = location.split(',').map(part => part.trim());
    const city = locationParts[0] || '';
    const stateOrCountry = locationParts[1] || '';

    // Determine Adzuna country code (allows override via query param)
    const country = (countryOverride ||
      inferAdzunaCountryCode(location)).toLowerCase();

    // Build Adzuna request
    const qs = new URLSearchParams({
      app_id: appId,
      app_key: appKey,
      where: city || location || '',
      results_per_page: '20'
    });
    if (what) qs.append('what', what);

    const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/${page}?${qs.toString()}`;
    console.log('Adzuna API request:', url);

    const resp = await fetch(url);
    if (!resp.ok) {
      const text = await resp.text();
      console.error('Adzuna API error:', text);
      return NextResponse.json({ error: 'Adzuna request failed', details: text }, { status: 502 });
    }
    const data = await resp.json();
    const items = (data && Array.isArray(data.results)) ? data.results : [];
    let jobs = mapJobs(items);

    // Pure location-based job matching and sorting
    jobs = enhanceJobMatching(jobs, location, city, stateOrCountry);

    return NextResponse.json({ 
      jobs, 
      total: jobs.length,
      page,
      skills: [],
      location: location,
      city: city,
      stateOrCountry: stateOrCountry,
      message: `Found ${jobs.length} job opportunities in ${location || 'your location'}`
    });
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs', details: error.message }, { status: 500 });
  }
}

// Pure location-based job matching function
function enhanceJobMatching(jobs, userLocation, userCity, userStateOrCountry) {
  return jobs.map(job => {
    let locationScore = 0;
    let locationMatch = 'none';
    
    // Calculate location match score ONLY
    if (userLocation && job.location) {
      const jobLocationLower = job.location.toLowerCase();
      const userLocationLower = userLocation.toLowerCase();
      const userCityLower = userCity ? userCity.toLowerCase() : '';
      const userStateLower = userStateOrCountry ? userStateOrCountry.toLowerCase() : '';
      
      // Exact city match (highest priority)
      if (userCityLower && jobLocationLower.includes(userCityLower)) {
        locationScore = 100;
        locationMatch = 'exact_city';
      }
      // State/Country match
      else if (userStateLower && jobLocationLower.includes(userStateLower)) {
        locationScore = 80;
        locationMatch = 'state_country';
      }
      // Remote work (always good)
      else if (jobLocationLower.includes('remote') || 
               jobLocationLower.includes('work from home') ||
               jobLocationLower.includes('hybrid') ||
               jobLocationLower.includes('anywhere')) {
        locationScore = 90;
        locationMatch = 'remote';
      }
      // Partial location match
      else if (userLocationLower.includes(jobLocationLower) || jobLocationLower.includes(userLocationLower)) {
        locationScore = 70;
        locationMatch = 'partial';
      }
      // Same country/region indicators
      else if (isSameRegion(userLocationLower, jobLocationLower)) {
        locationScore = 60;
        locationMatch = 'same_region';
      }
      // Any location match (lowest priority)
      else {
        locationScore = 10;
        locationMatch = 'other';
      }
    }
    
    return {
      ...job,
      matchScore: locationScore,
      locationScore,
      skillsScore: 0, // No skills scoring
      locationMatch,
      isHighMatch: locationScore >= 80, // High if exact city, state, or remote
      isMediumMatch: locationScore >= 50 && locationScore < 80, // Medium for partial/same region
      isLowMatch: locationScore < 50 // Low for other locations
    };
  }).sort((a, b) => {
    // Sort by location score first, then by date
    if (b.locationScore !== a.locationScore) {
      return b.locationScore - a.locationScore;
    }
    return new Date(b.postedDate) - new Date(a.postedDate);
  });
}

// Helper function to detect same region/country
function isSameRegion(userLocation, jobLocation) {
  const usStates = ['california', 'ca', 'new york', 'ny', 'texas', 'tx', 'florida', 'fl', 'washington', 'wa'];
  const countries = ['united states', 'usa', 'us', 'canada', 'uk', 'united kingdom', 'australia', 'germany', 'france'];
  
  // Check for same country
  for (const country of countries) {
    if (userLocation.includes(country) && jobLocation.includes(country)) {
      return true;
    }
  }
  
  // Check for same US state
  for (const state of usStates) {
    if (userLocation.includes(state) && jobLocation.includes(state)) {
      return true;
    }
  }
  
  return false;
}

// Infer Adzuna country code from a free-form location string
function inferAdzunaCountryCode(locationStr) {
  const l = (locationStr || '').toLowerCase();
  // Common mappings for Adzuna
  if (l.includes('india') || /mumbai|pune|delhi|bangalore|bengaluru|hyderabad|chennai/.test(l)) return 'in';
  if (l.includes('united states') || l.includes('usa') || l.includes('us') ||
      /new york|san francisco|california|tx|fl|wa|ny|ca/.test(l)) return 'us';
  if (l.includes('united kingdom') || l.includes('uk') || /london|manchester|edinburgh/.test(l)) return 'gb';
  if (l.includes('canada') || /toronto|vancouver|montreal/.test(l)) return 'ca';
  if (l.includes('australia') || /sydney|melbourne|brisbane/.test(l)) return 'au';
  if (l.includes('germany') || /berlin|munich|münchen|frankfurt/.test(l)) return 'de';
  if (l.includes('france') || /paris|lyon|marseille/.test(l)) return 'fr';
  // Default to US
  return 'us';
}
