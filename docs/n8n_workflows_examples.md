
# n8n Workflow Examples for HBLACKPIX

This document provides examples of n8n workflows you can implement to secure your backend operations.

## Authentication Middleware Workflow

This workflow should be the first node in your operation workflows to validate the JWT token.

1. **Webhook Trigger**
   - Method: POST
   - Path: /authenticate
   - Authentication: None (we'll validate token ourselves)

2. **Function Node: Extract JWT**
   ```javascript
   // Get token from Authorization header
   const authHeader = $input.body.req.headers.authorization;
   if (!authHeader || !authHeader.startsWith('Bearer ')) {
     return { success: false, error: 'No valid authorization token provided' };
   }
   
   const token = authHeader.split(' ')[1];
   return { token };
   ```

3. **HTTP Request: Validate with Supabase**
   - URL: https://otxdnlfikoiafqshlydu.supabase.co/auth/v1/user
   - Method: GET
   - Headers:
     - apikey: {{$env.SUPABASE_SERVICE_ROLE_KEY}}
     - Authorization: Bearer {{$json.token}}

4. **Function Node: Process Validation**
   ```javascript
   if ($input.item.json.error) {
     return { success: false, error: 'Invalid token', status: 401 };
   }
   
   const userData = $input.item.json;
   return {
     success: true,
     userId: userData.id,
     userEmail: userData.email,
     // Add any other user data you need
   };
   ```

## Create Invoice Workflow

1. **Webhook Trigger**
   - Method: POST
   - Path: /invoices/create
   - Authentication: None

2. **Subworkflow: Authentication**
   - Call the authentication workflow
   - If not successful, return error

3. **Function Node: Verify Credits**
   ```javascript
   const userId = $input.item.json.userId;
   
   // Return inputs to be used in next node
   return {
     userId,
     invoiceData: $input.body.body,
   };
   ```

4. **Postgres: Check User Credits**
   - Operation: Select
   - Table: user_invoice_credits
   - Where: user_id = {{$json.userId}}

5. **Function Node: Validate Credits**
   ```javascript
   const credits = $input.first.json.credits_remaining;
   
   if (credits <= 0) {
     return { success: false, error: 'Créditos insuficientes', status: 403 };
   }
   
   return $input.item.json;
   ```

6. **Postgres: Create Invoice with Transaction**
   - Operation: Insert
   - Table: faturas
   - Values:
     - valor: {{$json.invoiceData.valor}}
     - vencimento: {{$json.invoiceData.vencimento}}
     - client_id: {{$json.invoiceData.client_id}}
     - user_id: {{$json.userId}}
     - descricao: {{$json.invoiceData.descricao}}
     - ... other invoice fields

7. **Postgres: Deduct Credits**
   - Operation: Update
   - Table: user_invoice_credits
   - Set:
     - credits_remaining: credits_remaining - 1
   - Where: user_id = {{$json.userId}}

8. **Function Node: Prepare Response**
   ```javascript
   return {
     success: true,
     invoice: $input.item.json.createInvoiceOutput,
     remainingCredits: $input.item.json.updateCreditsOutput.credits_remaining
   };
   ```

## List Invoices Workflow

1. **Webhook Trigger**
   - Method: GET
   - Path: /invoices/list
   - Authentication: None

2. **Subworkflow: Authentication**
   - Call the authentication workflow
   - If not successful, return error

3. **Postgres: Get User Invoices**
   - Operation: Select
   - Table: faturas
   - Where: user_id = {{$json.userId}}
   - Optional: Add pagination, sorting, filtering based on query params

4. **Function Node: Format Response**
   ```javascript
   return {
     success: true,
     invoices: $input.item.json
   };
   ```

## Generate Payment Link Workflow

1. **Webhook Trigger**
   - Method: POST
   - Path: /payments/generate
   - Authentication: None

2. **Subworkflow: Authentication**
   - Call the authentication workflow
   - If not successful, return error

3. **Postgres: Get Invoice**
   - Operation: Select
   - Table: faturas
   - Where: 
     - id = {{$json.body.invoiceId}}
     - user_id = {{$json.userId}}

4. **Function Node: Validate Invoice**
   ```javascript
   if (!$input.item.json.length) {
     return { success: false, error: 'Fatura não encontrada', status: 404 };
   }
   
   return {
     invoice: $input.item.json[0],
     userId: $json.userId
   };
   ```

5. **Postgres: Get User's Mercado Pago Credentials**
   - Operation: Select
   - Table: mercado_pago_credentials
   - Where: user_id = {{$json.userId}}

6. **HTTP Request: Create Mercado Pago Preference**
   - URL: https://api.mercadopago.com/checkout/preferences
   - Method: POST
   - Headers:
     - Content-Type: application/json
     - Authorization: Bearer {{$json.mpCredentials.access_token}}
   - Body: Construct payment preference based on invoice data

7. **Postgres: Update Invoice with Payment Link**
   - Operation: Update
   - Table: faturas
   - Set:
     - payment_url: {{$json.mpResponse.init_point}}
     - mercado_pago_preference_id: {{$json.mpResponse.id}}
   - Where: id = {{$json.invoice.id}}

8. **Function Node: Format Response**
   ```javascript
   return {
     success: true,
     payment_url: $input.item.json.payment_url,
     invoice_id: $input.item.json.id
   };
   ```

## Important Security Considerations

1. Store all sensitive keys as n8n environment variables:
   - SUPABASE_SERVICE_ROLE_KEY
   - SUPABASE_URL
   - HBLACKPIX_WEBHOOK_SECRET (create a secret to validate webhook calls)

2. Add IP whitelisting if possible to limit access to your n8n instance.

3. Add proper error handling and logging in all workflows.

4. Consider implementing rate limiting to prevent abuse.
