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

          if (response.status === 401)
          {
              console.warn("Unauthorized – loginToken expired");
              alert("Session abgelaufen, bitte melden Sie sich erneut an")

              window.location.href = "/";
          }

          return {
              "success" : false,
              "message" : errorMsg,
              "reason" : response.status,
          }
      }

      // Try to parse response JSON, fallback to text
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json'))
      {
          return await response.json();
      }
      return await response.text();

  } catch (error) {
      console.error('API Request Failed:', error);
      throw error;
  }
}
