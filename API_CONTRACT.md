# K-Pop Universe - API Contract & Team Guide

**Version:** 1.0
**Last Updated:** October 31, 2025
**Architecture:** Rails API (Backend) + React SPA (Frontend)
**Authentication:** Devise + JWT + OmniAuth

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Authentication Guide](#authentication-guide)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Error Handling](#error-handling)
6. [Team Workflow](#team-workflow)

---

## Quick Start

### Backend Developer (Rails)
```bash
cd backend
bundle install
rails db:create db:migrate db:seed
rails server -p 9000
```

**Your responsibilities:**
- Build API endpoints under `/api/v1/`
- Handle authentication (Devise + JWT)
- Return JSON responses
- Set up OAuth providers

### Frontend Developer (React)
```bash
cd frontend
npm install
npm run dev
```

**Your responsibilities:**
- Build UI components
- Call API endpoints using Axios
- Store JWT tokens in localStorage
- Handle OAuth redirects

---

## Architecture Overview

### How They Communicate

```
┌─────────────────────────────────────┐
│   React App (localhost:5173)        │
│                                     │
│  User clicks "Login with Google"   │
│         ↓                           │
│  Opens popup: localhost:9000/      │
│    users/auth/google_oauth2         │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   Rails API (localhost:9000)        │
│                                     │
│  1. Redirects to Google             │
│  2. User authorizes                 │
│  3. Google redirects back           │
│  4. Rails creates/finds user        │
│  5. Returns JWT token               │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│   React App                          │
│                                     │
│  1. Receives token                  │
│  2. Stores in localStorage          │
│  3. Adds to all API requests        │
│     Authorization: Bearer <token>   │
└─────────────────────────────────────┘
```

### Tech Stack Summary

**Backend:**
- Devise (user authentication)
- devise-jwt (JWT token generation)
- OmniAuth (Google, Facebook, Apple OAuth)
- Pundit (authorization)
- PostgreSQL

**Frontend:**
- Axios (API calls with token interceptors)
- React Router (navigation)
- localStorage (token storage)
- Tailwind CSS (styling)

---

## Authentication Guide

### Backend Setup (Rails)

#### 1. Gems Required

```ruby
# Gemfile
gem 'devise'
gem 'devise-jwt'
gem 'omniauth'
gem 'omniauth-google-oauth2'
gem 'omniauth-facebook'
gem 'omniauth-apple'
gem 'rack-cors'
```

#### 2. User Model

```ruby
# app/models/user.rb
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: JwtDenylist,
         :omniauthable, omniauth_providers: [:google_oauth2, :facebook, :apple]

  has_many :posts
  has_many :communities

  validates :username, presence: true, uniqueness: true

  # OAuth handling
  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.username = auth.info.name || "user_#{SecureRandom.hex(4)}"
      user.avatar_url = auth.info.image
    end
  end
end
```

#### 3. Controllers

```ruby
# app/controllers/api/v1/auth/registrations_controller.rb
class Api::V1::Auth::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        success: true,
        message: 'Signed up successfully',
        data: {
          user: UserSerializer.new(resource).as_json,
          token: request.env['warden-jwt_auth.token']
        }
      }, status: :created
    else
      render json: {
        success: false,
        message: 'Sign up failed',
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end
end
```

```ruby
# app/controllers/api/v1/auth/sessions_controller.rb
class Api::V1::Auth::SessionsController < Devise::SessionsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    render json: {
      success: true,
      message: 'Logged in successfully',
      data: {
        user: UserSerializer.new(resource).as_json,
        token: request.env['warden-jwt_auth.token']
      }
    }
  end

  def respond_to_on_destroy
    if current_user
      render json: {
        success: true,
        message: 'Logged out successfully'
      }, status: :ok
    else
      render json: {
        success: false,
        message: 'No active session'
      }, status: :unauthorized
    end
  end
end
```

```ruby
# app/controllers/api/v1/auth/omniauth_controller.rb
class Api::V1::Auth::OmniauthController < ApplicationController
  def google_oauth2
    handle_auth "Google"
  end

  def facebook
    handle_auth "Facebook"
  end

  def apple
    handle_auth "Apple"
  end

  private

  def handle_auth(provider)
    @user = User.from_omniauth(request.env['omniauth.auth'])

    if @user.persisted?
      # Generate JWT token
      token = Warden::JWTAuth::UserEncoder.new.call(@user, :user, nil).first

      # Redirect back to React app with token
      redirect_to "#{ENV['FRONTEND_URL']}/auth/callback?token=#{token}&provider=#{provider.downcase}"
    else
      redirect_to "#{ENV['FRONTEND_URL']}/auth/failure?message=Authentication failed"
    end
  end
end
```

#### 4. Routes

```ruby
# config/routes.rb
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Devise routes
      devise_for :users, path: 'auth', controllers: {
        registrations: 'api/v1/auth/registrations',
        sessions: 'api/v1/auth/sessions'
      }

      # OAuth callbacks
      devise_scope :user do
        get 'auth/:provider/callback', to: 'auth/omniauth#:provider'
      end

      # Protected routes
      authenticate :user do
        resources :posts
        resources :communities
        # ... other protected routes
      end

      # Public routes
      get 'feed/home', to: 'feed#home'
      resources :kpop_groups, only: [:index, :show]
    end
  end
end
```

#### 5. CORS Configuration

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173'

    resource '/api/*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization'],
      credentials: true
  end
end
```

---

### Frontend Setup (React)

#### 1. Axios Configuration

```javascript
// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

#### 2. Auth API Module

```javascript
// src/api/authApi.js
import api from './axios';

// Regular email/password signup
export const signup = async (userData) => {
  const response = await api.post('/auth', {
    user: {
      email: userData.email,
      password: userData.password,
      username: userData.username,
    },
  });

  // Store token
  if (response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
  }

  return response.data;
};

// Regular email/password login
export const login = async (credentials) => {
  const response = await api.post('/auth/sign_in', {
    user: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  // Store token
  if (response.data.data.token) {
    localStorage.setItem('authToken', response.data.data.token);
  }

  return response.data;
};

// Logout
export const logout = async () => {
  const response = await api.delete('/auth/sign_out');
  localStorage.removeItem('authToken');
  return response.data;
};

// OAuth login - opens popup
export const loginWithOAuth = (provider) => {
  const width = 600;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;

  const popup = window.open(
    `http://localhost:9000/api/v1/auth/${provider}`,
    'OAuth Login',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  // Listen for OAuth callback
  return new Promise((resolve, reject) => {
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.token) {
        localStorage.setItem('authToken', event.data.token);
        popup.close();
        resolve(event.data);
      } else if (event.data.error) {
        popup.close();
        reject(event.data.error);
      }
    });
  });
};
```

#### 3. OAuth Callback Page

```javascript
// src/pages/AuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('message');

    if (token) {
      // Send token to parent window
      if (window.opener) {
        window.opener.postMessage({ token }, window.location.origin);
      } else {
        // Fallback: store token and redirect
        localStorage.setItem('authToken', token);
        navigate('/');
      }
    } else if (error) {
      if (window.opener) {
        window.opener.postMessage({ error }, window.location.origin);
      } else {
        navigate('/login?error=' + error);
      }
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Completing authentication...</h2>
      </div>
    </div>
  );
};

