import scanner from 'sonarqube-scanner'

void scanner(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.organization': 'karlaramirez00',
      'sonar.projectKey': 'KarlaRamirez00_promaty-frontend',
      'sonar.projectName': 'promaty-frontend',
      'sonar.sources': 'src',
      'sonar.exclusions': 'src/main.ts,src/plugins/**,src/router/**,src/assets/**,tests/**',
    },
  },
  () => process.exit(),
)
