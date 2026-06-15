type Language = string | null | undefined;
type Framework = string | null | undefined;
type CloudProvider = "aws" | "gcp" | "azure";

export function generateDockerfile(language: Language, framework: Framework): string {
  const lang = (language ?? "").toLowerCase();
  const fw = (framework ?? "").toLowerCase();

  if (fw.includes("next") || fw.includes("nextjs")) {
    return `FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]`;
  }

  if (fw.includes("vite") || fw.includes("react") || fw.includes("vue") || fw.includes("svelte")) {
    return `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;
  }

  if (lang.includes("typescript") || lang.includes("javascript") || fw.includes("express") || fw.includes("fastify") || fw.includes("node")) {
    return `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build 2>/dev/null || true
EXPOSE \${PORT:-3000}
CMD ["npm", "start"]`;
  }

  if (lang.includes("python")) {
    if (fw.includes("fastapi") || fw.includes("uvicorn")) {
      return `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE \${PORT:-8000}
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "\${PORT:-8000}"]`;
    }
    if (fw.includes("django")) {
      return `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN python manage.py collectstatic --noinput 2>/dev/null || true
EXPOSE \${PORT:-8000}
CMD ["gunicorn", "wsgi:application", "--bind", "0.0.0.0:\${PORT:-8000}"]`;
    }
    if (fw.includes("flask")) {
      return `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE \${PORT:-5000}
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:\${PORT:-5000}"]`;
    }
    return `FROM python:3.11-slim
WORKDIR /app
COPY requirements*.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE \${PORT:-8000}
CMD ["python", "app.py"]`;
  }

  if (lang.includes("go") || lang.includes("golang")) {
    return `FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE \${PORT:-8080}
CMD ["./main"]`;
  }

  if (lang.includes("ruby")) {
    return `FROM ruby:3.2-slim
WORKDIR /app
COPY Gemfile* ./
RUN bundle install --without development test
COPY . .
EXPOSE \${PORT:-3000}
CMD ["bundle", "exec", "ruby", "app.rb", "-o", "0.0.0.0"]`;
  }

  if (lang.includes("java") || fw.includes("spring")) {
    return `FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE \${PORT:-8080}
CMD ["java", "-jar", "app.jar"]`;
  }

  return `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production 2>/dev/null || true
COPY . .
EXPOSE \${PORT:-3000}
CMD ["npm", "start"]`;
}

export function generateGitHubActions(provider: CloudProvider, appName: string): string {
  const slug = appName.toLowerCase().replace(/[^a-z0-9]/g, "-");

  if (provider === "aws") {
    return `name: Deploy to AWS Elastic Beanstalk

on:
  push:
    branches: [main]

env:
  APP_NAME: ${slug}
  ENV_NAME: ${slug}-production

jobs:
  deploy:
    name: Build and deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: \${{ secrets.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, and push image to ECR
        env:
          ECR_REGISTRY: \${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: ${slug}
          IMAGE_TAG: \${{ github.sha }}
        run: |
          docker build -t \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG .
          docker push \$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG
          echo "image=\$ECR_REGISTRY/\$ECR_REPOSITORY:\$IMAGE_TAG" >> \$GITHUB_OUTPUT

      - name: Deploy to Elastic Beanstalk
        uses: einaregilsson/beanstalk-deploy@v22
        with:
          aws_access_key: \${{ secrets.AWS_ACCESS_KEY_ID }}
          aws_secret_key: \${{ secrets.AWS_SECRET_ACCESS_KEY }}
          application_name: \${{ env.APP_NAME }}
          environment_name: \${{ env.ENV_NAME }}
          region: \${{ secrets.AWS_REGION }}
          version_label: v\${{ github.run_number }}
          deployment_package: Dockerrun.aws.json`;
  }

  if (provider === "gcp") {
    return `name: Deploy to Google Cloud Run

on:
  push:
    branches: [main]

env:
  SERVICE_NAME: ${slug}

jobs:
  deploy:
    name: Build and deploy
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Authenticate to Google Cloud
        id: auth
        uses: google-github-actions/auth@v2
        with:
          credentials_json: \${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v2

      - name: Configure Docker for GCR
        run: gcloud auth configure-docker gcr.io --quiet

      - name: Build and push Docker image
        run: |
          docker build -t gcr.io/\${{ secrets.GCP_PROJECT_ID }}/\${{ env.SERVICE_NAME }}:\${{ github.sha }} .
          docker push gcr.io/\${{ secrets.GCP_PROJECT_ID }}/\${{ env.SERVICE_NAME }}:\${{ github.sha }}

      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v2
        with:
          service: \${{ env.SERVICE_NAME }}
          image: gcr.io/\${{ secrets.GCP_PROJECT_ID }}/\${{ env.SERVICE_NAME }}:\${{ github.sha }}
          region: \${{ secrets.GCP_REGION }}`;
  }

  return `name: Deploy to Azure Container Apps

on:
  push:
    branches: [main]

env:
  APP_NAME: ${slug}
  RESOURCE_GROUP: \${{ secrets.AZURE_RESOURCE_GROUP }}

jobs:
  deploy:
    name: Build and deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Log in to Azure
        uses: azure/login@v2
        with:
          creds: \${{ secrets.AZURE_CREDENTIALS }}

      - name: Log in to Azure Container Registry
        run: az acr login --name \${{ secrets.AZURE_ACR_NAME }}

      - name: Build and push Docker image
        run: |
          IMAGE=\${{ secrets.AZURE_ACR_NAME }}.azurecr.io/\${{ env.APP_NAME }}:\${{ github.sha }}
          docker build -t \$IMAGE .
          docker push \$IMAGE

      - name: Deploy to Container Apps
        run: |
          az containerapp update \\
            --name \${{ env.APP_NAME }} \\
            --resource-group \${{ env.RESOURCE_GROUP }} \\
            --image \${{ secrets.AZURE_ACR_NAME }}.azurecr.io/\${{ env.APP_NAME }}:\${{ github.sha }}`;
}

export function getGitHubSecretsRequired(provider: CloudProvider): { name: string; description: string }[] {
  if (provider === "aws") return [
    { name: "AWS_ACCESS_KEY_ID", description: "IAM Access Key ID (from AWS console → IAM → Users → Security credentials)" },
    { name: "AWS_SECRET_ACCESS_KEY", description: "IAM Secret Access Key (shown once when creating the key)" },
    { name: "AWS_REGION", description: "Target region, e.g. us-east-1" },
  ];
  if (provider === "gcp") return [
    { name: "GCP_PROJECT_ID", description: "Your Google Cloud project ID" },
    { name: "GCP_SA_KEY", description: "Service account JSON key content (from GCP console → IAM → Service Accounts)" },
    { name: "GCP_REGION", description: "Target region, e.g. us-central1" },
  ];
  return [
    { name: "AZURE_CREDENTIALS", description: "JSON from: az ad sp create-for-rbac --sdk-auth --role Contributor" },
    { name: "AZURE_RESOURCE_GROUP", description: "Your Azure resource group name" },
    { name: "AZURE_ACR_NAME", description: "Azure Container Registry name (without .azurecr.io)" },
  ];
}