export default AuthCallback;
```

#### 4. Login Component Example

```javascript
// src/components/auth/LoginForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, loginWithOAuth } from '../../api/authApi';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      await loginWithOAuth(provider);
      navigate('/');
    } catch (err) {
      setError('OAuth login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Login</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => handleOAuthLogin('google_oauth2')}
            className="w-full flex items-center justify-center px-4 py-2 border rounded hover:bg-gray-50"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuthLogin('facebook')}
            className="w-full flex items-center justify-center px-4 py-2 border rounded hover:bg-gray-50"
          >
            <img src="/facebook-icon.svg" alt="Facebook" className="w-5 h-5 mr-2" />
            Continue with Facebook
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
```

#### 5. Auth Context

```javascript
// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('authToken');
    if (token) {
      // Optionally verify token with backend
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
    } catch (error) {
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

---

## API Endpoints Reference

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detail 1", "Detail 2"]
}
```

**Pagination:**
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "meta": {
    "current_page": 1,
    "total_pages": 10,
    "total_count": 245,
    "per_page": 25
  }
}
```

---

### Authentication Endpoints

#### POST /api/v1/auth (Sign Up)

**Request:**
```json
{
  "user": {
    "email": "fan@example.com",
    "password": "SecurePass123!",
    "username": "kpopfan123"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Signed up successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "fan@example.com",
      "username": "kpopfan123",
      "avatar_url": null,
      "created_at": "2025-10-31T17:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwic2NwIjoidXNlciIsImF1ZCI6bnVsbCwiaWF0IjoxNjk4NzcwNDAwLCJleHAiOjE2OTg4NTY4MDB9..."
  }
}
```

**Frontend Example:**
```javascript
import { signup } from '../api/authApi';

const handleSignup = async (formData) => {
  try {
    const result = await signup(formData);
    // Token is already stored in localStorage by authApi
    console.log('User:', result.data.user);
    navigate('/');
  } catch (error) {
    console.error('Signup failed:', error.response.data.errors);
  }
};
```

---

#### POST /api/v1/auth/sign_in (Login)

**Request:**
```json
{
  "user": {
    "email": "fan@example.com",
    "password": "SecurePass123!"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "fan@example.com",
      "username": "kpopfan123",
      "avatar_url": "https://...",
      "karma": 1250
    },
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

**Frontend Example:**
```javascript
import { login } from '../api/authApi';

const handleLogin = async (credentials) => {
  try {
    const result = await login(credentials);
    console.log('Logged in:', result.data.user);
    navigate('/');
  } catch (error) {
    setError(error.response?.data?.message);
  }
};
```

---

#### DELETE /api/v1/auth/sign_out (Logout)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Frontend Example:**
```javascript
import { logout } from '../api/authApi';

const handleLogout = async () => {
  try {
    await logout();
    // Token is already removed from localStorage
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

---

#### GET /api/v1/auth/:provider (OAuth - Google/Facebook/Apple)

**Flow:**
1. Frontend opens popup: `http://localhost:9000/api/v1/auth/google_oauth2`
2. User authorizes on Google
3. Google redirects to: `http://localhost:9000/api/v1/auth/google_oauth2/callback`
4. Rails creates/finds user, generates token
5. Rails redirects to: `http://localhost:5173/auth/callback?token=<JWT>`
6. React stores token and closes popup

**Frontend Example:**
```javascript
import { loginWithOAuth } from '../api/authApi';

const handleGoogleLogin = async () => {
  try {
    await loginWithOAuth('google_oauth2');
    console.log('OAuth login successful');
    navigate('/');
  } catch (error) {
    console.error('OAuth failed:', error);
  }
};
```

---

### User Endpoints

#### GET /api/v1/users/:id

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "kpopfan123",
    "email": "fan@example.com",
    "avatar_url": "https://...",
    "bio": "BTS ARMY 💜",
    "karma": 1250,
    "created_at": "2025-01-15T10:00:00Z",
    "favorite_groups": [
      { "id": 1, "name": "BTS", "logo_url": "..." }
    ],
    "stats": {
      "posts_count": 45,
      "comments_count": 320,
      "communities_count": 12
    }
  }
}
```

**Frontend Example:**
```javascript
// src/api/usersApi.js
import api from './axios';

export const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Usage in component
const { data: user, loading } = useQuery('user', () => getUser(userId));
```

---

#### PATCH /api/v1/users/:id

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "user": {
    "username": "newusername",
    "bio": "Updated bio",
    "avatar": "base64_image_or_file"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "newusername",
    "bio": "Updated bio",
    "avatar_url": "https://..."
  }
}
```

---

### Community Endpoints

#### GET /api/v1/communities

**Query Params:**
- `search` (string): Search communities
- `sort` (string): `popular`, `new`, `members`
- `page` (int), `per_page` (int)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "r/kpop",
      "slug": "kpop",
      "description": "K-Pop news and discussion",
      "icon_url": "https://...",
      "members_count": 45230,
      "is_member": false
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 5
  }
}
```

**Frontend Example:**
```javascript
// src/api/communitiesApi.js
export const getCommunities = async (params = {}) => {
  const response = await api.get('/communities', { params });
  return response.data;
};

