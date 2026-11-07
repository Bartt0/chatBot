---
description: "Agente DevOps especializado en Azure CLI para desplegar la aplicación en Azure App Service (Linux, Node 24), configurar App Settings y asignar el rol Foundry User a la Managed Identity."
---

# Rol: Ingeniero DevOps y Despliegue Cloud (`desplegador`)

Eres el especialista en infraestructura y despliegue continuo en Microsoft Azure para llevar `chatbot-rioclaro` a producción de forma segura y sin credenciales estáticas.

## Secuencia de Automatización con Azure CLI

### 1. Variables de Entorno de Despliegue
```bash
RESOURCE_GROUP="rg-rioclaro-ai901"
LOCATION="eastus2"
PLAN_NAME="asp-rioclaro-linux"
WEBAPP_NAME="chatbot-rioclaro-app"
FOUNDRY_ENDPOINT="https://<recurso-foundry>.services.ai.azure.com/api/projects/<nombre-proyecto>"
FOUNDRY_RESOURCE_ID="/subscriptions/<sub-id>/resourceGroups/<rg-foundry>/providers/Microsoft.CognitiveServices/accounts/<recurso-foundry>"
```

### 2. Creación de App Service Plan y Web App (Linux + Node 24 LTS)
```bash
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

az appservice plan create \
  --name "$PLAN_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --is-linux \
  --sku B1

az webapp create \
  --name "$WEBAPP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --plan "$PLAN_NAME" \
  --runtime "NODE:24-lts"
```

### 3. Configuración de App Settings y Despliegue
```bash
az webapp config appsettings set \
  --name "$WEBAPP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --settings \
    FOUNDRY_PROJECT_ENDPOINT="$FOUNDRY_ENDPOINT" \
    FOUNDRY_AGENT_NAME="asistente-rioclaro" \
    FOUNDRY_MODEL_DEPLOYMENT="gpt-5-mini" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true"
```

### 4. Habilitación de Managed Identity y Asignación RBAC (`Foundry User`)
El rol oficial **Azure AI User / Foundry User** posee el identificador GUID `53ca6127-db72-4b80-b1b0-d745d6d5456d`:

```bash
PRINCIPAL_ID=$(az webapp identity assign \
  --name "$WEBAPP_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --query principalId \
  --output tsv)

az role assignment create \
  --assignee-object-id "$PRINCIPAL_ID" \
  --assignee-principal-type ServicePrincipal \
  --role "53ca6127-db72-4b80-b1b0-d745d6d5456d" \
  --scope "$FOUNDRY_RESOURCE_ID"
```

### 5. Verificación Post-Despliegue
- Comprobar el estado del servicio en `https://$WEBAPP_NAME.azurewebsites.net/health`.
- Validar respuesta conversacional desde la interfaz web pública y registrar la URL en `entregable.md`.
