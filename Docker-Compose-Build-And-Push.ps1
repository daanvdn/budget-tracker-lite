# Function to load .env file and extract LOCAL_DOCKER_REGISTRY
function Get-EnvValue {
    param(
        [string]$Key,
        [string]$EnvPath = ".env"
    )
    if (-not (Test-Path $EnvPath)) {
        Write-Error ".env file not found at path: $EnvPath. Exiting script."
        exit 1
    }
    $lines = Get-Content $EnvPath | Where-Object { $_ -match "^$Key=" }
    if ($lines) {
        $value = $lines -replace "^$Key=", ''
        return $value
    }
    return $null
}

# Load LOCAL_DOCKER_REGISTRY from .env and assign to $REGISTRY
$REGISTRY = Get-EnvValue -Key 'LOCAL_DOCKER_REGISTRY'

if (-not $REGISTRY) {
    Write-Error "LOCAL_DOCKER_REGISTRY key not found in .env file. Exiting script."
    exit 1
}
$USE_CUSTOM_DOCKER_COMPOSE_FILE = Get-EnvValue -Key 'USE_CUSTOM_DOCKER_COMPOSE_FILE'
Write-Host "USE_CUSTOM_DOCKER_COMPOSE_FILE is set to: $USE_CUSTOM_DOCKER_COMPOSE_FILE"
if ($USE_CUSTOM_DOCKER_COMPOSE_FILE -eq 'true') {
    $DOCKER_COMPOSE_FILE = Get-EnvValue -Key 'CUSTOM_DOCKER_COMPOSE_FILE_PATH'
    if (-not $DOCKER_COMPOSE_FILE) {
        Write-Error "CUSTOM_DOCKER_COMPOSE_FILE_PATH key not found in .env file. Exiting script."
        exit 1
    }
    else
    {
        Write-Host "Using custom Docker Compose file: $DOCKER_COMPOSE_FILE"
    }
} else {
    $DOCKER_COMPOSE_FILE = "docker-compose.yml"
    Write-Host "Using default Docker Compose file: $DOCKER_COMPOSE_FILE"
}
Write-Host "Using local Docker registry: $REGISTRY"


Write-Host "Building Docker images (no cache, always fresh build)"
docker compose -f $DOCKER_COMPOSE_FILE build --no-cache --pull
#read LOCAL_DOCKER_REGISTRY from .env file and set it to $REGISTRY variable

# Generate a version tag using the current date and time
$VERSION_TAG = "v" + (Get-Date -Format "yyyyMMdd-HHmmss")

# Tag and push backend image with both version and latest
Write-Host "Tagging and pushing image budget-tracker-lite-backend"
docker tag budget-tracker-lite-backend:latest $REGISTRY/budget-tracker-lite-backend:$VERSION_TAG
docker tag budget-tracker-lite-backend:latest $REGISTRY/budget-tracker-lite-backend:latest
docker push $REGISTRY/budget-tracker-lite-backend:$VERSION_TAG
docker push $REGISTRY/budget-tracker-lite-backend:latest
Write-Host "Pushed budget-tracker-lite-backend images with tags: $VERSION_TAG and latest"

# Tag and push frontend image with both version and latest
Write-Host "Tagging and pushing image budget-tracker-lite-frontend"
docker tag budget-tracker-lite-frontend:latest $REGISTRY/budget-tracker-lite-frontend:$VERSION_TAG
docker tag budget-tracker-lite-frontend:latest $REGISTRY/budget-tracker-lite-frontend:latest
docker push $REGISTRY/budget-tracker-lite-frontend:$VERSION_TAG
docker push $REGISTRY/budget-tracker-lite-frontend:latest
Write-Host "Pushed budget-tracker-lite-frontend images with tags: $VERSION_TAG and latest"