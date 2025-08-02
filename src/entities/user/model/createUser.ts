import { API_BASE_URL } from "../../../shared/config/api";

export const createUser = async (userId: number): Promise<boolean> => {
  try {
    console.log(`Creating user with ID: ${userId}`);

    // Получаем данные пользователя из Telegram
    const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;

    console.log("Telegram user object for creation:", telegramUser);
    console.log("userId parameter:", userId, "type:", typeof userId);

    if (!telegramUser) {
      console.error("No Telegram user data available");
      return false;
    }

    const userData = {
      user_id: userId,
      username: telegramUser.username || "",
      first_name: telegramUser.first_name || "",
      last_name: telegramUser.last_name || "",
    };

    console.log("Creating user with data:", userData);
    console.log("JSON that will be sent:", JSON.stringify(userData));

    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${window.Telegram.WebApp.initData}`,
      },
      body: JSON.stringify(userData),
    });

    console.log(`Create user response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log("User created successfully:", result);
      return true;
    } else {
      const errorText = await response.text();
      console.error("Error creating user:", errorText);
      return false;
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
};

export const checkUserExists = async (userId: number): Promise<boolean> => {
  try {
    console.log(
      `Checking if user exists with ID: ${userId} (type: ${typeof userId})`
    );

    const url = `${API_BASE_URL}/users/?user_id=${userId}`;
    console.log("Check user URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `tma ${window.Telegram.WebApp.initData}`,
      },
    });

    console.log(`Check user response status: ${response.status}`);

    if (response.ok) {
      const users = await response.json();
      console.log("Check user response:", users);
      console.log("Number of users found:", users?.length || 0);

      // Проверяем каждого найденного пользователя
      if (Array.isArray(users) && users.length > 0) {
        users.forEach((user, index) => {
          console.log(`User ${index}:`, {
            id: user.id,
            user_id: user.user_id,
            username: user.username,
            first_name: user.first_name,
            last_name: user.last_name,
          });
        });
      }

      // Проверяем, есть ли пользователи в результате
      const userExists = Array.isArray(users) && users.length > 0;
      console.log(`User exists: ${userExists}`);
      return userExists;
    } else {
      console.error("Error checking user:", response.status);
      return false;
    }
  } catch (error) {
    console.error("Error checking user:", error);
    return false;
  }
};

export const initializeUser = async (): Promise<boolean> => {
  try {
    const telegramData = window.Telegram.WebApp.initDataUnsafe;
    console.log("Full Telegram data:", telegramData);

    const userId = telegramData.user?.id;

    if (!userId) {
      console.error("No user ID found in Telegram data");
      console.error("Telegram user object:", telegramData.user);
      return false;
    }

    console.log(
      `Initializing user with ID: ${userId} (type: ${typeof userId})`
    );

    // Проверяем, существует ли пользователь
    const userExists = await checkUserExists(userId);

    if (!userExists) {
      // Если пользователя нет, создаем его
      console.log("User does not exist, creating...");
      const created = await createUser(userId);

      if (created) {
        console.log("User initialization completed successfully");
        return true;
      } else {
        console.error("Failed to create user");
        return false;
      }
    } else {
      console.log("User already exists, initialization complete");
      return true;
    }
  } catch (error) {
    console.error("Error during user initialization:", error);
    return false;
  }
};
