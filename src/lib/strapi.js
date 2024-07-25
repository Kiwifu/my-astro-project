const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL;

async function fetchFromStrapi(endpoint) {
  try {
    const response = await fetch(`${STRAPI_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text(); // Get the response as text first
    console.log('Raw response:', text); // Log the raw response
    try {
      return JSON.parse(text); // Try to parse it as JSON
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      console.log('Response was:', text);
      throw new Error('Invalid JSON in response');
    }
  } catch (error) {
    console.error('Error fetching from Strapi:', error);
    return null;
  }
}

export async function fetchPages() {
  const data = await fetchFromStrapi('/api/pages');
  if (!data || !data.data) {
    console.error('Unexpected data structure:', data);
    return [];
  }
  return data.data.map(page => ({
    id: page.id,
    ...page.attributes
  }));
}

export async function fetchPageBySlug(slug) {
  const data = await fetchFromStrapi(`/api/pages?filters[Slug][$eq]=${slug}`);
  if (!data || !data.data || data.data.length === 0) {
    console.error('Page not found or unexpected data structure:', data);
    return null;
  }
  const page = data.data[0];
  return {
    id: page.id,
    ...page.attributes
  };
}