// Usage
const communities = await getCommunities({ sort: 'popular', page: 1 });
```

---

#### POST /api/v1/communities

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "community": {
    "name": "r/newjeans",
    "description": "NewJeans fan community",
    "rules": "1. Be respectful\n2. No spam"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "r/newjeans",
    "slug": "newjeans",
    "creator_id": 1
  }
}
```

---

#### POST /api/v1/communities/:id/join

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined community",
  "data": {
    "is_member": true,
    "members_count": 45231
  }
}
```

**Frontend Example:**
```javascript
export const joinCommunity = async (id) => {
  const response = await api.post(`/communities/${id}/join`);
  return response.data;
};
```

---

### Post Endpoints

#### GET /api/v1/communities/:community_id/posts

**Query Params:**
- `filter`: `hot`, `new`, `top`
- `time`: `today`, `week`, `month`, `all` (for top)
- `page`, `per_page`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "BTS announces world tour!",
      "content": "Just saw the announcement...",
      "post_type": "text",
      "author": {
        "id": 1,
        "username": "kpopfan123",
        "avatar_url": "..."
      },
      "community": {
        "id": 5,
        "name": "r/bangtan"
      },
      "hearts_count": 1245,
      "comments_count": 234,
      "is_hearted": false,
      "is_saved": false,
      "created_at": "2025-10-31T10:00:00Z",
      "images": []
    }
  ],
  "meta": {
    "current_page": 1,
    "total_pages": 10
  }
}
```

