# Security Considerations

## Data Protection
- **Subscriber emails are private**: The `subscribers.json` file contains real email addresses and is excluded from version control
- **Environment variables**: Sensitive configuration is stored in `.env` files (not committed to git)
- **Input validation**: All user inputs are validated and sanitized

## API Security
- **Rate limiting**: Newsletter signup is limited to 3 attempts per 15 minutes per IP
- **CORS protection**: Cross-origin requests are restricted to specified domains
- **Payload limits**: JSON payloads are limited to 10KB to prevent abuse
- **Email validation**: Comprehensive email format validation

## Before Deployment
1. Ensure `.env` file has your SMTP credentials
2. Set `NODE_ENV=production` in production
3. Configure `CORS_ORIGIN` to your actual domain
4. Use HTTPS in production
5. Consider adding Helmet.js for additional security headers

## File Structure
```
├── subscribers.json         
├── .env                      # Private config (gitignored)  
├── .env.example             # Template for setup
└── server.js                # Main server file
``` 