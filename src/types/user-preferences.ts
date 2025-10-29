export interface ProgrammingLanguagePreference {
  primary: string;
  secondary: string[];
  frameworks: string[];
}

export interface UserConsents {
  dataSyncEnabled: boolean;
  readSettingsEnabled: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  marketingOptIn: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  lastUpdated: string; // ISO date string
}

export interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
  githubUsername?: string;
  isSignedIn: boolean;
  lastSignInAt?: string;
  createdAt?: string;
}

export interface AuthSession {
  id: string; // sessionId
  token: string;
  userId: string;
  status: "active" | "expired" | "ended";
  lastActiveAt: string;
}

export interface UserPreferences {
  userId?: string;
  authUser?: AuthUser;
  programmingLanguage: ProgrammingLanguagePreference;
  consents: UserConsents;
  version: string; // for schema migration purposes
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ServerConfig {
  baseUrl: string;
  githubUrl: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  clerkPublishableKey: string;
  webappUrl: string;
  clerkSignInUrl?: string;
  clerkSignUpUrl?: string;
}

export const PROGRAMMING_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "C",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Scala",
  "R",
  "MATLAB",
  "SQL",
  "HTML",
  "CSS",
  "Dart",
  "Lua",
  "Perl",
  "Haskell",
  "Clojure",
  "F#",
  "Objective-C",
  "Shell/Bash",
  "PowerShell",
  "YAML",
  "JSON",
  "XML",
  "Other",
] as const;

export const FRAMEWORKS = [
  // JavaScript/TypeScript
  "React",
  "Vue.js",
  "Angular",
  "Svelte",
  "Next.js",
  "Nuxt.js",
  "Express.js",
  "Node.js",
  "Nest.js",
  // Python
  "Django",
  "Flask",
  "FastAPI",
  "Pyramid",
  "Tornado",
  "Bottle",
  // Java
  "Spring",
  "Spring Boot",
  "Struts",
  "JSF",
  "Play Framework",
  // C#
  ".NET",
  ".NET Core",
  "ASP.NET",
  "Blazor",
  "Xamarin",
  // PHP
  "Laravel",
  "Symfony",
  "CodeIgniter",
  "Zend",
  "CakePHP",
  // Ruby
  "Ruby on Rails",
  "Sinatra",
  "Hanami",
  // Python Data Science
  "Pandas",
  "NumPy",
  "Scikit-learn",
  "TensorFlow",
  "PyTorch",
  // Mobile
  "React Native",
  "Flutter",
  "Ionic",
  "Cordova",
  // Other
  "Bootstrap",
  "Tailwind CSS",
  "Material-UI",
  "Ant Design",
  "Chakra UI",
  "Other",
] as const;

export type ProgrammingLanguage = (typeof PROGRAMMING_LANGUAGES)[number];
export type Framework = (typeof FRAMEWORKS)[number];