**Frontend Example:**
```javascript
// src/api/postsApi.js
export const getPosts = async (communityId, params = {}) => {
  const response = await api.get(`/communities/${communityId}/posts`, { params });
  return response.data;
};

// Usage in component
const posts = await getPosts(communityId, { filter: 'hot', page: 1 });
```

---

#### POST /api/v1/communities/:community_id/posts

**Headers:** `Authorization: Bearer <token>`

**Request (Text Post):**
```json
{
  "post": {
    "title": "Check out this BTS performance!",
    "content": "The choreography was amazing...",
    "post_type": "text"
  }
}
```

**Request (Image Post):**
```javascript
// Use FormData for images
const formData = new FormData();
formData.append('post[title]', 'Check out these photos!');
formData.append('post[content]', 'From the concert...');
formData.append('post[post_type]', 'image');
formData.append('post[images][]', file1);
formData.append('post[images][]', file2);

const response = await api.post(`/communities/${id}/posts`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Check out this BTS performance!",
    "content": "The choreography was amazing...",
    "hearts_count": 0,
    "created_at": "2025-10-31T17:00:00Z"
  }
}
```

---

#### POST /api/v1/posts/:id/heart

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hearts_count": 1246,
    "is_hearted": true
  }
}
```

**Frontend Example:**
```javascript
export const heartPost = async (postId) => {
  const response = await api.post(`/posts/${postId}/heart`);
  return response.data;
};

// Usage with optimistic update
const handleHeart = async () => {
  setIsHearted(true);
  setHeartsCount(prev => prev + 1);

  try {
    await heartPost(post.id);
  } catch (error) {
    // Rollback on error
    setIsHearted(false);
    setHeartsCount(prev => prev - 1);
  }
};
```

---

#### POST /api/v1/posts/:post_id/comments

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "comment": {
    "content": "Great post! I totally agree..."
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 456,
    "content": "Great post! I totally agree...",
    "author": {
      "id": 1,
      "username": "kpopfan123",
      "avatar_url": "..."
    },
    "hearts_count": 0,
    "created_at": "2025-10-31T17:05:00Z"
  }
}
```

---

### Feed Endpoints

#### GET /api/v1/feed/home

**Headers:** `Authorization: Bearer <token>`

**Query Params:** `filter`, `page`, `per_page`

**Response:** Same as posts list

**Frontend Example:**
```javascript
export const getHomeFeed = async (params = {}) => {
  const response = await api.get('/feed/home', { params });
  return response.data;
};
```

---

#### GET /api/v1/feed/all

**Query Params:** `filter`, `page`, `per_page`

**Response:** Same as posts list (from all communities)

---

### K-Pop Group Endpoints

#### GET /api/v1/kpop_groups

**Query Params:**
- `search` (string)
- `company_id` (int)
- `group_type`: `boy_group`, `girl_group`, `solo`
- `status`: `active`, `disbanded`, `hiatus`
- `sort`: `popular`, `new`, `alphabetical`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "BTS",
      "korean_name": "방탄소년단",
      "group_type": "boy_group",
      "debut_date": "2013-06-13",
      "status": "active",
      "logo_url": "https://...",
      "company": {
        "id": 1,
        "name": "HYBE"
      },
      "members_count": 7,
      "followers_count": 125000,
      "is_following": false
    }
  ]
}
```

---

#### GET /api/v1/kpop_groups/:id

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "BTS",
    "description": "BTS is a seven-member...",
    "members": [
      {
        "id": 1,
        "stage_name": "RM",
        "full_name": "Kim Namjoon",
        "birth_date": "1994-09-12",
        "position": "Leader, Main Rapper",
        "photo_url": "..."
      }
    ],
    "albums": [...],
    "social_links": {
      "twitter": "...",
      "instagram": "..."
    },
    "followers_count": 125000,
    "is_following": true
  }
}
```

---

## Error Handling

### Backend Error Responses

