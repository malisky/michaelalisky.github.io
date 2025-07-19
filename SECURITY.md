# Security Considerations

## Data Protection
- **Subscriber emails are private**: The `subscribers.json` file contains real email addresses and is excluded from version control
- **Environment variables**: Sensitive configuration is stored in `.env` files (not committed to git)
- **Input validation**: All user inputs are validated and sanitized

## API Security
- **CORS protection**: Cross-origin requests are restricted to specified domains
- **Payload limits**: JSON payloads are limited to 10KB to prevent abuse