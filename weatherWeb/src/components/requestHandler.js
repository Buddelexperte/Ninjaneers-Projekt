const URL_BASE = "http://localhost:8000/weather/";

export async function apiRequest(endpoint, token_access,{
  method = 'GET',
  body = null,
  headers = {},
  baseUrl = URL_BASE || '',
} = {})
{
  const config = {
      method,
      mode: "cors",
      headers: {
          ...(token_access ? { Authorization: `Bearer ${token_access}` } : {}),
          'Content-Type': 'application/json',
          ...headers,
      }

  };

  if (body) {
      config.body = JSON.stringify(body);
      console.log(config.body);
  }

  try {
      const response = await fetch(`${baseUrl}${endpoint}`, config);

      if (!response.ok) {
          // Try to parse error message from response
          let errorMsg;
          try {
            const errorData = await response.json();
            errorMsg = errorData.message || response.statusText;
          } catch {
            errorMsg = response.statusText;
          }
          throw new Error(`API error: ${errorMsg}`);
      }

    // Try to parse response JSON, fallback to text
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json'))
    {
        return await response.json();
    }
    return await response.text();

  } catch (error) {
      // You can add logging here or rethrow
      console.error('API Request Failed:', error);
      throw error;
  }
}
