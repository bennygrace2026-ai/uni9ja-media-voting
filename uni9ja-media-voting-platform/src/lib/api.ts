
import { API_BASE_URL } from '../config';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, options);
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Non-JSON response from server:", text.substring(0, 100));
    throw new Error("Target server did not return data. This usually means the backend is not running on this host (e.g. static site hosting). If you are using Netlify, make sure to set VITE_API_URL in your environment variables to point to your separate backend server.");
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  
  return data;
}
