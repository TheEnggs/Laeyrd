// Feedback Configuration
export const FEEDBACK_CONFIG = {
  // TODO: Replace with your actual GitHub repository URL
  GITHUB_REPO_URL: "https://github.com/your-username/your-repo",

  // Issue labels to automatically add
  DEFAULT_LABELS: {
    BUG: ["bug", "theme-your-code"],
    FEATURE: ["enhancement", "theme-your-code"],
  },

  // Issue templates
  ISSUE_TEMPLATES: {
    BUG: {
      title: "Bug Report",
      body: (data: any) => `## Description
${data.description}

## Bug Report

**Severity:** ${data.severity}

${
  data.steps
    ? `## Steps to Reproduce
${data.steps}

`
    : ""
}${
        data.expected
          ? `## Expected Behavior
${data.expected}

`
          : ""
      }${
        data.actual
          ? `## Actual Behavior
${data.actual}

`
          : ""
      }---
*Submitted via Theme Your Code Feedback*`,
    },
    FEATURE: {
      title: "Feature Request",
      body: (data: any) => `## Description
${data.description}

## Feature Request

**Type:** Feature Request

---
*Submitted via Theme Your Code Feedback*`,
    },
  },
};