```ruby
# app/controllers/concerns/error_handler.rb
module ErrorHandler
  extend ActiveSupport::Concern

  included do
    rescue_from ActiveRecord::RecordNotFound, with: :not_found
    rescue_from ActiveRecord::RecordInvalid, with: :unprocessable_entity
    rescue_from Pundit::NotAuthorizedError, with: :forbidden
  end

  private

  def not_found
    render json: {
      success: false,
      message: 'Resource not found'
    }, status: :not_found
  end

  def unprocessable_entity(exception)
    render json: {
      success: false,
      message: 'Validation failed',
      errors: exception.record.errors.full_messages
    }, status: :unprocessable_entity
  end

  def forbidden
    render json: {
      success: false,
      message: 'You are not authorized to perform this action'
    }, status: :forbidden
  end
end
```

### Frontend Error Handling

```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 401:
        return 'Please log in to continue';
      case 403:
        return 'You do not have permission to perform this action';
      case 404:
        return 'Resource not found';
      case 422:
        return data.errors?.join(', ') || 'Validation failed';
      case 500:
        return 'Server error. Please try again later';
      default:
        return data.message || 'Something went wrong';
    }
  } else if (error.request) {
    return 'Network error. Please check your connection';
  } else {
    return 'An unexpected error occurred';
  }
};

// Usage in components
try {
  await createPost(postData);
} catch (error) {
  const message = handleApiError(error);
  toast.error(message);
}
```

---

## Team Workflow

### Backend Developer Checklist

For each new feature:

1. **Create Migration**
```bash
rails generate migration CreateFeature field:type
rails db:migrate
```

2. **Create Model**
```ruby
class Feature < ApplicationRecord
  belongs_to :user
  validates :field, presence: true
end
```

3. **Create Serializer**
```ruby
class FeatureSerializer
  def initialize(feature)
    @feature = feature
  end

  def as_json
    {
      id: @feature.id,
      field: @feature.field
    }
  end
end
```

4. **Create Controller**
```ruby
class Api::V1::FeaturesController < Api::V1::ApplicationController
  def index
    @features = Feature.all
    render json: {
      success: true,
      data: @features.map { |f| FeatureSerializer.new(f).as_json }
    }
  end
end
```

5. **Add Routes**
```ruby
namespace :api do
  namespace :v1 do
    resources :features
  end
end
```

6. **Document the endpoint** (update this file or create Swagger docs)

7. **Notify frontend developer** that endpoint is ready with:
   - Endpoint URL
   - Request format
   - Response format
   - Example curl command

---

### Frontend Developer Checklist

For each new feature:

1. **Create API module**
```javascript
// src/api/featureApi.js
export const getFeatures = async () => {
  const response = await api.get('/features');
  return response.data;
};
```

2. **Create custom hook (optional)**
```javascript
// src/hooks/useFeatures.js
export const useFeatures = () => {
  // Hook logic
};
```

3. **Create component**
```javascript
// src/components/features/FeatureList.jsx
const FeatureList = () => {
  const { features, loading } = useFeatures();
  // Component logic
};
```

4. **Add to router**
```javascript
<Route path="/features" element={<FeatureList />} />
```

---

### Communication Tips

**Backend to Frontend:**
- "✅ POST /api/v1/communities endpoint is ready"
- "📝 Here's the request format: {...}"
- "🔍 Test it with: curl http://localhost:9000/api/v1/communities"

**Frontend to Backend:**
- "🐛 Getting 422 error on POST /posts, can you check validation?"
- "📊 Can we add `followers_count` to the community response?"
- "🚀 Need pagination for /feed/home endpoint"

**Testing Together:**
1. Backend creates endpoint and tests with Postman
2. Backend shares curl command or Postman collection
3. Frontend integrates and tests
4. Both discuss any needed changes

---

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://localhost/kpop_universe_development

# JWT
DEVISE_JWT_SECRET_KEY=your-secret-key-here

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id

# Frontend URL (for OAuth redirect)
FRONTEND_URL=http://localhost:5173

# AWS (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_BUCKET=kpop-universe-dev
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:9000
VITE_APP_NAME=K-Pop Universe
```

---

## Quick Reference

### HTTP Methods

| Method | Purpose | Example |
|--------|---------|---------|
| GET | Retrieve data | Get posts, Get user |
| POST | Create new resource | Create post, Join community |
| PATCH/PUT | Update resource | Update profile |
| DELETE | Delete resource | Delete post, Leave community |

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 400 | Bad request |
| 401 | Unauthorized (no token or invalid) |
| 403 | Forbidden (not authorized) |
| 404 | Not found |
| 422 | Validation failed |
| 500 | Server error |

---

**Happy Building! 🎵**

For questions, create issues in the repo or discuss in team meetings.
