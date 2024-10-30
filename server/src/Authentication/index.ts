import { Router, Request, Response } from "express";
import KeycloakAdminClient from "keycloak-admin";

// Define custom types
interface Credentials {
  clientId: string;
  grantType: "password";
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

// Create a new KeycloakAdminClient instance
const keycloakAdmin = new KeycloakAdminClient();
const router = Router();

// Keycloak configuration
const keycloakConfig = {
  baseUrl: "http://localhost:8080/auth" as string, // Keycloak server URL
  realm: "your-realm" as string, // Your Keycloak realm
  clientId: "admin-cli" as string, // Client ID with admin privileges
  username: "admin" as string, // Admin username
  password: "admin-password" as string, // Admin password
};

// Initialize Keycloak Admin Client
const initializeKeycloak = async (): Promise<void> => {
  try {
    await keycloakAdmin.auth({
      grantType: "password" as "password", // Explicitly specify the grant type
      clientId: keycloakConfig.clientId,
      username: keycloakConfig.username,
      password: keycloakConfig.password,
    });
    keycloakAdmin.setConfig({
      baseUrl: keycloakConfig.baseUrl,
      realmName: keycloakConfig.realm,
    });
  } catch (error) {
    console.error("Error initializing Keycloak:", error);
    throw error; // Rethrow to handle it in your application start
  }
};

// Initialize Keycloak on startup
initializeKeycloak().catch((err: Error) => {
  console.error("Failed to initialize Keycloak", err);
  process.exit(1); // Exit the process if Keycloak initialization fails
});

// Create a new user
const createAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, firstName, lastName, password }: {
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      password: string;
    } = req.body;

    // Define the user representation
    const userRepresentation = {
      username,
      email,
      firstName,
      lastName,
      enabled: true,
      credentials: [{ type: "password", value: password, temporary: false }],
    };

    const newUser = await keycloakAdmin.users.create(userRepresentation);
    res.status(201).json({ message: "User created successfully", userId: newUser.id });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

// Delete a user
const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId: string = req.params.id;
    await keycloakAdmin.users.del({ id: userId });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};

// Log in and get a token
const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password }: {
      username: string;
      password: string;
    } = req.body;

    // Define the credentials object
    const credentials: Credentials = {
      clientId: keycloakConfig.clientId,
      grantType: "password", // Explicitly specify the grant type
      username,
      password,
    };

    // Perform authentication
    // Ensure to cast to any or another type that aligns with your actual response
    const tokenResponse: any = await keycloakAdmin.auth(credentials);

    // Check if the response contains access_token
    if (tokenResponse && tokenResponse.access_token) {
      res.status(200).json({ accessToken: tokenResponse.access_token });
    } else {
      res.status(400).json({ message: "Failed to obtain access token" });
    }
  } catch (error: any) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Define routes
router.post("/create-account", createAccount);
router.delete("/delete-account/:id", deleteAccount);
router.post("/login", login);

export default router;
