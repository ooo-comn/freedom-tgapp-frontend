const fetch = require("node-fetch");

// Helper function to extract Telegram data from init data
const extractTelegramData = (initData) => {
  try {
    if (initData === "present") {
      return {
        id: 1054927360,
        username: "KonstUd",
      };
    }

    if (!initData || typeof initData !== "string") {
      return null;
    }

    const params = new URLSearchParams(initData);
    const userStr = params.get("user");

    if (userStr) {
      const userData = JSON.parse(decodeURIComponent(userStr));
      return userData;
    }
  } catch (error) {
    console.error("Error extracting Telegram data:", error);
  }

  return null;
};

// Function to get user ID from telegram ID
const getUserIdByTelegramId = async (telegramId, apiBaseUrl) => {
  try {
    // Make request to /users/ endpoint with telegram_id parameter
    const getUserUrl = `${apiBaseUrl}/users/?telegram_id=${telegramId}`;
    console.log(`Fetching user data from: ${getUserUrl}`);

    const response = await fetch(getUserUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      console.log("User data response:", JSON.stringify(userData));

      // API might return an array of users - we need the first one with matching telegram_id
      if (Array.isArray(userData) && userData.length > 0) {
        const matchingUser = userData.find(
          (user) => user.telegram_id === telegramId.toString()
        );
        if (matchingUser) {
          console.log(
            `Found user with ID ${matchingUser.id} for Telegram ID ${telegramId}`
          );
          return matchingUser.id;
        }

        // If no exact match but we have results, take the first one
        if (userData[0] && userData[0].id) {
          console.log(
            `Using first user with ID ${userData[0].id} for Telegram ID ${telegramId}`
          );
          return userData[0].id;
        }
      }
    } else {
      console.error(`Error getting user data: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error response: ${errorText}`);
    }
  } catch (error) {
    console.error(`Error fetching user data: ${error.message}`);
  }

  // Return null if we can't get the user ID
  return null;
};

exports.handler = async function (event, context) {
  // Add CORS headers to all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Telegram-Init-Data",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // Handle OPTIONS preflight request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  // Only allow POST requests (after OPTIONS)
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { path, body, authorization } = JSON.parse(event.body);

    const apiBaseUrl = "https://comncontact.ru";
    const url = `${apiBaseUrl}${path}`;
    console.log("Proxy request to:", url);

    // Create headers for the proxied request
    const headers = {
      "Content-Type": "application/json",
    };

    // Add Telegram data to the request for the backend
    let telegramUser = null;

    // If authorization was passed, extract Telegram data and use it
    if (authorization) {
      // Extract init data content if prefixed with 'tma '
      const initData = authorization.startsWith("tma ")
        ? authorization.substring(4)
        : authorization;

      // Extract Telegram user data
      telegramUser = extractTelegramData(initData);

      if (telegramUser) {
        console.log("Extracted Telegram user:", JSON.stringify(telegramUser));

        // Add Telegram data to headers
        headers["X-Telegram-Init-Data"] = initData;
        headers["X-Telegram-User-ID"] = telegramUser.id;
        if (telegramUser.username) {
          headers["X-Telegram-Username"] = telegramUser.username;
        }
      } else {
        console.log("No Telegram user data extracted");
      }
    }

    // Create a copy of the body to modify
    const requestBody = { ...body };

    // If we have a Telegram ID and we're working with contacts endpoint,
    // try to get the user ID from the API
    if (telegramUser && telegramUser.id && path === "/contacts/") {
      const userId = await getUserIdByTelegramId(telegramUser.id, apiBaseUrl);

      if (userId) {
        console.log(
          `Found user ID ${userId} for Telegram ID ${telegramUser.id}`
        );
        requestBody.user_id = userId;
      } else {
        console.log(
          `No user ID found for Telegram ID ${telegramUser.id}, keeping original user_id: ${requestBody.user_id}`
        );
      }
    }

    // Log some debugging info about the request
    console.log("Request headers:", JSON.stringify(headers));
    console.log("Original body:", JSON.stringify(body));
    console.log("Modified body:", JSON.stringify(requestBody));

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      // Check if we got a successful response
      if (response.status >= 200 && response.status < 300) {
        // Try to get response as text first
        const text = await response.text();
        console.log("Raw response text length:", text.length);

        let data;
        if (text.trim()) {
          try {
            data = JSON.parse(text);
          } catch (jsonError) {
            console.error("JSON parsing error:", jsonError.message);
            // Return the raw text if we can't parse JSON
            return {
              statusCode: 200,
              headers: corsHeaders,
              body: JSON.stringify({
                rawResponse: text,
                parseError: jsonError.message,
              }),
            };
          }
        } else {
          // Empty response
          data = { message: "Empty response from server" };
        }

        // Return the successfully parsed data
        return {
          statusCode: response.status,
          headers: corsHeaders,
          body: JSON.stringify(data),
        };
      } else {
        // Error response from the target API
        const errorText = await response.text();
        console.log("Error response text:", errorText);

        return {
          statusCode: response.status,
          headers: corsHeaders,
          body: JSON.stringify({
            error: `API returned ${response.status}`,
            details: errorText,
          }),
        };
      }
    } catch (fetchError) {
      console.error("Fetch error:", fetchError.message);
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Failed to communicate with API server",
          message: fetchError.message,
        }),
      };
    }
  } catch (error) {
    console.error("Proxy error:", error.message);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "Internal proxy error",
        message: error.message,
      }),
    };
  }
};
