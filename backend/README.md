# K-Pop Universe

A Rails application for managing K-Pop content, artists, and fan interactions.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Ruby**: 3.4.4
- **Rails**: 8.0.3
- **PostgreSQL**: 9.3 or higher
- **Redis**: 5.0 or higher (for background jobs)
- **Node.js**: Latest LTS version (for asset compilation)

## Setup Instructions

### 1. Install Ruby

We recommend using a Ruby version manager like `rbenv` or `rvm`:

**Using rbenv (recommended):**

```bash
# Install rbenv
brew install rbenv ruby-build  # macOS
# or follow instructions at https://github.com/rbenv/rbenv

# Install Ruby 3.4.4
rbenv install 3.4.4
rbenv global 3.4.4

# Verify installation
ruby -v  # Should show ruby 3.4.4
```

**Using rvm:**

```bash
# Install rvm
\curl -sSL https://get.rvm.io | bash -s stable

# Install Ruby 3.4.4
rvm install 3.4.4
rvm use 3.4.4 --default

# Verify installation
ruby -v  # Should show ruby 3.4.4
```

### 2. Install PostgreSQL

**macOS:**

```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib libpq-dev
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### 3. Install Redis

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**Windows:**
Download from [redis.io](https://redis.io/download) or use WSL

### 4. Clone the Repository

```bash
git clone <repository-url>
cd KPopUniverseV3
```

### 5. Install Dependencies

```bash
# Install Ruby gems
bundle install

# Install JavaScript dependencies (if needed)
# npm install  # Uncomment if package.json exists
```

### 6. Database Setup

```bash
# Create the database
rails db:create

# Run migrations
rails db:migrate

# Seed the database (if seeds are available)
rails db:seed
```

### 7. Environment Variables

Create a `.env` file in the project root for development environment variables:

```bash
# .env file (create this)
# Add any required API keys or configuration here
# REDIS_URL=redis://localhost:6379/0
# AWS_ACCESS_KEY_ID=your_key_here
# AWS_SECRET_ACCESS_KEY=your_secret_here
```

### 8. Start the Development Server

```bash
# In one terminal, start Rails server
bin/rails server

# In another terminal, start Tailwind CSS watcher (for styling)
bin/rails tailwindcss:watch

# In a third terminal, start Sidekiq (for background jobs)
bundle exec sidekiq
```

The application will be available at `http://localhost:3000`

## Running Tests

```bash
# Run all tests
rails test

# Run system tests
rails test:system
```

## Common Issues

### PostgreSQL Connection Error

If you get a connection error, ensure PostgreSQL is running:

```bash
# macOS
brew services list
brew services start postgresql@15

# Linux
sudo systemctl status postgresql
```

### Redis Connection Error

Ensure Redis is running:

```bash
# macOS
brew services list
brew services start redis

# Linux
sudo systemctl status redis-server
```

### Bundle Install Fails

Make sure you have the necessary build tools:

```bash
# macOS
xcode-select --install

# Linux
sudo apt install build-essential
```

## Project Stack

- **Framework**: Ruby on Rails 8.0.3
- **Database**: PostgreSQL
- **Caching/Jobs**: Redis + Sidekiq
- **Authentication**: Devise
- **Authorization**: Pundit
- **Styling**: Tailwind CSS
- **Frontend**: Hotwire (Turbo + Stimulus)
- **Components**: ViewComponent
- **Image Processing**: Active Storage with ImageMagick

## Additional Resources

- [Rails Guides](https://guides.rubyonrails.org/)
- [Ruby Documentation](https://ruby-doc.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
