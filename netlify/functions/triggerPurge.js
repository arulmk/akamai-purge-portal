exports.handler = async (event, context) => {
  // 1. Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' }) 
    };
  }

  try {
    // 2. Parse payload sent from React frontend
    const { hostname, cp_code, network, method, objects } = JSON.parse(event.body);

    // 3. Send dispatch request to GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_PAT}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'akamai_purge',
          client_payload: {
            hostname,
            cp_code,
            network,
            method,
            objects,
          },
        }),
      }
    );

    if (response.ok || response.status === 204) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Purge workflow triggered successfully!' }),
      };
    } else {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: errorText }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};